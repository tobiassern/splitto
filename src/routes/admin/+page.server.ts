import { isSuperAdmin } from '$lib/helpers';
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { groupsTable, userTable } from '$lib/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	isSuperAdmin(event);

	return {
		users: await event.locals.db.query.userTable.findMany(),
		groups: await event.locals.db.query.groupsTable.findMany({
			with: { owner: true }
		})
	};
};

export const actions: Actions = {
	'delete-user': async (event) => {
		const { user } = isSuperAdmin(event);
		const formData = await event.request.formData();
		const user_id = formData.get('user_id')?.toString();

		if (!user_id) error(400, 'No user ID provided');

		if (Number(user_id) === user.id) {
			error(400, 'You can not remove yourself');
		}

		await event.locals.db.delete(userTable).where(eq(userTable.id, Number(user_id)));

		return { success: true };
	},
	'delete-group': async (event) => {
		isSuperAdmin(event);
		const formData = await event.request.formData();
		const group_id = formData.get('group_id')?.toString();

		if (!group_id) error(400, 'No group ID provided');

		await event.locals.db.delete(groupsTable).where(eq(groupsTable.id, Number(group_id)));

		return { success: true };
	}
};
