import { env } from "cloudflare:workers";
import { WatchmodeClient } from "@watchmode/api-client";

export const watchmode = new WatchmodeClient({
	apiKey: env.WATCHMODE_API_KEY!,
});
