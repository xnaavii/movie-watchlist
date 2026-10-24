import { SITE_CONFIG } from "#/config/site";
import { escapeHtml, sendEmail } from "./sendEmail";

type SendVerificationEmailParams = {
	to: string;
	name: string;
	url: string;
};

export async function sendVerificationEmail({
	to,
	name,
	url,
}: SendVerificationEmailParams) {
	await sendEmail({
		to,
		subject: `Verify your ${SITE_CONFIG.name} email`,
		text: `Hi ${name},\n\nConfirm your email address to finish setting up your account:\n\n${url}\n\nThe link expires in 24 hours. If you didn't sign up, you can ignore this email.`,
		html: `<p>Hi ${escapeHtml(name)},</p><p>Confirm your email address to finish setting up your account:</p><p><a href="${url}">Verify email</a></p><p>The link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>`,
	});
}
