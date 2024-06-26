import { RESEND_API_KEY, EMAIL_DOMAIN } from '$env/static/private';
import { PUBLIC_APP_HOSTNAME } from '$env/static/public';

const sendEmail = async ({
	from,
	to,
	subject,
	text,
	html
}: {
	from: string;
	to: string[];
	subject: string;
	text?: string;
	html?: string;
}) => {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${RESEND_API_KEY}`
		},
		body: JSON.stringify({
			from: from,
			to: to,
			subject: subject,
			html,
			text
		})
	});

	const result = await res.json();
	console.log('## EMAIL RESULT ## ', result);
};

export const sendEmailLoginOTP = async ({ to, otp }: { to: string; otp: string }) => {
	await sendEmail({
		from: `Splitto <no-reply@${EMAIL_DOMAIN}>`,
		to: [to],
		subject: 'OTP Code for Splitto',
		html: `
        <p>Your code is ${otp}</p>
        <p><a href="https://${PUBLIC_APP_HOSTNAME}/sign-in/verify-email/?email=${to}&code=${otp}">Link to verify your email</></p>
        `
	});
};
