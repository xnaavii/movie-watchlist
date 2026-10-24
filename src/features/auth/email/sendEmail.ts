import { env } from "cloudflare:workers";

type SendEmailParams = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, text, html }),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to send "${subject}" email: ${response.status} ${await response.text()}`,
		);
	}
}

export function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}
