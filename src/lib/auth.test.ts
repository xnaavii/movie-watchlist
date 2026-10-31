import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const state = {
		emailVerified: false as boolean | undefined,
		deleted: [] as unknown[],
	};
	const db = {
		select: () => ({
			from: () => ({
				where: async () =>
					state.emailVerified === undefined
						? []
						: [{ emailVerified: state.emailVerified }],
			}),
		}),
		delete: (table: { [key: symbol]: unknown }) => ({
			where: async () => {
				const name = Object.getOwnPropertySymbols(table).find(
					(symbol) => symbol.description === "drizzle:Name",
				);
				state.deleted.push(name ? table[name] : table);
			},
		}),
	};
	return { state, db, env: {} as Record<string, string | undefined> };
});

vi.mock("cloudflare:workers", () => ({ env: mocks.env }));
vi.mock("@/db", () => ({ db: mocks.db }));
vi.mock("@/features/auth/email/sendResetPasswordEmail", () => ({
	sendResetPasswordEmail: vi.fn(),
}));
vi.mock("@/features/auth/email/sendVerificationEmail", () => ({
	sendVerificationEmail: vi.fn(),
}));

async function loadAuth(env: Record<string, string | undefined> = {}) {
	vi.resetModules();
	for (const key of Object.keys(mocks.env)) delete mocks.env[key];
	Object.assign(mocks.env, env);
	return await import("./auth");
}

beforeEach(() => {
	mocks.state.emailVerified = false;
	mocks.state.deleted = [];
});

describe("auth config", () => {
	it("keeps sessions in a short-lived signed cookie to skip most DB lookups", async () => {
		const { auth } = await loadAuth();
		expect(auth.options.session?.cookieCache).toEqual({
			enabled: true,
			maxAge: 5 * 60,
		});
	});

	it("requires a verified email for password sign-in", async () => {
		const { auth } = await loadAuth();
		expect(auth.options.emailAndPassword).toMatchObject({
			enabled: true,
			requireEmailVerification: true,
			revokeSessionsOnPasswordReset: true,
		});
	});

	it("only offers Google when its credentials are set", async () => {
		expect((await loadAuth()).enabledSocialProviders).toEqual({
			google: false,
		});
		expect(
			(await loadAuth({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "" }))
				.enabledSocialProviders,
		).toEqual({ google: false });

		const { auth, enabledSocialProviders } = await loadAuth({
			GOOGLE_CLIENT_ID: "id",
			GOOGLE_CLIENT_SECRET: "secret",
		});
		expect(enabledSocialProviders).toEqual({ google: true });
		expect(auth.options.socialProviders?.google).toMatchObject({
			clientId: "id",
			prompt: "select_account",
		});
	});
});

describe("linking Google to an existing account", () => {
	async function linkAccount(providerId: string) {
		const { auth } = await loadAuth();
		const before = auth.options.databaseHooks?.account?.create?.before;
		if (!before) throw new Error("No account create hook");
		await before({ providerId, userId: "user-1" } as Parameters<
			typeof before
		>[0]);
	}

	it("drops a password nobody proved they own, and its sessions", async () => {
		mocks.state.emailVerified = false;
		await linkAccount("google");
		expect(mocks.state.deleted).toEqual(["account", "session"]);
	});

	it("keeps the password when the email was verified", async () => {
		mocks.state.emailVerified = true;
		await linkAccount("google");
		expect(mocks.state.deleted).toEqual([]);
	});

	it("leaves new password accounts alone", async () => {
		await linkAccount("credential");
		expect(mocks.state.deleted).toEqual([]);
	});

	it("does nothing for a brand new user", async () => {
		mocks.state.emailVerified = undefined;
		await linkAccount("google");
		expect(mocks.state.deleted).toEqual([]);
	});
});
