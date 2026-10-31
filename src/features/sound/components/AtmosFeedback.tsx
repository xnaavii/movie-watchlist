import { useQuery } from "@tanstack/react-query";
import { AudioLines } from "lucide-react";
import { type ReactNode, type SubmitEvent, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { FieldLegend, FieldSet } from "#/components/ui/field";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "#/components/ui/item";
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
import { formatScore } from "../utils/sound";
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

/** Compact prompt that opens the Atmos vote and sound rating in a dialog. */
export function AtmosFeedback(ref: TitleRef) {
	const { data } = useQuery(soundQueries.title(ref));
	const summary =
		data && data.sound.count > 0
			? `Sound ${formatScore(data.sound.overall)} / ${OVERALL_MAX} from ${data.sound.count} ${data.sound.count === 1 ? "rating" : "ratings"}`
			: "Tell us if it has an Atmos track and how it sounds";

	return (
		<Dialog>
			<Item
				variant="outline"
				className="rounded-3xl border-primary/20 bg-primary/10 p-4 md:p-5"
			>
				<ItemMedia className="size-10 rounded-full bg-primary text-primary-foreground">
					<AudioLines className="size-5" aria-hidden="true" />
				</ItemMedia>
				<ItemContent>
					<ItemTitle className="text-base tracking-tight">
						Help improve the Dolby Atmos experience
					</ItemTitle>
					<ItemDescription>{summary}</ItemDescription>
				</ItemContent>
				<ItemActions>
					<DialogTrigger asChild>
						<Button variant="contrast">Share feedback</Button>
					</DialogTrigger>
				</ItemActions>
			</Item>
			<AtmosFeedbackDialogContent titleRef={ref} />
		</Dialog>
	);
}

function AtmosFeedbackDialogContent({ titleRef }: { titleRef: TitleRef }) {
	const { data, isLoading, isError } = useQuery(soundQueries.title(titleRef));

	return (
		<DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-hidden px-0 pt-8 pb-4 sm:max-w-xl">
			<DialogHeader className="px-8">
				<div className="flex flex-wrap items-center gap-2">
					<DialogTitle className="text-lg">Dolby Atmos and sound</DialogTitle>
					{data?.isAtmos && <AtmosBadge />}
				</div>
				<DialogDescription>
					How it sounds at home, rated by people who watched it
				</DialogDescription>
			</DialogHeader>
			<div className="mx-2 min-h-0 overflow-y-auto overscroll-contain px-6 pb-4">
				{isLoading && (
					<div className="h-32 rounded-3xl bg-muted animate-pulse" />
				)}
				{isError && (
					<p className="text-sm text-muted-foreground">
						Sound ratings aren't available right now.
					</p>
				)}
				{data && <FeedbackForm titleRef={titleRef} sound={data} />}
			</div>
		</DialogContent>
	);
}

function FeedbackForm({
	titleRef,
	sound,
}: {
	titleRef: TitleRef;
	sound: TitleSound;
}) {
	const actions = useSoundActions(titleRef);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-6">
				{sound.curatedNote && (
					<p className="text-pretty border-l-2 border-primary pl-4">
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

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		if (draft.overall == null) return;
		onSave({ ...draft, overall: draft.overall });
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5 border-t pt-6">
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
		<FieldSet className="gap-0">
			<FieldLegend variant="label">
				{label}
				{hint && (
					<span className="ml-2 font-normal text-muted-foreground">{hint}</span>
				)}
			</FieldLegend>
			<div className="flex flex-wrap gap-2">{children}</div>
		</FieldSet>
	);
}
