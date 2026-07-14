import { env as workerEnv } from "cloudflare:workers";

export function getEnv() {
	// wrangler dev / deployed Worker: cloudflare:workers env is populated
	// plain `vite dev` without wrangler: fall back to process.env
	return typeof workerEnv !== "undefined"
		? workerEnv
		: (process.env as unknown as typeof workerEnv);
}