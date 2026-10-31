import { isNotFound, isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadMediaDetails = vi.hoisted(() => vi.fn());

vi.mock("#/features/media/loaders", () => ({ loadMediaDetails }));
vi.mock("#/features/media/components/MediaDetailsPage", () => ({
	MediaDetailsPage: () => null,
	MediaDetailsPageNotFound: () => null,
	MediaDetailsPagePending: () => null,
}));

import { Route as MovieRoute } from "#/routes/_app/movies/$movieSlug";
import { Route as TVRoute } from "#/routes/_app/tv/$tvSlug";

const routes = [
	{
		mediaType: "movie",
		route: MovieRoute,
		param: "movieSlug",
		path: "/movies/$movieSlug",
		media: { id: 550, title: "Fight Club" },
		slug: "550-fight-club",
	},
	{
		mediaType: "tv",
		route: TVRoute,
		param: "tvSlug",
		path: "/tv/$tvSlug",
		media: { id: 95396, title: "Severance" },
		slug: "95396-severance",
	},
] as const;

/** Runs a route's loader the way the router would. */
async function load(
	route: (typeof routes)[number]["route"],
	params: Record<string, string>,
) {
	// biome-ignore lint/suspicious/noExplicitAny: loader context is router-built
	const loader = route.options.loader as (context: any) => Promise<unknown>;
	try {
		return await loader({ params, context: { queryClient: {} } });
	} catch (error) {
		return error;
	}
}

function parse(
	route: (typeof routes)[number]["route"],
	params: Record<string, string>,
) {
	// biome-ignore lint/suspicious/noExplicitAny: params.parse takes raw params
	const parseParams = (route.options.params as any).parse;
	try {
		return parseParams(params);
	} catch (error) {
		return error;
	}
}

beforeEach(() => {
	loadMediaDetails.mockReset();
});

describe.each(routes)("$mediaType details route", ({
	mediaType,
	route,
	param,
	path,
	media,
	slug,
}) => {
	it("loads the title for its canonical slug", async () => {
		loadMediaDetails.mockResolvedValue(media);
		const data = await load(route, { [param]: slug });
		expect(loadMediaDetails).toHaveBeenCalledWith(expect.anything(), {
			mediaType,
			id: media.id,
		});
		expect(Object.values(data as object)).toEqual([media]);
	});

	it.each([
		String(media.id),
		`${media.id}-old-title`,
	])("permanently redirects %s to the readable URL", async (oldSlug) => {
		loadMediaDetails.mockResolvedValue(media);
		const result = await load(route, { [param]: oldSlug });
		expect(isRedirect(result)).toBe(true);
		expect((result as { options: object }).options).toMatchObject({
			to: path,
			params: { [param]: slug },
			statusCode: 301,
			replace: true,
		});
	});

	it("shows not found when TMDB doesn't know the id", async () => {
		loadMediaDetails.mockRejectedValue(new Error("Not found"));
		expect(isNotFound(await load(route, { [param]: slug }))).toBe(true);
	});

	it("rejects URLs that don't start with an id", () => {
		expect(isNotFound(parse(route, { [param]: "fight-club" }))).toBe(true);
		expect(parse(route, { [param]: slug })).toEqual({ [param]: slug });
	});
});
