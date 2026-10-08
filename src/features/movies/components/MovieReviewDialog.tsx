import type { ReactNode } from "react";
import Markdown from "react-markdown";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { MovieReview } from "../types";
import { formatReviewDate } from "../utils/format";

interface MovieReviewDialogProps {
	review: MovieReview;
	children: ReactNode;
}

export function MovieReviewDialog({
	review,
	children,
}: MovieReviewDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-hidden px-0 pt-8 pb-4 sm:max-w-xl">
				<DialogHeader className="px-8">
					<DialogTitle>{review.authorName}</DialogTitle>
					<DialogDescription>
						{formatReviewDate(review.createdAt)}
					</DialogDescription>
				</DialogHeader>
				<div className="prose prose-sm dark:prose-invert mx-2 min-h-0 max-w-none overflow-y-auto overscroll-contain px-6 pb-4 leading-relaxed">
					<Markdown>{review.content}</Markdown>
				</div>
			</DialogContent>
		</Dialog>
	);
}
