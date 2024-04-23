import type { Actions, PageServerLoad } from "./$types";
import { isAuthenticated } from "$lib/helpers";
import { error, redirect } from "@sveltejs/kit";
import { groupMembersTable } from "$lib/schema";
export const load: PageServerLoad = async (event) => {
    const { user } = isAuthenticated(event);

    const group = await event.locals.db.query.groupsTable.findFirst({
        where: (groups, { eq, and }) => and(eq(groups.id, Number(event.params.inviting_group_id)), eq(groups.invite_link_code, event.params.invite_link_code), eq(groups.invite_link_active, true)),
        with: {
            owner: true,
            members: true
        }
    });

    if (!group) error(404, 'Invite link not found');

    if (group.members.find(member => member.user_id === user.id)) error(400, 'You are already a member in this group');
    if (group.members.find(member => member.email === user.email)) error(400, 'You are already invited to this group');

    return { group }

}

export const actions: Actions = {
    'join-group': async (event) => {
        const { user } = isAuthenticated(event);

        const group = await event.locals.db.query.groupsTable.findFirst({
            where: (groups, { eq, and }) => and(eq(groups.id, Number(event.params.inviting_group_id)), eq(groups.invite_link_code, event.params.invite_link_code), eq(groups.invite_link_active, true)),
            with: {
                owner: true,
                members: true
            }
        });

        if (!group) error(404, 'Invite link not found');

        if (group.members.find(member => member.user_id === user.id)) error(400, 'You are already a member in this group');
        if (group.members.find(member => member.email === user.email)) error(400, 'You are already invited to this group');



        await event.locals.db.insert(groupMembersTable).values({ group_id: group.id, name: user.name, email: user.email, user_id: user.id });

        redirect(302, `/${group.id}`);

    }
}