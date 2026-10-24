import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { type ReactNode, type SubmitEvent, useState } from "react";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { getSiteUrl, SITE_CONFIG } from "#/config/site";
import { PickPill } from "#/features/picks/components/PickPill";
import { PickResults } from "#/features/picks/components/PickResults";
import {
	MAX_PROMPT_LENGTH,
	PICK_COMPANY,
	PICK_MOODS,
	PICK_TIMES,
	type PickRequest,
} from "#/features/picks/types";
import { seo } from "#/utils/seo";

const MAX_MOODS = 3;

export const Route = createFileRoute("/_app/pick")({
	component: PickPage,
	head: () => ({
		meta: seo({
			title: `Pick something to watch | ${SITE_CONFIG.name}`,
			description:
				"Describe your mood and get a short list of picks, with a reason for each.",
			url: `${getSiteUrl()}/pick`,
		}),
	}),
});

function PickPage() {
	const [form, setForm] = useState<PickRequest>({
		prompt: "",
		moods: [],
		time: "any",
		company: undefined,
		useWatchlist: false,
	});
	const [submitted, setSubmitted] = useState<PickRequest | null>(null);
	const [attempt, setAttempt] = useState(0);

	function toggleMood(mood: PickRequest["moods"][number]) {
		setForm((prev) => {
			if (prev.moods.includes(mood)) {
				return { ...prev, moods: prev.moods.filter((m) => m !== mood) };
			}
			if (prev.moods.length >= MAX_MOODS) return prev;
			return { ...prev, moods: [...prev.moods, mood] };
		});
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted({ ...form, prompt: form.prompt.trim() });
		setAttempt(0);
	}

	return (
		<div className="flex flex-col gap-10 p-4 md:p-6 lg:p-8 mt-12 md:mt-0 max-w-6xl">
			<form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
				<header className="flex flex-col gap-2">
					<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
						What should I watch?
					</h1>
					<p className="text-muted-foreground text-pretty">
						Describe what you're in the mood for, or tap a few options. You'll
						get a short list with a reason for each pick.
					</p>
				</header>

				<div className="flex flex-col gap-2">
					<label htmlFor="pick-prompt" className="text-sm font-medium">
						In your own words
					</label>
					<Textarea
						id="pick-prompt"
						value={form.prompt}
						maxLength={MAX_PROMPT_LENGTH}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, prompt: e.target.value }))
						}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								e.currentTarget.form?.requestSubmit();
							}
						}}
						placeholder="A cozy 90s mystery under 2 hours, something like Knives Out…"
						rows={2}
					/>
				</div>

				<PillGroup label="Mood" hint={`Up to ${MAX_MOODS}`}>
					{PICK_MOODS.map((mood) => (
						<PickPill
							key={mood}
							selected={form.moods.includes(mood)}
							onClick={() => toggleMood(mood)}
						>
							{mood}
						</PickPill>
					))}
				</PillGroup>

				<PillGroup label="Time">
					{PICK_TIMES.map((option) => (
						<PickPill
							key={option.value}
							selected={form.time === option.value}
							onClick={() =>
								setForm((prev) => ({ ...prev, time: option.value }))
							}
						>
							{option.label}
						</PickPill>
					))}
				</PillGroup>

				<PillGroup label="Watching with">
					{PICK_COMPANY.map((company) => (
						<PickPill
							key={company}
							selected={form.company === company}
							onClick={() =>
								setForm((prev) => ({
									...prev,
									company: prev.company === company ? undefined : company,
								}))
							}
						>
							{company}
						</PickPill>
					))}
				</PillGroup>

				<PillGroup label="Watchlist">
					<PickPill
						selected={form.useWatchlist}
						onClick={() =>
							setForm((prev) => ({ ...prev, useWatchlist: !prev.useWatchlist }))
						}
					>
						Prefer movies on my watchlist
					</PickPill>
				</PillGroup>

				<div>
					<Button type="submit" variant="contrast" size="lg">
						<Sparkles />
						Pick for me
					</Button>
				</div>
			</form>

			{submitted && (
				<PickResults
					request={submitted}
					attempt={attempt}
					onPickAgain={() => setAttempt((n) => n + 1)}
				/>
			)}
		</div>
	);
}

function PillGroup({
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
