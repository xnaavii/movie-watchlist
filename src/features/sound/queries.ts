import { queryOptions } from "@tanstack/react-query";
import { getAtmosShowcaseFn, getTitleSoundFn } from "./server/sound.functions";
import type { TitleRef } from "./types";

export const soundQueries = {
	showcase: () =>
		queryOptions({
			queryKey: ["sound", "showcase"],
			queryFn: () => getAtmosShowcaseFn(),
			staleTime: 1000 * 60 * 5,
		}),
	title: (ref: TitleRef) =>
		queryOptions({
			queryKey: ["sound", "title", ref.mediaType, ref.tmdbId],
			queryFn: () => getTitleSoundFn({ data: ref }),
		}),
};
