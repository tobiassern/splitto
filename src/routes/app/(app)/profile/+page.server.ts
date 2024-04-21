import { superValidate, setError } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { update_user_name_schema, update_user_email__schema, userTable, sessionTable } from '$lib/schema';
import { isAuthenticated } from '$lib/helpers';

import { and, eq } from 'drizzle-orm';
import { redirect, error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { user } = isAuthenticated(event);
	return {
		sessions: await event.locals.lucia.getUserSessions(user.id),
		update_user_name_form: await superValidate(user, zod(update_user_name_schema)),
		update_user_email_form: await superValidate(user, zod(update_user_email__schema))
	};
};

export const actions: Actions = {
	'update-name': async (event) => {
		const { user } = isAuthenticated(event);

		const update_user_name_form = await superValidate(event, zod(update_user_name_schema));

		if (!update_user_name_form.valid) {
			return fail(400, { update_user_name_form });
		}

		await event.locals.db
			.update(userTable)
			.set(update_user_name_form.data)
			.where(eq(userTable.id, user.id));

		return { update_user_name_form };
	},
	'update-email': async (event) => {
		const { user } = isAuthenticated(event);
		const update_user_email_form = await superValidate(event, zod(update_user_email__schema));

		if (!update_user_email_form.valid) {
			return fail(400, { update_user_email_form });
		}

		if (update_user_email_form.data.email === user.email) {
			return setError(update_user_email_form, 'email', 'Same as your current email');
		}

		const error = await event.locals.db.transaction(async (tx) => {
			const email_exists = await tx.query.userTable.findFirst({
				where: eq(userTable.email, update_user_email_form.data.email)
			});
			if (email_exists) {
				return 'Email is already used';
			}

			await tx
				.update(userTable)
				.set({ email: update_user_email_form.data.email })
				.where(eq(userTable.id, user.id));
			return null;
		});

		if (error) {
			return setError(update_user_email_form, 'email', error);
		}

		await event.locals.lucia.invalidateUserSessions(user.id);

		const session = await event.locals.lucia.createSession(user.id, {
			user_agent: event.request.headers.get('user-agent')
		});
		const sessionCookie = event.locals.lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		event.locals.session = session;

		return { update_user_email_form };
	},
	'sign-out-all-sessions': async (event) => {
		const { user } = isAuthenticated(event);

		await event.locals.lucia.invalidateUserSessions(user.id);

		redirect(302, '/sign-in');

	},
	'sign-out-session': async (event) => {
		const { user, session } = isAuthenticated(event);

		const formData = await event.request.formData();
		const session_id = await formData.get('session_id')?.toString();

		if (!session_id) {
			error(400, 'No session ID provided');
		}

		const session_to_delete = await event.locals.db.query.sessionTable.findFirst({ where: and(eq(sessionTable.id, session_id), eq(sessionTable.userId, user.id)) });
		if (!session_to_delete) {
			error(400, 'No session found');
		}
		await event.locals.lucia.invalidateSession(session_to_delete.id);

		if (session_to_delete.id === session.id) {
			redirect(302, '/sign-in');
		} else {
			return { success: true }
		}

	}
};
