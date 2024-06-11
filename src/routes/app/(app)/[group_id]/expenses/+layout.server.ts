import type { LayoutServerLoad } from './$types';
import { inArray, exists, asc, desc } from 'drizzle-orm';
import { isGroupMember } from '$lib/helpers';
import { transactionTagsTable, transactionsTable } from '$lib/schema';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	const search = event.url.searchParams.get('s');
	const tags = event.url.searchParams.getAll('tag');
	const from = event.url.searchParams.get('from');
	const to = event.url.searchParams.get('to');
	const whenOrder = event.url.searchParams.get('when');
	const page = Number(event.url.searchParams.get('page'));
	if (page && page < 1 || isNaN(page)) error(400, 'Invalid page search param');

	return {
		transactions: await event.locals.db.transaction(async (tx) => {
			const data = await tx.query.transactionsTable.findMany({
				limit: 50,
				offset: 50 * (page ? Number(page) - 1 : 0),
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
			});

			return data;
		})
	};
};
