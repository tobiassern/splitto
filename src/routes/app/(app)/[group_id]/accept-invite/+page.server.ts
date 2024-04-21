import type { Actions, PageServerLoad } from './$types';
import { isAuthenticated } from '$lib/helpers';
import { and, eq } from 'drizzle-orm';
import { groupMembersTable } from '$lib/schema';
import { error, redirect } from '@sveltejs/kit';
export const load: PageServerLoad = async (event) => {
	const { user } = isAuthenticated(event);

	const group_invite = await event.locals.db.query.groupMembersTable.findFirst({
		where: and(
			eq(groupMembersTable.group_id, Number(event.params.group_id)),
			eq(groupMembersTable.email, user.email)
		),
		with: {
			group: {
				with: {
					owner: true
				}
			}
		}
	});

	if (!group_invite) error(404, 'No invite found');
	if (group_invite && group_invite.user_id) error(400, 'Invite already accepted');

	return {
		group_invite
	};
};

export const actions: Actions = {
	'accept-invite': async (event) => {
		const { user } = isAuthenticated(event);
		const group_invite = await event.locals.db.query.groupMembersTable.findFirst({
			where: and(
				eq(groupMembersTable.group_id, Number(event.params.group_id)),
				eq(groupMembersTable.email, user.email)
			),
			with: {
				group: {
					with: {
						owner: true
					}
				}
			}
		});

		if (!group_invite) error(404, 'No invite found');
		if (group_invite && group_invite.user_id) error(400, 'Invite already accepted');

		await event.locals.db
			.update(groupMembersTable)
			.set({ user_id: user.id })
			.where(eq(groupMembersTable.id, group_invite.id));

		redirect(302, `/${group_invite.group_id}`);
	}
};
