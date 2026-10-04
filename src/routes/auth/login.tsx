import { createFileRoute, Link } from "@tanstack/react-router";
import { VenetianMask } from "lucide-react";
import { z } from "zod";
import { LoginForm } from "#/features/auth/forms/LoginForm";

const loginSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: loginSearchSchema,
});

function LoginPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link to={"/"} className="flex items-center gap-2 font-medium">
						<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<VenetianMask className="size-4 text-sidebar-primary" />
						</div>
						Watchlist App
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/discover-desktop.png"
					alt="Showcase of the app"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
