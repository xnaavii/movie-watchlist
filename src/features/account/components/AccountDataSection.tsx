import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { LegalLinks } from "#/features/legal/components/LegalLinks";
import { clearCachedUserData } from "#/features/pwa/serviceWorker";
import { authClient } from "#/lib/auth-client";
import { exportFileName } from "../exportData";
import { exportAccountDataFn } from "../server/account.functions";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

/** Saves a JSON value as a file download. */
export function downloadJson(data: unknown, fileName: string) {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

const SESSION_EXPIRED_MESSAGE =
	"For your safety, sign out and sign in again, then delete your account within a day.";

/** Turns Better Auth's delete errors into something people can act on. */
export function deleteErrorMessage(error: { code?: string; message?: string }) {
	switch (error.code) {
		case "INVALID_PASSWORD":
			return "That password isn't right.";
		case "SESSION_EXPIRED":
			return SESSION_EXPIRED_MESSAGE;
		default:
			return error.message || "Couldn't delete your account. Please try again.";
	}
}

/** Profile section for downloading or deleting account data. */
export function AccountDataSection() {
	const router = useRouter();
	const exportAccountData = useServerFn(exportAccountDataFn);
	const [exporting, setExporting] = useState(false);
	const { data: accounts } = useQuery({
		queryKey: ["auth", "accounts"],
		queryFn: async () => {
			const { data, error } = await authClient.listAccounts();
			if (error) throw new Error(error.message);
			return data;
		},
		staleTime: 5 * 60 * 1000,
	});
	const hasPassword =
		accounts?.some((account) => account.providerId === "credential") ?? false;

	const download = async () => {
		setExporting(true);
		try {
			downloadJson(await exportAccountData(), exportFileName());
		} catch {
			toast.error("Couldn't prepare your data. Please try again.");
		} finally {
			setExporting(false);
		}
	};

	const deleteAccount = async (password: string | undefined) => {
		const { error } = await authClient.deleteUser(password ? { password } : {});
		if (error) throw new Error(deleteErrorMessage(error));
		clearCachedUserData();
		toast.success("Your account has been deleted.");
		await router.invalidate();
		await router.navigate({ to: "/discover" });
	};

	return (
		<section
			aria-labelledby="account-data-heading"
			className="flex flex-col gap-6 border-t pt-8"
		>
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
					<ShieldCheck className="size-5" />
				</div>
				<div className="flex flex-col gap-1">
					<h2
						id="account-data-heading"
						className="text-xl font-medium tracking-tight"
					>
						Your data
					</h2>
					<p className="max-w-prose text-sm text-muted-foreground">
						Get a copy of everything Watchlist stores about you, or delete your
						account and all of its data for good.
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button variant="outline" onClick={download} disabled={exporting}>
					<Download data-icon="inline-start" />
					{exporting ? "Preparing…" : "Download my data"}
				</Button>
				<DeleteAccountDialog
					hasPassword={hasPassword}
					onDelete={deleteAccount}
				/>
			</div>
			<LegalLinks />
		</section>
	);
}
