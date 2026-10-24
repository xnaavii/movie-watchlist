import { SITE_CONFIG } from "#/config/site";
import { escapeHtml, sendEmail } from "./sendEmail";

type SendResetPasswordEmailParams = {
	to: string;
	name: string;
	url: string;
};

export async function sendResetPasswordEmail({
	to,
	name,
	url,
}: SendResetPasswordEmailParams) {
	await sendEmail({
		to,
		subject: `Reset your ${SITE_CONFIG.name} password`,
		text: `Hi ${name},\n\nWe received a request to reset your password. Open the link below to choose a new one:\n\n${url}\n\nThe link expires in 1 hour. If you didn't request this, you can ignore this email.`,
		html: `<p>Hi ${escapeHtml(name)},</p><p>We received a request to reset your password. Click the link below to choose a new one:</p><p><a href="${url}">Reset password</a></p><p>The link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
	});
}
