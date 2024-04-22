import { isGroupMember } from '$lib/helpers';
import {
	transactionSplitsTable,
	transactionsTable,
	groupMembersTable,
	create_settlement_schema
} from '$lib/schema';
import { eq, sum } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

function caculateSettlements(
	balances: {
		amount: number;
		id: number;
		name: string;
		email: string | null;
	}[]
) {
	// Calculate the total balance for each person
	const balanceMap: { [n: number]: number } = {};
	balances.forEach(({ id, amount }) => {
		if (balanceMap[id]) {
			balanceMap[id] += amount;
		} else {
			balanceMap[id] = amount;
		}
	});

	// Initialize arrays to track who owes whom
	const creditors: { amount: number; id: number }[] = [];
	const debtors: { amount: number; id: number }[] = [];

	// Classify each person as a creditor or a debtor
	for (const [id, balance] of Object.entries(balanceMap)) {
		if (balance > 0) {
			creditors.push({ id: parseInt(id), amount: balance });
		} else if (balance < 0) {
			debtors.push({ id: parseInt(id), amount: -balance });
		}
	}

	// Sort both arrays in descending order of amounts
	creditors.sort((a, b) => b.amount - a.amount);
	debtors.sort((a, b) => b.amount - a.amount);

	// Initialize an array to store repayments
	const repayments = [];

	// Iterate through debtors and creditors to settle balances
	for (const debtor of debtors) {
		while (debtor.amount > 0) {
			const creditor = creditors.shift();
			if (!creditor) break; // No more creditors
			const repaymentAmount = Math.min(debtor.amount, creditor.amount);
			repayments.push({
				from: balances.find((item) => item.id === debtor.id),
				to: balances.find((item) => item.id === creditor.id),
				amount: repaymentAmount
			});
			debtor.amount -= repaymentAmount;
			creditor.amount -= repaymentAmount;
			if (creditor.amount > 0) {
				creditors.push(creditor); // Add back if creditor still has balance
				creditors.sort((a, b) => b.amount - a.amount);
			}
		}
	}

	return repayments;
}
export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	const balances = await event.locals.db
		.select({
			id: groupMembersTable.id,
			name: groupMembersTable.name,
			email: groupMembersTable.email,
			amount: sum(transactionSplitsTable.amount)
		})
		.from(groupMembersTable)
		.leftJoin(
			transactionSplitsTable,
			eq(groupMembersTable.id, transactionSplitsTable.group_member_id)
		)
		.groupBy(groupMembersTable.id)
		.where(eq(groupMembersTable.group_id, group.id));
	const settles = caculateSettlements(JSON.parse(JSON.stringify(balances)));

	return {
		balances,
		settles
	};
};

export const actions: Actions = {
	create: async (event) => {
		const { group } = isGroupMember(event);
		const create_settlement_form = await superValidate(event, zod(create_settlement_schema), {
			id: 'create-settlement-form'
		});

		if (!create_settlement_form.valid) {
			return fail(400, {
				create_settlement_form
			});
		}

		const error = await event.locals.db.transaction(async (tx) => {
			const [transaction] = await tx
				.insert(transactionsTable)
				.values({
					type: 'settlement',
					group_id: group.id,
					group_member_id: create_settlement_form.data.from_id,
					label: create_settlement_form.data.label,
					when: new Date(create_settlement_form.data.when)
				})
				.returning();
			const insert_splits: (typeof transactionSplitsTable.$inferInsert)[] = [
				{
					group_member_id: create_settlement_form.data.from_id,
					amount: create_settlement_form.data.amount,
					type: 'debit',
					transaction_id: transaction.id
				},
				{
					group_member_id: create_settlement_form.data.to_id,
					amount: -create_settlement_form.data.amount,
					type: 'credit',
					transaction_id: transaction.id
				}
			];

			const check_transaction_split_sum = insert_splits.reduce((acc, split) => {
				return acc + split.amount;
			}, 0);

			if (check_transaction_split_sum !== 0) {
				await tx.rollback();
				return 'Total transaction volumne does not sum up correctly';
			}
			await tx.insert(transactionSplitsTable).values(insert_splits);

			return null;
		});

		if (error) {
			return setError(create_settlement_form, '', error);
		}

		return { create_settlement_form };
	}
};
