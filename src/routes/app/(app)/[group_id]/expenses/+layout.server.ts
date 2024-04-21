import type { LayoutServerLoad } from './$types';
import { eq, and } from 'drizzle-orm';
import { isGroupMember } from '$lib/helpers';
import { transactionsTable } from '$lib/schema';

export const load: LayoutServerLoad = async (event) => {
	const { user, group } = isGroupMember(event);

	return {
		transactions: event.locals.db.query.transactionsTable.findMany({
			where: and(eq(transactionsTable.group_id, group.id)),
			with: {
				group_member: true,
				splits: true
			}
		})
	};
};
