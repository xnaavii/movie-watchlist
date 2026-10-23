/**
 * Generates the APPLE_CLIENT_SECRET for Sign in with Apple.
 *
 * Apple's client secret is a JWT signed with your .p8 key, and Apple caps its
 * lifetime at 6 months, so run this again (and update the secret) before it
 * expires.
 *
 * Usage:
 *   APPLE_TEAM_ID=... APPLE_KEY_ID=... APPLE_CLIENT_ID=... \
 *     pnpm auth:apple-secret path/to/AuthKey_XXXXXXXXXX.p8
 */
import { createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";

const SIX_MONTHS_IN_SECONDS = 180 * 24 * 60 * 60;

const keyPath = process.argv[2];
const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID } = process.env;

if (!keyPath || !APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_CLIENT_ID) {
	console.error(
		"Usage: APPLE_TEAM_ID=... APPLE_KEY_ID=... APPLE_CLIENT_ID=... pnpm auth:apple-secret <path to .p8 key>",
	);
	process.exit(1);
}

const base64url = (value: string | Buffer) =>
	Buffer.from(value).toString("base64url");

const now = Math.floor(Date.now() / 1000);
const expiresAt = now + SIX_MONTHS_IN_SECONDS;

const header = base64url(JSON.stringify({ alg: "ES256", kid: APPLE_KEY_ID }));
const payload = base64url(
	JSON.stringify({
		iss: APPLE_TEAM_ID,
		iat: now,
		exp: expiresAt,
		aud: "https://appleid.apple.com",
		sub: APPLE_CLIENT_ID,
	}),
);

const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
	key: createPrivateKey(readFileSync(keyPath)),
	dsaEncoding: "ieee-p1363",
});

console.log(`${header}.${payload}.${base64url(signature)}`);
console.error(
	`\nExpires on ${new Date(expiresAt * 1000).toDateString()}. Generate a new one before then.`,
);
