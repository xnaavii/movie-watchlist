import { Trash2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

/** What people without a password type to confirm. */
export const DELETE_CONFIRMATION = "delete";

interface DeleteAccountDialogProps {
	/** Email sign-ups confirm with their password; Google-only accounts type a word. */
	hasPassword: boolean;
	/** Deletes the account. Throws with a message to show when it fails. */
	onDelete: (password: string | undefined) => Promise<void>;
}

export function DeleteAccountDialog({
	hasPassword,
	onDelete,
}: DeleteAccountDialogProps) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const inputId = useId();

	const confirmed = hasPassword
		? value.length > 0
		: value.trim().toLowerCase() === DELETE_CONFIRMATION;

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!confirmed || deleting) return;
		setDeleting(true);
		setError(null);
		try {
			await onDelete(hasPassword ? value : undefined);
			setOpen(false);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Couldn't delete your account.",
			);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					setValue("");
					setError(null);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="destructive">
					<Trash2 data-icon="inline-start" />
					Delete account
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={submit} className="grid gap-6">
					<DialogHeader>
						<DialogTitle>Delete your account?</DialogTitle>
						<DialogDescription>
							This permanently deletes your account, watchlist, watch history,
							Atmos votes and sound ratings. It can't be undone. Download your
							data first if you want a copy.
						</DialogDescription>
					</DialogHeader>
					<Field data-invalid={!!error}>
						<FieldLabel htmlFor={inputId}>
							{hasPassword ? (
								"Your password"
							) : (
								<>
									Type <span className="font-mono">{DELETE_CONFIRMATION}</span>{" "}
									to confirm
								</>
							)}
						</FieldLabel>
						<Input
							id={inputId}
							type={hasPassword ? "password" : "text"}
							autoComplete={hasPassword ? "current-password" : "off"}
							value={value}
							onChange={(event) => setValue(event.target.value)}
							aria-invalid={!!error}
							autoFocus
						/>
						{error ? (
							<FieldError>{error}</FieldError>
						) : (
							<FieldDescription>
								You'll be signed out on every device.
							</FieldDescription>
						)}
					</Field>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							variant="destructive"
							disabled={!confirmed || deleting}
						>
							{deleting ? "Deleting…" : "Delete account"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
