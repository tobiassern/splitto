import { RESEND_API_KEY } from '$env/static/private';
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

	await res.json();
};

export const sendEmailLoginOTP = async ({ to, otp }: { to: string; otp: string }) => {
	await sendEmail({
		from: 'Project NEO <no-reply@leadser.io>',
		to: [to],
		subject: 'OTP Code for Project NEO',
		html: `
        <p>Your OTP code: ${otp}</p>
        <p><a href="https://${PUBLIC_APP_HOSTNAME}/sign-in/verify-email/?email=${to}&code=${otp}">Link to verify your email</></p>
        `
	});
};
