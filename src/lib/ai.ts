import { env } from "cloudflare:workers";
import { z } from "zod";

/** Workers AI model used for picks. Runs on Cloudflare's free daily allowance. */
export const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export class AiNotConfiguredError extends Error {}
export class AiBadOutputError extends Error {}

/**
 * Asks the model for JSON matching `schema` and validates it. Open models
 * occasionally drift from the schema, so the answer is always checked.
 */
export async function generateJson<Schema extends z.ZodType>(options: {
	system: string;
	content: string;
	schema: Schema;
	maxTokens: number;
}): Promise<z.infer<Schema>> {
	if (!env.AI) throw new AiNotConfiguredError();
	const { $schema: _, ...jsonSchema } = z.toJSONSchema(options.schema);

	const result = await env.AI.run(AI_MODEL, {
		messages: [
			{ role: "system", content: options.system },
			{ role: "user", content: options.content },
		],
		response_format: {
			type: "json_schema",
			json_schema: jsonSchema,
		},
		max_tokens: options.maxTokens,
		temperature: 0.4,
	});

	const raw =
		typeof result === "string"
			? result
			: "response" in result
				? result.response
				: undefined;
	let json: unknown = raw;
	if (typeof raw === "string") {
		try {
			json = JSON.parse(raw);
		} catch {
			throw new AiBadOutputError();
		}
	}
	const parsed = options.schema.safeParse(json);
	if (!parsed.success) throw new AiBadOutputError();
	return parsed.data;
}
