import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { soundQueries } from "../queries";
import {
	deleteSoundRatingFn,
	rateSoundFn,
	voteAtmosFn,
} from "../server/sound.functions";
import type { SoundRatingInput, TitleRef } from "../types";

type RatingScores = Omit<SoundRatingInput, "tmdbId" | "mediaType">;

const showError = (error: unknown) =>
	toast.error(
		error instanceof Error
			? error.message
			: "Something went wrong. Please try again.",
	);

export function useSoundActions(ref: TitleRef) {
	const voteAtmos = useServerFn(voteAtmosFn);
	const rateSound = useServerFn(rateSoundFn);
	const deleteRating = useServerFn(deleteSoundRatingFn);
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const refresh = () => {
		queryClient.invalidateQueries({
			queryKey: soundQueries.title(ref).queryKey,
		});
		queryClient.invalidateQueries({
			queryKey: soundQueries.showcase().queryKey,
		});
	};

	const voteMutation = useMutation({
		mutationFn: (hasAtmos: boolean) =>
			voteAtmos({ data: { ...ref, hasAtmos } }),
		onSuccess: () => {
			refresh();
			toast.success("Thanks, your answer helps everyone find Atmos titles");
		},
		onError: showError,
	});

	const rateMutation = useMutation({
		mutationFn: (scores: RatingScores) =>
			rateSound({ data: { ...ref, ...scores } }),
		onSuccess: () => {
			refresh();
			toast.success("Sound rating saved");
		},
		onError: showError,
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteRating({ data: ref }),
		onSuccess: () => {
			refresh();
			toast.success("Sound rating removed");
		},
		onError: showError,
	});

	/** Runs the action when signed in, otherwise sends the user to log in. */
	function withSession(action: () => void) {
		if (!session) {
			navigate({
				to: "/auth/login",
				search: { redirect: window.location.pathname },
			});
			return;
		}
		action();
	}

	return {
		isSignedIn: Boolean(session),
		vote: (hasAtmos: boolean) =>
			withSession(() => voteMutation.mutate(hasAtmos)),
		rate: (scores: RatingScores) =>
			withSession(() => rateMutation.mutate(scores)),
		removeRating: () => withSession(() => deleteMutation.mutate()),
		isVoting: voteMutation.isPending,
		isRating: rateMutation.isPending || deleteMutation.isPending,
	};
}
