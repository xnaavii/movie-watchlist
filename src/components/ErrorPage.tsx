import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "./ui/button";

export function ErrorPage({ error }: ErrorComponentProps) {
	const router = useRouter();
	const queryErrorResetBoundary = useQueryErrorResetBoundary();

	useEffect(() => {
		queryErrorResetBoundary.reset();
	}, [queryErrorResetBoundary]);

	return (
		<div className="flex flex-col items-center justify-center gap-4 min-h-[60svh] text-center px-4">
			<h1 className="text-3xl font-medium tracking-tighter">
				Something went wrong
			</h1>
			<p className="text-muted-foreground max-w-prose">
				An unexpected error occurred. Try again, or head back home.
			</p>
			{import.meta.env.DEV && (
				<pre className="max-w-full overflow-x-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
					{error.message}
				</pre>
			)}
			<div className="flex gap-2">
				<Button onClick={() => router.invalidate()}>Try again</Button>
				<Button variant="outline" asChild>
					<Link to="/discover">Go home</Link>
				</Button>
			</div>
		</div>
	);
}
