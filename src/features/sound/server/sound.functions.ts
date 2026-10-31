import { createServerFn } from "@tanstack/react-start";
import { ensureSession, getSession } from "#/lib/auth.functions";
import {
	atmosVoteInputSchema,
	soundRatingInputSchema,
	titleRefSchema,
} from "../types";
import { sortShowcase } from "../utils/sound";
import {
	deleteSoundRating,
	ensureAtmosTitle,
	fetchTitleMeta,
	resolvePendingSeeds,
	selectAtmosShowcase,
	selectTitleSound,
	titleIsStored,
	upsertAtmosVote,
	upsertSoundRating,
} from "./sound.server";

export const getAtmosShowcaseFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await resolvePendingSeeds();
		return sortShowcase(await selectAtmosShowcase());
	},
);

export const getTitleSoundFn = createServerFn({ method: "GET" })
	.validator(titleRefSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		return await selectTitleSound(data, session?.user.id ?? null);
	});

export const voteAtmosFn = createServerFn({ method: "POST" })
	.validator(atmosVoteInputSchema)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		const { hasAtmos, ...ref } = data;

		if (hasAtmos && !(await titleIsStored(ref))) {
			await ensureAtmosTitle(ref, await fetchTitleMeta(ref));
		}
		await upsertAtmosVote(session.user.id, data);
	});

export const rateSoundFn = createServerFn({ method: "POST" })
	.validator(soundRatingInputSchema)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		await upsertSoundRating(session.user.id, data);
	});

export const deleteSoundRatingFn = createServerFn({ method: "POST" })
	.validator(titleRefSchema)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		await deleteSoundRating(session.user.id, data);
	});
