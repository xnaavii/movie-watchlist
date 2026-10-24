import { useForm } from "@tanstack/react-form";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { CheckYourEmail } from "#/features/auth/components/CheckYourEmail";
import { SocialSignInButtons } from "#/features/auth/components/SocialSignInButtons";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";

const formSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

const routeApi = getRouteApi("/auth/login");
const authRouteApi = getRouteApi("/auth");

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const { redirect, error: oauthError } = routeApi.useSearch();
	const { socialProviders } = authRouteApi.useLoaderData();
	const [unverifiedEmail, setUnverifiedEmail] = useState<string>();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const { data, error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				callbackURL: redirect ?? "/",
			});

			// Better Auth has already emailed a fresh verification link
			if (error?.code === "EMAIL_NOT_VERIFIED") {
				setUnverifiedEmail(value.email);
			} else if (error) {
				toast.error(`Message: ${error.message}, Status: ${error.status}`);
			} else {
				router.history.push(redirect ?? "/");
				toast.success(`Logged in as ${data.user.email}`);
			}
		},
	});

	if (unverifiedEmail) {
		return <CheckYourEmail email={unverifiedEmail} redirect={redirect} />;
	}

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			id="login-form"
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Enter your email below to login to your account
					</p>
				</div>
				{oauthError && (
					<p role="alert" className="text-center text-sm text-destructive">
						{oauthErrorMessage(oauthError)}
					</p>
				)}
				<SocialSignInButtons providers={socialProviders} redirect={redirect} />
				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Enter your email address"
									type="email"
								/>

								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<div className="flex items-center">
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<Link
										to="/auth/forgot-password"
										className="ml-auto text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</Link>
								</div>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Enter password"
									type="password"
								/>

								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<Field>
					<form.Subscribe>
						{({ canSubmit, isSubmitting }) => (
							<Button type="submit" form="login-form" disabled={!canSubmit}>
								{isSubmitting ? "Logging in..." : "Submit"}
							</Button>
						)}
					</form.Subscribe>
				</Field>
				<FieldSeparator></FieldSeparator>
				<Field>
					<FieldDescription className="text-center">
						Don&apos;t have an account?{" "}
						<Link to="/auth/signup" search={{ redirect }}>
							Sign up
						</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}

function oauthErrorMessage(code: string) {
	switch (code) {
		case "access_denied":
			return "Sign in was cancelled.";
		case "email_not_found":
			return "We couldn't get an email address from that account.";
		case "account_not_linked":
			return "That email already has an account. Log in with your password first.";
		default:
			return "Something went wrong signing you in. Please try again.";
	}
}
