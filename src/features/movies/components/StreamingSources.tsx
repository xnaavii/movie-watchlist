import { useQuery } from "@tanstack/react-query";
import { watchmodeStreamingSourcesQueryOptions } from "../queries";

type StreamingSourcesProps = {
	tmdbId: string;
};

export function StreamingSources({ tmdbId }: StreamingSourcesProps) {
	const { data, isPending, isError, error } = useQuery(
		watchmodeStreamingSourcesQueryOptions(tmdbId),
	);

	if (isPending) {
		const skeletonItems = Array.from({ length: 4 }, (_, i) => ({
			id: i,
		}));

		return (
			<div className="flex flex-col gap-6 p-6">
				<p className="text-xl tracking-tight font-medium">Available on</p>
				<div className="flex flex-wrap gap-3">
					{skeletonItems.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-center gap-2 size-25 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
						>
							<div className="w-15 h-2 animate-pulse bg-muted-foreground rounded-4xl"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return <p>{error.message}</p>;
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<p className="text-xl tracking-tight font-medium">Available on</p>
			<div className="flex flex-wrap gap-3">
				{Array.from(
					new Map(data.map((source) => [source.name, source])).values(),
				).map((source) => (
					<a
						key={source.source_id}
						href={source.web_url || ""}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 size-25 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
					>
						<span className="text-center">{source.name}</span>
					</a>
				))}
			</div>
		</div>
	);
}
