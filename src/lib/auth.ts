import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import { sendResetPasswordEmail } from "@/features/auth/email/sendResetPasswordEmail";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({ to: user.email, name: user.name, url });
		},
	},
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	plugins: [tanstackStartCookies()],
});
