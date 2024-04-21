import { isSuperAdmin } from "$lib/helpers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { user, session } = isSuperAdmin(event);

    return {
        users: await event.locals.db.query.userTable.findMany(),
        groups: await event.locals.db.query.groupsTable.findMany({
            with: { owner: true }
        })
    }
}