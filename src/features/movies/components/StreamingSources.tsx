import { useQuery } from "@tanstack/react-query";
import { watchmodeStreamingSourcesQueryOptions } from "../queries";

type StreamingSourcesProps = {
	tmdbId: string;
};

export function StreamingSources({ tmdbId }: StreamingSourcesProps) {
	const { data, isLoading, isError, error } = useQuery(
		watchmodeStreamingSourcesQueryOptions(tmdbId),
	);

	if (isLoading) {
		const skeletonItems = Array.from({ length: 4 }, (_, i) => ({
			id: i,
		}));

		return (
			<div className="flex flex-col gap-6 p-6">
				<div className="max-w-50 w-full animate-pulse bg-muted rounded-4xl" />
				<div className="flex flex-wrap gap-3">
					{skeletonItems.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-center gap-2 size-25 rounded-full bg-muted animate-pulse"
						></div>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return <p>{error.message}</p>;
	}

	const streamingSources = data || [];

	if (streamingSources.length > 0) {
		return (
			<div className="flex flex-col gap-6 p-6">
				<p className="text-xl tracking-tight font-medium">Available on</p>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-3 items-start justify-items-center">
					{Array.from(
						new Map(
							streamingSources.map((source) => [source.name, source]),
						).values(),
					).map((source) => (
						<a
							key={source.source_id}
							href={source.web_url || ""}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center aspect-square w-full max-w-50 rounded-full bg-muted text-sm p-4 text-center hover:bg-muted/80 transition-colors"
						>
							<span>{source.name}</span>
						</a>
					))}
				</div>
			</div>
		);
	}
}
