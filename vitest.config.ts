import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
		alias: {
			"cloudflare:workers": new URL(
				"./src/__tests__/cloudflareWorkers.ts",
				import.meta.url,
			).pathname,
		},
	},
	plugins: [tailwindcss(), viteReact()],
	test: {
		environment: "jsdom",
    globals: true,
		setupFiles: ["./vitest.setup.ts"],
	},
});