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
import { RESEND_API_KEY, EMAIL_DOMAIN } from '$env/static/private';
import { countryToCurrency } from '$lib/currencies';

export const load: PageServerLoad = async (event) => {
	return {
		form: await superValidate(
			{ redirect_to: event.url.searchParams.get('redirect_to') ?? undefined },
			zod(sign_up_schema),
			{ errors: false }
		)
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

		const emailVerificationToken = await event.locals.db.transaction(async (tx) => {
			const [newUser] = await tx
				.insert(userTable)
				.values({
					email: form.data.email,
					name: form.data.name,
					default_currency:
						countryToCurrency[
							(event.request.headers.get('CF-IPCountry') as keyof typeof countryToCurrency) ?? 'US'
						] ?? 'USD'
				})
				.returning();

			const [emailVerificationToken] = await tx
				.insert(emailVerificationTokensTable)
				.values({ user_id: newUser.id, email: newUser.email })
				.returning();

			return emailVerificationToken;
		});

		if (!emailVerificationToken) {
			error(500, 'Failed to generate OTP code');
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
