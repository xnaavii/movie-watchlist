import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import neon from "./neon-vite-plugin.ts";

/** Changes every build, so browsers pick up the new service worker. */
const BUILD_ID = Date.now().toString(36);

/**
 * Lists the client's built JS and CSS in /sw-assets.json, so the service
 * worker can save every page's code for offline use, not just pages opened.
 */
function serviceWorkerAssets(): Plugin {
	return {
		name: "service-worker-assets",
		applyToEnvironment: (environment) => environment.name === "client",
		generateBundle(_options, bundle) {
			const files = Object.keys(bundle)
				.filter((file) => /\.(js|css)$/.test(file))
				.map((file) => `/${file}`);
			this.emitFile({
				type: "asset",
				fileName: "sw-assets.json",
				source: JSON.stringify({ build: BUILD_ID, files }),
			});
		},
	};
}

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		neon,
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		serviceWorkerAssets(),
	],
});

export default config;
