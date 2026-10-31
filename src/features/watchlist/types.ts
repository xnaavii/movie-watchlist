import type { WATCHLIST_STATUSES } from "#/features/media/utils/filters";

/** Where a title sits in someone's watchlist. Safe to use on the client. */
export type WatchlistStatus = (typeof WATCHLIST_STATUSES)[number];
