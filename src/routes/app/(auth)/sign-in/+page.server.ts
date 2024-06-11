import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { emailVerificationTokensTable, sign_in_schema, userTable } from '$lib/schema/auth';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { sendEmailLoginOTP } from '$lib/server/mail/index.js';
import { EMAIL_DOMAIN, RESEND_API_KEY } from '$env/static/private';
export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(sign_in_schema))
	};
};

export const actions: Actions = {
	'sign-in-email': async (event) => {
		if (event.locals.user) {
			error(400, 'Already signed in');
		}
		const { request } = event;
		const form = await superValidate(request, zod(sign_in_schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = await event.locals.db.query.userTable.findFirst({
			where: eq(userTable.email, form.data.email)
		});

		if (!user) {
			redirect(302, `/sign-up?email=${form.data.email}`);
		}

		await event.locals.db
			.delete(emailVerificationTokensTable)
			.where(eq(emailVerificationTokensTable.user_id, user.id));

		const [emailVerificationToken] = await event.locals.db
			.insert(emailVerificationTokensTable)
			.values({ user_id: user.id, email: user.email })
			.returning();

		if (!emailVerificationToken) {
			setError(form, '', 'Failed to generate OTP code');
		}


		await sendEmailLoginOTP({
			to: emailVerificationToken.email,
			otp: emailVerificationToken.code
		});
		redirect(302, `/sign-in/verify-email?email=${emailVerificationToken.email}`);

	}
};
