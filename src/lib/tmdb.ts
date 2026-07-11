import { TMDB } from "@lorenzopant/tmdb";

export const tmdb = new TMDB(process.env.TMDB_BEARER_TOKEN!);
