import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const env = vi.hoisted(() => ({
	AI: undefined as { run: ReturnType<typeof vi.fn> } | undefined,
}));
vi.mock("cloudflare:workers", () => ({ env }));

import {
	AI_MODEL,
	AiBadOutputError,
	AiNotConfiguredError,
	generateJson,
} from "./ai";

const schema = z.object({ titles: z.array(z.string()) });
const options = {
	system: "Pick films.",
	content: "Something cozy",
	schema,
	maxTokens: 200,
};

beforeEach(() => {
	env.AI = { run: vi.fn() };
});

describe("generateJson", () => {
	it("needs the Workers AI binding", async () => {
		env.AI = undefined;
		await expect(generateJson(options)).rejects.toBeInstanceOf(
			AiNotConfiguredError,
		);
	});

	it("asks the free Workers AI model for JSON matching the schema", async () => {
		env.AI?.run.mockResolvedValue({ response: { titles: ["Paddington 2"] } });

		await expect(generateJson(options)).resolves.toEqual({
			titles: ["Paddington 2"],
		});

		const [model, input] = env.AI?.run.mock.calls[0] ?? [];
		expect(model).toBe(AI_MODEL);
		expect(model).toMatch(/^@cf\//);
		expect(input.messages).toEqual([
			{ role: "system", content: "Pick films." },
			{ role: "user", content: "Something cozy" },
		]);
		expect(input.max_tokens).toBe(200);
		expect(input.response_format.type).toBe("json_schema");
		expect(input.response_format.json_schema).toMatchObject({
			type: "object",
			properties: { titles: { type: "array" } },
		});
		// Workers AI rejects the $schema keyword zod adds.
		expect(input.response_format.json_schema).not.toHaveProperty("$schema");
	});

	it("parses answers that come back as a JSON string", async () => {
		env.AI?.run.mockResolvedValue({ response: '{"titles":["Amélie"]}' });
		await expect(generateJson(options)).resolves.toEqual({
			titles: ["Amélie"],
		});

		env.AI?.run.mockResolvedValue('{"titles":["Up"]}');
		await expect(generateJson(options)).resolves.toEqual({ titles: ["Up"] });
	});

	it.each([
		["text that isn't JSON", { response: "Sure! Here are some films:" }],
		["JSON in the wrong shape", { response: { films: ["Up"] } }],
		["no answer at all", {}],
	])("rejects %s", async (_, result) => {
		env.AI?.run.mockResolvedValue(result);
		await expect(generateJson(options)).rejects.toBeInstanceOf(
			AiBadOutputError,
		);
	});

	it("passes on failures from Workers AI itself", async () => {
		env.AI?.run.mockRejectedValue(new Error("Daily allowance used"));
		await expect(generateJson(options)).rejects.toThrow("Daily allowance used");
	});
});
