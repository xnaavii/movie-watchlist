import { Button } from "#/components/ui/button";

interface JustWatchButtonProps {
	title: string;
}

export function JustWatchButton({ title }: JustWatchButtonProps) {
	return (
		<Button asChild variant="outline">
			<a
				href={`https://www.justwatch.com/ie/search?q=${encodeURIComponent(title)}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				JustWatch
			</a>
		</Button>
	);
}
