import type { LayoutServerLoad } from './$types';
import { eq, and, inArray } from 'drizzle-orm';
import { isGroupMember } from '$lib/helpers';
import { transactionTagsTable, transactionsTable } from '$lib/schema';

export const load: LayoutServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	const tags = event.url.searchParams.getAll('tag');

	return {
		transactions: event.locals.db.query.transactionsTable.findMany({
			where: and(eq(transactionsTable.group_id, group.id), tags?.length ? inArray(transactionTagsTable.tag_id, tags.map((tag) => Number(tag))) : undefined),
			with: {
				group_member: true,
				splits: true,
				tags: {
					with: {
						tag: true
					}
				}
			}
		})
	};
};
