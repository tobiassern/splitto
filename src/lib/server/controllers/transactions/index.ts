import type { ServerLoadEvent, RequestEvent } from '@sveltejs/kit';
import {
	transactionsTable,
	transactionSplitsTable,
	transactionTagsTable,
	create_transaction_schema,
	groupMembersTable
} from '$lib/schema';
import { isGroupMember } from '$lib/helpers';
import { z } from 'zod';
import { sql, and, eq } from 'drizzle-orm';

import { notifyGroupMembers } from '../notifications';

export const createTransaction = async (
	event: ServerLoadEvent | RequestEvent,
	data: z.infer<typeof create_transaction_schema>
) => {
	const { group } = isGroupMember(event);
	const error = await event.locals.db.transaction(async (tx) => {
		const [transaction] = await tx
			.insert(transactionsTable)
			.values({
				type: data.type,
				group_id: group.id,
				group_member_id: data.group_member_id,
				label: data.label,
				when: new Date(data.when)
			})
			.returning();

		if (data.tags.length) {
			await tx.insert(transactionTagsTable).values(
				data.tags.map((tag_id) => {
					return { tag_id, transaction_id: transaction.id };
				})
			);
		}

		const insert_splits: (typeof transactionSplitsTable.$inferInsert)[] = data.splits
			.filter((split) => split.amount !== null)
			.map((split) => {
				return {
					amount: -Number(split.amount),
					group_member_id: Number(split.group_member_id),
					transaction_id: transaction.id,
					type: 'credit'
				};
			});

		insert_splits.push({
			amount: data.amount,
			type: 'debit',
			transaction_id: transaction.id,
			group_member_id: data.group_member_id
		});
		console.log('## SPLITS ## ', insert_splits);
		const check_transaction_split_sum = insert_splits.reduce((acc, split) => {
			return acc + split.amount;
		}, 0);
		if (check_transaction_split_sum !== 0) {
			console.log(check_transaction_split_sum);
			await tx.rollback();
			return 'Total transaction volumne does not sum up correctly';
		}
		await tx.insert(transactionSplitsTable).values(insert_splits);
		for await (const insert_split of insert_splits) {
			console.log('UPDATE BALANCE');
			const test = await tx
				.update(groupMembersTable)
				.set({ balance: sql`${groupMembersTable.balance} + ${insert_split.amount}` })
				.where(
					and(
						eq(groupMembersTable.group_id, group.id),
						eq(groupMembersTable.id, insert_split.group_member_id)
					)
				)
				.returning();
			console.log(test);
		}
		return null;
	});

	await notifyGroupMembers(event, 'Hej', [
		...data.splits.map((split) => split.group_member_id),
		data.group_member_id
	]);

	return { error };
};
