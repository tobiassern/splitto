import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { transactionsTable } from '$lib/schema';
import { isGroupMember } from '$lib/helpers';
import { error } from '@sveltejs/kit';
export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);


	const transaction = await event.locals.db.query.transactionsTable.findFirst({
		where: and(
			eq(transactionsTable.id, Number(event.params.transaction_id)),
			eq(transactionsTable.group_id, group.id)
		),
		with: {
			tags: {
				with: {
					tag: true
				}
			},
			group_member: true,
			splits: {
				with: {
					group_member: true
				}
			}
		}
	});
	if (!transaction) {
		error(404, 'Transaction not found');
	}
	return {
		transaction
	};
};

export const actions: Actions = {
	delete: async (event) => {
		const { group } = isGroupMember(event);

		const expense = await event.locals.db.query.transactionsTable.findFirst({
			where: and(
				eq(transactionsTable.id, Number(event.params.transaction_id)),
				eq(transactionsTable.group_id, group.id)
			)
		});

		if (!expense) {
			error(404, 'Transaction not found');
		}

		await event.locals.db
			.delete(transactionsTable)
			.where(and(eq(transactionsTable.id, expense.id), eq(transactionsTable.group_id, group.id)));

		return { success: true };
	}
};
