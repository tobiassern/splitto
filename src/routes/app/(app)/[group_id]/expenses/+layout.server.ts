import type { LayoutServerLoad } from './$types';
import { inArray, exists, asc, desc } from 'drizzle-orm';
import { isGroupMember } from '$lib/helpers';
import { transactionTagsTable, transactionsTable } from '$lib/schema';

export const load: LayoutServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	const search = event.url.searchParams.get('s');
	const tags = event.url.searchParams.getAll('tag');
	const from = event.url.searchParams.get('from');
	const to = event.url.searchParams.get('to');
	const whenOrder = event.url.searchParams.get('when');

	return {
		transactions: event.locals.db.query.transactionsTable.findMany({
			where: (transactions, { eq, and, like, gte, lte }) =>
				and(
					eq(transactions.group_id, group.id),
					search ? like(transactions.label, `%${search}%`) : undefined,
					from ? gte(transactions.when, new Date(from)) : undefined,
					to ? lte(transactions.when, new Date(to)) : undefined,
					tags?.length
						? exists(
								event.locals.db
									.select()
									.from(transactionTagsTable)
									.where(
										and(
											eq(transactionTagsTable.transaction_id, transactions.id),
											inArray(
												transactionTagsTable.tag_id,
												tags.map((tag) => Number(tag))
											)
										)
									)
							)
						: undefined
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
