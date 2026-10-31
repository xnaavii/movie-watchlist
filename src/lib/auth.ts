import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account, session, user } from "@/db/schema";
import { sendResetPasswordEmail } from "@/features/auth/email/sendResetPasswordEmail";
import { sendVerificationEmail } from "@/features/auth/email/sendVerificationEmail";

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
		requireEmailVerification: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({ to: user.email, name: user.name, url });
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		// Unverified users who try to log in get a fresh link
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		expiresIn: 60 * 60 * 24,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({ to: user.email, name: user.name, url });
		},
	},
	socialProviders: { google },
	session: {
		// Keeps the session in a signed cookie for a few minutes, so most
		// requests skip the session lookup in Postgres. Revoking a session
		// elsewhere takes up to this long to reach other devices.
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	account: {
		accountLinking: {
			// Let Google sign in to an existing account with the same email even
			// if it was never verified. Google has verified the address, and the
			// hook below drops any password nobody proved they own.
			requireLocalEmailVerified: false,
		},
	},
	databaseHooks: {
		account: {
			create: {
				before: async (newAccount) => {
					if (newAccount.providerId === "credential") return;
					await removeUnverifiedPassword(newAccount.userId);
				},
			},
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

/**
 * When a provider links to an account whose email was never verified, whoever
 * set its password never proved they own the address. Remove that password and
 * its sessions so only the verified owner keeps access. They can set a new
 * password with "Forgot password".
 */
async function removeUnverifiedPassword(userId: string) {
	const [existing] = await db
		.select({ emailVerified: user.emailVerified })
		.from(user)
		.where(eq(user.id, userId));
	if (!existing || existing.emailVerified) return;

	await db
		.delete(account)
		.where(
			and(eq(account.userId, userId), eq(account.providerId, "credential")),
		);
	await db.delete(session).where(eq(session.userId, userId));
}
