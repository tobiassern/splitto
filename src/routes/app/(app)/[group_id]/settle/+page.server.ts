import { isGroupMember } from '$lib/helpers';
import { groupMembersTable, create_transaction_schema } from '$lib/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createTransaction } from '$lib/server/controllers/transactions';

function caculateSettlements(groupMember: (typeof groupMembersTable.$inferSelect)[]) {
	// Calculate the total balance for each person
	const balanceMap: { [n: number]: number } = {};
	groupMember.forEach(({ id, balance }) => {
		if (balanceMap[id]) {
			balanceMap[id] += balance;
		} else {
			balanceMap[id] = balance;
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
				from: groupMember.find((item) => item.id === debtor.id),
				to: groupMember.find((item) => item.id === creditor.id),
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

	const group_members = await event.locals.db.query.groupMembersTable.findMany({
		where: eq(groupMembersTable.group_id, group.id)
	});

	const settles = caculateSettlements(JSON.parse(JSON.stringify(group_members)));

	return {
		settles,
		group_members
	};
};

export const actions: Actions = {
	create: async (event) => {
		isGroupMember(event);
		const create_settlement_form = await superValidate(event, zod(create_transaction_schema), {
			id: 'create-settlement-form'
		});

		if (!create_settlement_form.valid) {
			return fail(400, {
				create_settlement_form
			});
		}

		const { error } = await createTransaction(event, create_settlement_form.data);

		if (error) {
			return setError(create_settlement_form, '', error);
		}

		return { create_settlement_form };
	}
};
