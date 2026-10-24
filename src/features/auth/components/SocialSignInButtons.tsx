import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { FieldSeparator } from "#/components/ui/field";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";

type SocialProvider = "google";

type SocialSignInButtonsProps = {
	providers: Record<SocialProvider, boolean>;
	redirect?: string;
	className?: string;
};

/**
 * "Continue with Google" button, styled after Google's branding guidelines. Renders nothing when no provider is configured.
 */
export function SocialSignInButtons({
	providers,
	redirect,
	className,
}: SocialSignInButtonsProps) {
	const [pending, setPending] = useState<SocialProvider | null>(null);

	if (!providers.google) return null;

	const signIn = async (provider: SocialProvider) => {
		setPending(provider);
		const origin = window.location.origin;
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: sameOriginURL(redirect, origin),
			errorCallbackURL: `${origin}/auth/login`,
		});

		// On success the browser is already navigating to the provider
		if (error) {
			setPending(null);
			toast.error(error.message ?? "Could not start sign in");
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col gap-3">
				{providers.google && (
					<Button
						type="button"
						size="lg"
						variant="outline"
						disabled={pending !== null}
						onClick={() => signIn("google")}
						className="border-[#747775] bg-white text-[#1F1F1F] hover:bg-[#F2F2F2] hover:text-[#1F1F1F] dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-[#1F1F20] dark:hover:text-[#E3E3E3]"
					>
						<GoogleLogo className="size-4" />
						{pending === "google" ? "Redirecting..." : "Continue with Google"}
					</Button>
				)}
			</div>
			<FieldSeparator>or continue with email</FieldSeparator>
		</div>
	);
}

// Only follow redirects that stay on this site
function sameOriginURL(path: string | undefined, origin: string) {
	const url = new URL(path ?? "/", origin);
	return url.origin === origin ? url.toString() : `${origin}/`;
}

function GoogleLogo({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
			/>
			<path
				fill="#FBBC05"
				d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</svg>
	);
}
