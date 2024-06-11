import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { verify_email_schema, userTable, emailVerificationTokensTable } from '$lib/schema/auth';
import { redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
export const load: PageServerLoad = async (event) => {
	return {
		form: await superValidate(
			{ redirect_to: event.url.searchParams.get('redirect_to') ?? undefined },
			zod(verify_email_schema),
			{ errors: false }
		)
	};
};

export const actions: Actions = {
	'verify-email': async (event) => {
		if (event.locals.user) {
			error(400, 'Already signed in');
		}

		const { request } = event;
		const form = await superValidate(request, zod(verify_email_schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email_verification_token =
			await event.locals.db.query.emailVerificationTokensTable.findFirst({
				where: and(
					eq(emailVerificationTokensTable.code, form.data.otp),
					eq(emailVerificationTokensTable.email, form.data.email)
				)
			});

		if (!email_verification_token || !email_verification_token.created_at) {
			return setError(form, '', 'Invalid OTP code');
		}

		if (
			new Date(new Date().getTime() + 5 * 60000) < new Date(email_verification_token.created_at)
		) {
			return setError(form, '', 'OTP code expired');
		}

		await event.locals.db
			.delete(emailVerificationTokensTable)
			.where(eq(emailVerificationTokensTable.id, email_verification_token.id));

		const user = await event.locals.db.query.userTable.findFirst({
			where: eq(userTable.id, email_verification_token.user_id)
		});

		if (!user) {
			return setError(form, '', 'Invalid user');
		}

		if (user && user.email !== email_verification_token.email) {
			return setError(form, '', 'User email mismatch');
		}

		await event.locals.db
			.update(userTable)
			.set({ email_verified: true })
			.where(eq(userTable.id, user.id));

		const session = await event.locals.lucia.createSession(user.id, {
			user_agent: event.request.headers.get('user-agent')
		});
		const sessionCookie = event.locals.lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, form.data.redirect_to ?? '/');
	}
};
