import { WatchmodeClient } from "@watchmode/api-client";

export const watchmode = new WatchmodeClient({
	apiKey: process.env.WATCHMODE_API_KEY!,
});
