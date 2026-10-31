import type { MediaItem, MediaRef } from "#/features/media/types";
import { mediaKey } from "#/features/media/utils";
import {
	normalizeYearRange,
	releaseYear,
	type WatchlistFilters,
} from "#/features/media/utils/filters";
import type { WatchlistStatus } from "../types";

/**
 * A signed-out visitor's watchlist, kept in this browser's localStorage.
 * Creating an account moves it to the server so it syncs across devices.
 */

const STORAGE_KEY = "watchlist:guest";
const STORAGE_VERSION = 1;

export type GuestEntry = {
	media: MediaItem;
	status: WatchlistStatus;
	/** ISO timestamps, so the list survives JSON. */
	addedAt: string;
	watchedAt: string | null;
};

type StoredList = { version: number; entries: GuestEntry[] };

/** What callers can pass when saving: a ref, plus whatever card data they have. */
export type GuestMediaInput = MediaRef &
	Partial<Omit<MediaItem, "mediaType" | "id">> & {
		genres?: { id: number }[];
	};

function storage(): Storage | undefined {
	try {
		return typeof window === "undefined" ? undefined : window.localStorage;
	} catch {
		return undefined;
	}
}

export function readGuestEntries(): GuestEntry[] {
	const raw = storage()?.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as StoredList;
		return parsed.version === STORAGE_VERSION && Array.isArray(parsed.entries)
			? parsed.entries
			: [];
	} catch {
		return [];
	}
}

function writeGuestEntries(entries: GuestEntry[]) {
	const store = storage();
	if (!store) throw new Error("Saving needs browser storage to be turned on");
	if (entries.length === 0) {
		store.removeItem(STORAGE_KEY);
		return;
	}
	store.setItem(
		STORAGE_KEY,
		JSON.stringify({ version: STORAGE_VERSION, entries } satisfies StoredList),
	);
}

/** Keeps only what cards, filters and the sync need. */
function toStoredMedia(input: GuestMediaInput): MediaItem {
	return {
		mediaType: input.mediaType,
		id: input.id,
		title: input.title ?? "Untitled",
		posterPath: input.posterPath ?? null,
		backdropPath: input.backdropPath ?? null,
		releaseDate: input.releaseDate ?? null,
		voteAverage: input.voteAverage,
		genreIds: input.genreIds ?? input.genres?.map((genre) => genre.id),
	};
}

const findIndex = (entries: GuestEntry[], ref: MediaRef) =>
	entries.findIndex((entry) => mediaKey(entry.media) === mediaKey(ref));

export function getGuestStatus(ref: MediaRef): WatchlistStatus | null {
	const entries = readGuestEntries();
	return entries[findIndex(entries, ref)]?.status ?? null;
}

export function getGuestStatuses(): Record<string, WatchlistStatus> {
	return Object.fromEntries(
		readGuestEntries().map((entry) => [mediaKey(entry.media), entry.status]),
	);
}

/** Adds a title, or changes its status when it's already saved. */
export function saveGuestEntry(
	input: GuestMediaInput,
	status: WatchlistStatus = "want_to_watch",
	now = new Date(),
) {
	const entries = readGuestEntries();
	const index = findIndex(entries, input);
	const watchedAt = status === "watched" ? now.toISOString() : null;

	if (index === -1) {
		entries.unshift({
			media: toStoredMedia(input),
			status,
			addedAt: now.toISOString(),
			watchedAt,
		});
	} else {
		entries[index] = { ...entries[index], status, watchedAt };
	}
	writeGuestEntries(entries);
}

export function removeGuestEntry(ref: MediaRef) {
	const entries = readGuestEntries();
	const index = findIndex(entries, ref);
	if (index === -1) return;
	entries.splice(index, 1);
	writeGuestEntries(entries);
}

export function clearGuestEntries() {
	storage()?.removeItem(STORAGE_KEY);
}

function compareBy(sort: WatchlistFilters["sort"]) {
	const byDate = (direction: 1 | -1) => (a: GuestEntry, b: GuestEntry) => {
		const left = a.media.releaseDate;
		const right = b.media.releaseDate;
		// Undated titles go last whichever direction is picked.
		if (!left) return right ? 1 : 0;
		if (!right) return -1;
		return left.localeCompare(right) * direction;
	};
	switch (sort) {
		case "title":
			return (a: GuestEntry, b: GuestEntry) =>
				a.media.title.localeCompare(b.media.title);
		case "newest":
			return byDate(-1);
		case "oldest":
			return byDate(1);
		default:
			return (a: GuestEntry, b: GuestEntry) =>
				b.addedAt.localeCompare(a.addedAt);
	}
}

/** The guest list with the watchlist page's filters and sort applied. */
export function filterGuestEntries(
	entries: GuestEntry[],
	filters: WatchlistFilters = {},
) {
	const { from, to } = normalizeYearRange(filters.from, filters.to);
	return entries
		.filter((entry) => {
			const { media } = entry;
			if (filters.status && entry.status !== filters.status) return false;
			if (filters.type && media.mediaType !== filters.type) return false;
			if (filters.genre && !media.genreIds?.includes(filters.genre))
				return false;
			const year = releaseYear(media.releaseDate);
			if (from && (!year || year < from)) return false;
			if (to && (!year || year > to)) return false;
			return true;
		})
		.sort(compareBy(filters.sort));
}

/** Same shape as the server's watchlist pages. */
export function getGuestWatchlistPage(
	page: number,
	filters: WatchlistFilters = {},
	pageSize = 20,
) {
	const all = filterGuestEntries(readGuestEntries(), filters);
	const start = (page - 1) * pageSize;
	return {
		results: all
			.slice(start, start + pageSize)
			.map(({ status, media }) => ({ status, media })),
		page,
		hasMore: start + pageSize < all.length,
	};
}

/** Saved titles in a discover genre, whose ids differ for movies and TV. */
export function getGuestMediaByGenre(
	genreIds: Record<MediaItem["mediaType"], number[]>,
): MediaItem[] {
	return filterGuestEntries(readGuestEntries())
		.map((entry) => entry.media)
		.filter((media) =>
			media.genreIds?.some((id) => genreIds[media.mediaType].includes(id)),
		);
}
