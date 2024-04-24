import type { LayoutServerLoad } from './$types';
import { isAuthenticated } from '$lib/helpers';
import { groupsTable } from '$lib/schema';
import { groupMembersTable } from '$lib/schema';
import { eq, desc } from 'drizzle-orm';
export const load: LayoutServerLoad = async (event) => {
	const { user } = isAuthenticated(event);
	return {
		groups: await event.locals.db
			.select({
				name: groupsTable.name,
				id: groupsTable.id
			})
			.from(groupsTable)
			.leftJoin(groupMembersTable, eq(groupMembersTable.group_id, groupsTable.id))
			.where(eq(groupMembersTable.user_id, user.id))
			.orderBy(desc(groupsTable.created_at))
	};
};
