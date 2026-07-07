import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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

const formSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Name is required")
			.max(100, "Name is too long"),
		email: z.email("Please enter a valid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128, "Password must be at most 128 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function SignupForm() {
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});

			if (error) {
				toast.error(`${error.message}, ${error.status}`);
			} else {
				toast.success("Account created!");
			}
		},
	});

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Create a new account</CardTitle>
				<CardDescription>
					Become a member and sync your watchlist across all your devices.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					id="signup-form"
				>
					<FieldGroup>
						<form.Field name="name">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Enter your name"
										/>

										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
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
						<form.Field name="confirmPassword">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Confirm Password
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Enter your password again"
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
						<Button variant="outline" onClick={() => form.reset()}>
							Reset
						</Button>
						<form.Subscribe>
							{({ canSubmit, isSubmitting }) => (
								<Button type="submit" form="signup-form" disabled={!canSubmit}>
									{isSubmitting ? "Creating your account..." : "Submit"}
								</Button>
							)}
						</form.Subscribe>
					</Field>
					<Field>
						<FieldDescription className="text-center">
							Already have an account? <Link to="/login">Log in</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</CardFooter>
		</Card>
	);
}
