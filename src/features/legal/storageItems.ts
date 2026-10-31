export type StorageItem = {
	name: string;
	kind: string;
	purpose: string;
	lasts: string;
};

/** Everything the app itself stores in the browser. Keep in sync with the code. */
export const STORAGE_ITEMS: StorageItem[] = [
	{
		name: "better-auth.session_token",
		kind: "Cookie",
		purpose: "Keeps you signed in. Only set when you sign in.",
		lasts: "7 days, renewed while you use the app",
	},
	{
		name: "better-auth.session_data",
		kind: "Cookie",
		purpose:
			"A signed copy of your session, so pages load without a database lookup.",
		lasts: "5 minutes",
	},
	{
		name: "Sign-in state",
		kind: "Cookie",
		purpose:
			"Protects the Google sign-in round trip against forgery. Only during sign-in.",
		lasts: "A few minutes",
	},
	{
		name: "watchlist:guest",
		kind: "Local storage",
		purpose:
			"Your watchlist while signed out. Moves to your account when you sign in.",
		lasts: "Until you sign in or clear it",
	},
	{
		name: "Offline caches",
		kind: "Cache storage",
		purpose:
			"Pages, posters and data you've viewed, so the app opens and works offline.",
		lasts: "Until replaced by newer copies, or you clear it",
	},
];
