import { env } from "cloudflare:workers";

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
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM,
			to,
			subject: "Reset your Watchlist App password",
			text: `Hi ${name},\n\nWe received a request to reset your password. Open the link below to choose a new one:\n\n${url}\n\nThe link expires in 1 hour. If you didn't request this, you can ignore this email.`,
			html: `<p>Hi ${escapeHtml(name)},</p><p>We received a request to reset your password. Click the link below to choose a new one:</p><p><a href="${url}">Reset password</a></p><p>The link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to send reset password email: ${response.status} ${await response.text()}`,
		);
	}
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}
