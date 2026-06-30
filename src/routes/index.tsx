import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getMovie } from "@/server/tmdb.functions";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const getMovieFn = useServerFn(getMovie);

	const { data } = useQuery({
		queryKey: ["movie"],
		queryFn: () => getMovieFn({ data: { id: 2 } }),
	});

	console.log(data);

	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Welcome to Movie watchlist</h1>
		</div>
	);
}
