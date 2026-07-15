import { env } from "cloudflare:workers";
import { TMDB } from "@lorenzopant/tmdb";

export const tmdb = new TMDB(env.TMDB_BEARER_TOKEN!, {
	images: {
		autocomplete_paths: true,
		default_image_sizes: {
			posters: "w342",
			backdrops: "w1280",
		},
	},
});
