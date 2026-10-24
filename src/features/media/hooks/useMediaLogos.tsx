import { useQueries } from "@tanstack/react-query";
import { mediaQueries } from "#/features/media/queries";
import type { MediaRef } from "../types";
import { buildLogoMap } from "../utils";

export function useMediaLogos(items: MediaRef[]) {
	const results = useQueries({
		queries: items.map((item) => mediaQueries.images(item)),
	});
	return buildLogoMap(items, results);
}
