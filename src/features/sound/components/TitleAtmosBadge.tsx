import { useQuery } from "@tanstack/react-query";
import { soundQueries } from "../queries";
import type { TitleRef } from "../types";
import { AtmosBadge } from "./AtmosBadge";

/** Shows the Atmos badge once the title is known to have an Atmos track. */
export function TitleAtmosBadge(ref: TitleRef) {
	const { data } = useQuery(soundQueries.title(ref));
	return data?.isAtmos ? <AtmosBadge /> : null;
}
