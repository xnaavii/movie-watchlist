import { Loader2 } from "lucide-react";
import type { Ref } from "react";
import { Button } from "./ui/button";

interface InfiniteScrollFooterProps {
	ref: Ref<HTMLDivElement>;
	isFetchingNextPage: boolean;
	isError: boolean;
	onRetry: () => void;
}

/** Sentinel for infinite lists, with loading and retry states. */
export function InfiniteScrollFooter({
	ref,
	isFetchingNextPage,
	isError,
	onRetry,
}: InfiniteScrollFooterProps) {
	return (
		<div ref={ref} className="flex min-h-10 items-center justify-center">
			{isError ? (
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<span>Couldn&apos;t load more movies.</span>
					<Button variant="secondary" size="sm" onClick={onRetry}>
						Try again
					</Button>
				</div>
			) : isFetchingNextPage ? (
				<Loader2
					className="size-5 animate-spin text-muted-foreground"
					aria-label="Loading more movies"
				/>
			) : null}
		</div>
	);
}
