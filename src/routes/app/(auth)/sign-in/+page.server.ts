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
export const load: PageServerLoad = async (event) => {
	return {
		form: await superValidate(
			{ redirect_to: event.url.searchParams.get('redirect_to') ?? undefined },
			zod(sign_in_schema),
			{ errors: false }
		)
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
		console.log(form.data.redirect_to);
		if (!user) {
			const url = new URL(event.url);
			url.pathname = '/sign-up';
			url.searchParams.set('email', form.data.email);
			if (form.data.redirect_to) url.searchParams.set('redirect_to', form.data.redirect_to);
			redirect(302, url);
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

		const url = new URL(event.url);
		url.pathname = '/sign-in/verify-email';
		url.searchParams.set('email', emailVerificationToken.email);
		if (form.data.redirect_to) url.searchParams.set('redirect_to', form.data.redirect_to);

		if (dev && (!RESEND_API_KEY || !EMAIL_DOMAIN)) {
			url.searchParams.set('code', emailVerificationToken.code);
			redirect(302, url);
		} else {
			await sendEmailLoginOTP({
				to: emailVerificationToken.email,
				otp: emailVerificationToken.code
			});

			redirect(302, url);
		}
	}
};
