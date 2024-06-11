import { PUBLIC_ADMIN_HOSTNAME, PUBLIC_APP_HOSTNAME } from '$env/static/public';
import { initializeLucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { groupMembersTable, groupsTable } from '$lib/schema';
import { eq, asc } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	if ([PUBLIC_APP_HOSTNAME, PUBLIC_ADMIN_HOSTNAME].includes(event.url.hostname)) {
		event.locals.group = null;
		event.locals.db = db;
		event.locals.lucia = initializeLucia();
		const sessionId = event.cookies.get(event.locals.lucia.sessionCookieName);
		if (!sessionId) {
			event.locals.user = null;
			event.locals.session = null;
		} else {
			const { session, user } = await event.locals.lucia.validateSession(sessionId);
			if (session && session.fresh) {
				const sessionCookie = event.locals.lucia.createSessionCookie(session.id);
				// sveltekit types deviates from the de-facto standard
				// you can use 'as any' too
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
			if (!session) {
				const sessionCookie = event.locals.lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
			event.locals.user = user;
			event.locals.session = session;

			if (event.locals.user && event.locals.session && event.params.group_id) {
				const group = await event.locals.db.query.groupsTable.findFirst({
					where: eq(groupsTable.id, Number(event.params.group_id)),
					with: {
						owner: true,
						tags: true,
						members: {
							orderBy: [asc(groupMembersTable.created_at)],
							with: {
								user: true
							}
						}
					}
				});

				if (!group) error(404, 'Group not found');
				if (
					group &&
					!group.members.find((member) => member.user_id === event.locals.user?.id) &&
					!event.url.pathname.endsWith('/accept-invite')
				)
					error(403, 'Not authorized');
				event.locals.group = group;
			}
		}
	}
	return resolve(event);
};
