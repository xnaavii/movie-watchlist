import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "#/components/ui/button";
import { PickPill } from "#/features/picks/components/PickPill";
import { useSoundActions } from "../hooks/useSoundActions";
import { soundQueries } from "../queries";
import {
	LISTENING_SETUPS,
	OVERALL_MAX,
	type SoundRatingInput,
	SUB_SCORE_MAX,
	SUB_SCORES,
	type TitleRef,
	type TitleSound,
} from "../types";
import { AtmosBadge } from "./AtmosBadge";
import { SoundScores } from "./SoundScores";

type RatingDraft = Omit<
	SoundRatingInput,
	"tmdbId" | "mediaType" | "overall"
> & {
	overall: number | null;
};

const EMPTY_DRAFT: RatingDraft = {
	overall: null,
	immersion: null,
	bass: null,
	dialogue: null,
	setup: null,
};

const range = (max: number) => Array.from({ length: max }, (_, i) => i + 1);

/** Community sound score, Atmos vote and the viewer's own sound rating. */
export function SoundPanel(ref: TitleRef) {
	const { data, isLoading, isError } = useQuery(soundQueries.title(ref));

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<div className="flex flex-wrap items-center gap-3">
					<h2 className="text-2xl tracking-tighter">Sound</h2>
					{data?.isAtmos && <AtmosBadge />}
				</div>
				<p className="text-sm text-muted-foreground">
					How it sounds at home, rated by people who watched it
				</p>
			</div>

			{isLoading && (
				<div className="h-32 max-w-sm rounded-3xl bg-muted animate-pulse" />
			)}
			{isError && (
				<p className="text-sm text-muted-foreground">
					Sound ratings aren't available right now.
				</p>
			)}
			{data && <SoundPanelContent titleRef={ref} sound={data} />}
		</section>
	);
}

function SoundPanelContent({
	titleRef,
	sound,
}: {
	titleRef: TitleRef;
	sound: TitleSound;
}) {
	const actions = useSoundActions(titleRef);

	return (
		<div className="grid gap-10 lg:grid-cols-2">
			<div className="flex flex-col gap-6">
				{sound.curatedNote && (
					<p className="text-pretty">
						<span className="font-medium">What to listen for: </span>
						<span className="text-muted-foreground">{sound.curatedNote}</span>
					</p>
				)}
				<SoundScores sound={sound.sound} />
				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium">
						Does it have a Dolby Atmos track?
					</p>
					<div className="flex flex-wrap items-center gap-2">
						<PickPill
							selected={sound.myVote === true}
							onClick={() => actions.vote(true)}
						>
							Yes{sound.votes.yes > 0 && ` · ${sound.votes.yes}`}
						</PickPill>
						<PickPill
							selected={sound.myVote === false}
							onClick={() => actions.vote(false)}
						>
							No{sound.votes.no > 0 && ` · ${sound.votes.no}`}
						</PickPill>
					</div>
				</div>
			</div>

			<SoundRatingForm
				// Reset the form when the saved rating changes.
				key={JSON.stringify(sound.myRating)}
				initial={sound.myRating ?? EMPTY_DRAFT}
				hasRating={Boolean(sound.myRating)}
				isSaving={actions.isRating}
				onSave={actions.rate}
				onRemove={actions.removeRating}
			/>
		</div>
	);
}

function SoundRatingForm({
	initial,
	hasRating,
	isSaving,
	onSave,
	onRemove,
}: {
	initial: RatingDraft;
	hasRating: boolean;
	isSaving: boolean;
	onSave: (scores: Omit<SoundRatingInput, "tmdbId" | "mediaType">) => void;
	onRemove: () => void;
}) {
	const [draft, setDraft] = useState<RatingDraft>(initial);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (draft.overall == null) return;
		onSave({ ...draft, overall: draft.overall });
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5 rounded-3xl border p-5 md:p-6"
		>
			<h3 className="text-lg font-medium tracking-tight">
				{hasRating ? "Your sound rating" : "Rate the sound"}
			</h3>

			<ScoreGroup label="Overall" hint={`1 to ${OVERALL_MAX}`}>
				{range(OVERALL_MAX).map((n) => (
					<PickPill
						key={n}
						selected={draft.overall === n}
						onClick={() => setDraft((d) => ({ ...d, overall: n }))}
					>
						{n}
					</PickPill>
				))}
			</ScoreGroup>

			{SUB_SCORES.map(({ key, label, hint }) => (
				<ScoreGroup key={key} label={label} hint={hint}>
					{range(SUB_SCORE_MAX).map((n) => (
						<PickPill
							key={n}
							selected={draft[key] === n}
							onClick={() =>
								setDraft((d) => ({ ...d, [key]: d[key] === n ? null : n }))
							}
						>
							{n}
						</PickPill>
					))}
				</ScoreGroup>
			))}

			<ScoreGroup label="Listening on">
				{LISTENING_SETUPS.map((setup) => (
					<PickPill
						key={setup.value}
						selected={draft.setup === setup.value}
						onClick={() =>
							setDraft((d) => ({
								...d,
								setup: d.setup === setup.value ? null : setup.value,
							}))
						}
					>
						{setup.label}
					</PickPill>
				))}
			</ScoreGroup>

			<div className="flex flex-wrap gap-2">
				<Button
					type="submit"
					variant="contrast"
					disabled={draft.overall == null || isSaving}
				>
					{hasRating ? "Update rating" : "Save rating"}
				</Button>
				{hasRating && (
					<Button
						type="button"
						variant="ghost"
						disabled={isSaving}
						onClick={onRemove}
					>
						Remove
					</Button>
				)}
			</div>
		</form>
	);
}

function ScoreGroup({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="text-sm font-medium mb-2">
				{label}
				{hint && (
					<span className="ml-2 font-normal text-muted-foreground">{hint}</span>
				)}
			</legend>
			<div className="flex flex-wrap gap-2">{children}</div>
		</fieldset>
	);
}
