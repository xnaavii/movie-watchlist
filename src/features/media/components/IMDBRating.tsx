export function IMDBRating({ rating }: { rating?: string | null }) {
	return (
		<div className="flex gap-1 items-center">
			<p className="text-muted-foreground">IMDB</p>
			<p>{rating ?? "—"}</p>
		</div>
	);
}
