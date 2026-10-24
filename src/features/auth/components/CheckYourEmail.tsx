import { Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

type CheckYourEmailProps = {
	email: string;
	redirect?: string;
};

/** Shown after sign up, or when an unverified account tries to log in. */
export function CheckYourEmail({ email, redirect }: CheckYourEmailProps) {
	const [isSending, setIsSending] = useState(false);

	const resend = async () => {
		setIsSending(true);
		const { error } = await authClient.sendVerificationEmail({
			email,
			callbackURL: redirect ?? "/",
		});
		setIsSending(false);

		if (error) {
			toast.error(error.message ?? "Could not send the email");
		} else {
			toast.success("Sent a new link");
		}
	};

	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div className="flex size-12 items-center justify-center rounded-full bg-muted">
				<MailCheck className="size-6" />
			</div>
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold">Check your email</h1>
				<p className="text-sm text-balance text-muted-foreground">
					We sent a link to{" "}
					<span className="font-medium text-foreground">{email}</span>. Open it
					to verify your email and you'll be signed in.
				</p>
			</div>
			<div className="flex w-full flex-col gap-3">
				<Button
					type="button"
					variant="outline"
					size="lg"
					disabled={isSending}
					onClick={resend}
				>
					{isSending ? "Sending..." : "Resend link"}
				</Button>
				<Button asChild variant="ghost" size="lg">
					<Link to="/auth/login" search={{ redirect }}>
						Back to log in
					</Link>
				</Button>
			</div>
		</div>
	);
}
