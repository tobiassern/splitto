import type { LayoutServerLoad } from './$types';
import { eq, and, inArray, exists, asc, desc } from 'drizzle-orm';
import { isGroupMember } from '$lib/helpers';
import { tagsTable, transactionTagsTable, transactionsTable } from '$lib/schema';

export const load: LayoutServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	const tags = event.url.searchParams.getAll('tag');
	const whenOrder = event.url.searchParams.get('when');

	const tagsData = await event.locals.db.select().from(transactionTagsTable).where(and(eq(transactionTagsTable.transaction_id, 16), inArray(transactionTagsTable.tag_id, [12])))
	console.log(tagsData);

	return {
		transactions: event.locals.db.query.transactionsTable.findMany({
			where: (transactions, { eq, and }) => (
				and(
					eq(transactions.group_id, group.id),
					tags?.length ? exists(event.locals.db.select().from(transactionTagsTable).where(and(eq(transactionTagsTable.transaction_id, transactions.id), inArray(transactionTagsTable.tag_id, tags.map(tag => Number(tag)))))) : undefined
				)
			),
			with: {
				group_member: true,
				splits: true,
				tags: {
					with: {
						tag: true
					}
				}
			},
			orderBy: [whenOrder === 'asc' ? asc(transactionsTable.when) : desc(transactionsTable.when)]
		})
	};
};
