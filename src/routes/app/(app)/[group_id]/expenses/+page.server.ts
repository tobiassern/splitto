import type { PageServerLoad, Actions } from './$types';
import { isGroupMember } from '$lib/helpers';
import { create_expense_schema, transactionSplitsTable, transactionsTable } from '$lib/schema';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	isGroupMember(event);

	return {};
};

export const actions: Actions = {
	create: async (event) => {
		const { user, group } = isGroupMember(event);
		const create_expense_form = await superValidate(event, zod(create_expense_schema), {
			id: 'create-expense-form'
		});

		if (!create_expense_form.valid) {
			return fail(400, {
				create_expense_form
			});
		}

		const [result, error] = await event.locals.db.transaction(async (tx) => {
			const [transaction] = await tx
				.insert(transactionsTable)
				.values({
					type: 'expense',
					group_id: group.id,
					group_member_id: create_expense_form.data.group_member_id,
					label: create_expense_form.data.label
				})
				.returning();
			const insert_splits: (typeof transactionSplitsTable.$inferInsert)[] =
				create_expense_form.data.splits
					.filter((split) => split.amount !== null)
					.map((split) => {
						return {
							amount: -Number(split.amount),
							group_member_id: split.group_member_id,
							transaction_id: transaction.id,
							type: 'credit'
						};
					});
			insert_splits.push({
				amount: create_expense_form.data.amount,
				type: 'debit',
				transaction_id: transaction.id,
				group_member_id: create_expense_form.data.group_member_id
			});
			const check_transaction_split_sum = insert_splits.reduce((acc, split) => {
				return acc + split.amount;
			}, 0);

			if (check_transaction_split_sum !== 0) {
				await tx.rollback();
				return [null, 'Total transaction volumne does not sum up correctly'];
			}
			const splits = await tx.insert(transactionSplitsTable).values(insert_splits);

			return [{ ...transaction, splits: splits }, null];
		});

		if (error) {
			return setError(create_expense_form, '', error);
		}

		return { create_expense_form };
	}
};
