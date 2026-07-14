import { useForm } from "@tanstack/react-form";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { authClient } from "#/lib/auth-client";

const formSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

const routeApi = getRouteApi("/login");

export function LoginForm() {
	const router = useRouter();
	const { redirect } = routeApi.useSearch();

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
			});

			if (error) {
				toast.error(`Message: ${error.message}, Status: ${error.status}`);
			} else {
				router.history.push(redirect ?? "/");
				toast.success(`Logged in as ${data.user.email}`);
			}
		},
	});

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Log in to your account</CardTitle>
				<CardDescription>
					Access your watchlist across all your devices.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					id="login-form"
				>
					<FieldGroup>
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

										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
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
										<FieldLabel htmlFor={field.name}>Password</FieldLabel>
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

										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<FieldGroup>
					<Field>
						<form.Subscribe>
							{({ canSubmit, isSubmitting }) => (
								<Button type="submit" form="login-form" disabled={!canSubmit}>
									{isSubmitting ? "Logging in..." : "Submit"}
								</Button>
							)}
						</form.Subscribe>
					</Field>
					<Field>
						<FieldDescription className="text-center">
							Don&apos;t have an account?{" "}
							<Link to="/signup" search={{ redirect }}>
								Sign up
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</CardFooter>
		</Card>
	);
}
