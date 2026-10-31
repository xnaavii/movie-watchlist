import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { deleteErrorMessage } from "./AccountDataSection";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

vi.mock("#/lib/auth-client", () => ({ authClient: {} }));
vi.mock("../server/account.functions", () => ({
	exportAccountDataFn: vi.fn(),
}));

async function openDialog(props: Parameters<typeof DeleteAccountDialog>[0]) {
	const user = userEvent.setup();
	render(<DeleteAccountDialog {...props} />);
	await user.click(screen.getByRole("button", { name: "Delete account" }));
	const dialog = screen.getByRole("dialog", { name: "Delete your account?" });
	return { user, dialog };
}

describe("DeleteAccountDialog", () => {
	it("asks Google-only accounts to type the confirmation word", async () => {
		const onDelete = vi.fn().mockResolvedValue(undefined);
		const { user, dialog } = await openDialog({ hasPassword: false, onDelete });
		const confirm = within(dialog).getByRole("button", {
			name: "Delete account",
		});
		expect(confirm).toBeDisabled();

		await user.type(screen.getByLabelText(/to confirm/), "DELETE");
		expect(confirm).toBeEnabled();
		await user.keyboard("{Enter}");

		expect(onDelete).toHaveBeenCalledWith(undefined);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("sends the password and shows why deleting failed", async () => {
		const onDelete = vi
			.fn()
			.mockRejectedValue(new Error("That password isn't right."));
		const { user } = await openDialog({ hasPassword: true, onDelete });

		const password = screen.getByLabelText("Your password");
		expect(password).toHaveFocus();
		await user.type(password, "hunter2{Enter}");

		expect(onDelete).toHaveBeenCalledWith("hunter2");
		expect(
			await screen.findByText("That password isn't right."),
		).toBeInTheDocument();
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});

describe("deleteErrorMessage", () => {
	it("explains a stale sign-in instead of showing the raw code", () => {
		expect(deleteErrorMessage({ code: "SESSION_EXPIRED" })).toMatch(
			/sign in again/,
		);
		expect(deleteErrorMessage({ code: "INVALID_PASSWORD" })).toBe(
			"That password isn't right.",
		);
		expect(deleteErrorMessage({ message: "Boom" })).toBe("Boom");
	});
});
