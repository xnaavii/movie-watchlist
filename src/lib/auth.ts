import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import { sendResetPasswordEmail } from "@/features/auth/email/sendResetPasswordEmail";

const PRODUCTION_URL = "https://watchlist.xnaavii.com";

// Social providers are only registered when their credentials are set, so
// the buttons stay hidden on environments that haven't been configured yet.
const google =
	env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				prompt: "select_account" as const,
			}
		: undefined;

export const enabledSocialProviders = {
	google: !!google,
};

export type SocialProvider = keyof typeof enabledSocialProviders;

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({ to: user.email, name: user.name, url });
		},
	},
	socialProviders: { google },
	account: {
		accountLinking: {
			// Email sign-ups aren't verified, so without this Google refuses to
			// link to an existing account with the same address. Google has
			// verified the email, which also marks the local account verified.
			requireLocalEmailVerified: false,
		},
	},
	// Preview deployments, which sign in through the production callback
	trustedOrigins: ["https://*.petrovic-valpovo.workers.dev"],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	plugins: [
		// Google only accepts exact redirect URLs, so previews route
		// the OAuth callback through production and get the session handed back.
		// Local dev talks to Google directly.
		...(import.meta.env.DEV
			? []
			: [oAuthProxy({ productionURL: PRODUCTION_URL })]),
		tanstackStartCookies(),
	],
});
