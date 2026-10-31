/**
 * Whether the browser has a signed-in user, as Better Auth's session hook last
 * reported it. Watchlist queries read it to choose between the server and the
 * guest list on this device without an extra request. `AuthStateSync` keeps it
 * up to date.
 */

type ClientUser = { id: string } | null;

let known = false;
let currentUser: ClientUser = null;
let waiters: (() => void)[] = [];

export function setClientUser(user: ClientUser) {
	currentUser = user;
	known = true;
	for (const resolve of waiters) resolve();
	waiters = [];
}

/** How long to wait for the first session check before asking the server. */
const SESSION_WAIT_MS = 5000;

/**
 * Waits for the first session check, then returns the user or null. Returns
 * undefined if the check hasn't finished in time.
 */
export async function getClientUser(): Promise<ClientUser | undefined> {
	if (!known) {
		await Promise.race([
			new Promise<void>((resolve) => waiters.push(resolve)),
			new Promise<void>((resolve) => setTimeout(resolve, SESSION_WAIT_MS)),
		]);
	}
	return known ? currentUser : undefined;
}

export const isServer = () => typeof window === "undefined";

/**
 * Runs the server version on the server and for signed-in users, and the
 * guest version in a signed-out browser.
 */
export async function forUserOrGuest<T>(
	server: () => Promise<T>,
	guest: () => T | Promise<T>,
): Promise<T> {
	if (isServer()) return server();
	// Unknown falls back to the server, which checks the session itself.
	return (await getClientUser()) === null ? guest() : server();
}

/** For tests. */
export function resetClientUser() {
	known = false;
	currentUser = null;
	waiters = [];
}
