import { Card, CardContent, CardHeader } from "#/components/ui/card";
import type { MediaReview } from "../types";
import { formatReviewDate, stripMarkdown } from "../utils/format";
import { MediaReviewAuthor } from "./MediaReviewAuthor";
import { MediaReviewDialog } from "./MediaReviewDialog";

export function MediaReviewCard({ review }: { review: MediaReview }) {
	return (
		<Card className="group relative h-full gap-6 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(7)]">
			<MediaReviewDialog review={review}>
				<button
					type="button"
					className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] outline-none"
					aria-label={`Read ${review.authorName}'s full review`}
				/>
			</MediaReviewDialog>
			<div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] inset-ring-2 inset-ring-muted transition-all duration-200 group-hover:inset-ring-foreground group-has-focus-visible:inset-ring-foreground" />
			<CardHeader>
				<MediaReviewAuthor
					name={review.authorName}
					avatarSrc={review.avatarSrc}
					date={formatReviewDate(review.createdAt)}
				/>
			</CardHeader>
			<CardContent>
				<p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-6">
					{stripMarkdown(review.content)}
				</p>
			</CardContent>
		</Card>
	);
}
