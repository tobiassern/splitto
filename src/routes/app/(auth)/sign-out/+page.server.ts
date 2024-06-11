import type { Actions } from '@sveltejs/kit';
import { redirect, fail } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await event.locals.lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = event.locals.lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/sign-in');
	}
};
