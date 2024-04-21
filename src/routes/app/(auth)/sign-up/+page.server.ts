import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { sign_up_schema, userTable, emailVerificationTokensTable } from '$lib/schema/auth';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { sendEmailLoginOTP } from '$lib/server/mail';
import { RESEND_API_KEY } from '$env/static/private';
export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(sign_up_schema))
	};
};

export const actions: Actions = {
	'sign-up-email': async (event) => {
		const form = await superValidate(event, zod(sign_up_schema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const user = await event.locals.db.query.userTable.findFirst({
			where: eq(userTable.email, form.data.email)
		});
		if (user) {
			return setError(form, '', 'User already exist. Try to sign in instead.');
		}

		const [newUser, emailVerificationToken] = await event.locals.db.transaction(async (tx) => {
			const [newUser] = await tx
				.insert(userTable)
				.values({
					email: form.data.email,
					name: form.data.name
				})
				.returning();

			const [emailVerificationToken] = await tx
				.insert(emailVerificationTokensTable)
				.values({ user_id: newUser.id, email: newUser.email })
				.returning();

			return [newUser, emailVerificationToken];
		});

		if (!emailVerificationToken) {
			error(500, 'Failed to generate OTP code');
		}

		if (dev || !RESEND_API_KEY) {
			redirect(
				302,
				`/sign-in/verify-email?email=${emailVerificationToken.email}&code=${emailVerificationToken.code}`
			);
		} else {
			await sendEmailLoginOTP({
				to: emailVerificationToken.email,
				otp: emailVerificationToken.code
			});
			redirect(302, `/sign-in/verify-email?email=${emailVerificationToken.email}`);
		}
	}
};
