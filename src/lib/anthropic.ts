import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "./env";

export const AI_MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

/** Null when ANTHROPIC_API_KEY is not set, so AI features can switch off cleanly. */
export function getAnthropic(): Anthropic | null {
	if (client) return client;
	const apiKey = getEnv().ANTHROPIC_API_KEY;
	if (!apiKey) return null;
	client = new Anthropic({ apiKey });
	return client;
}
