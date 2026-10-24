import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "#/__tests__/RenderWithRouter";
import { CheckYourEmail } from "./CheckYourEmail";

const { sendVerificationEmail } = vi.hoisted(() => ({
	sendVerificationEmail: vi.fn(),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: { sendVerificationEmail },
}));

describe("CheckYourEmail", () => {
	beforeEach(() => {
		sendVerificationEmail.mockReset();
		sendVerificationEmail.mockResolvedValue({ data: {}, error: null });
	});

	it("tells the user where the link was sent", async () => {
		await renderWithRouter(<CheckYourEmail email="ivan@example.com" />);

		expect(screen.getByText("ivan@example.com")).toBeInTheDocument();
	});

	it("resends the link back to the redirect path", async () => {
		await renderWithRouter(
			<CheckYourEmail email="ivan@example.com" redirect="/watchlist" />,
		);

		await userEvent.click(screen.getByRole("button", { name: /resend link/i }));

		expect(sendVerificationEmail).toHaveBeenCalledWith({
			email: "ivan@example.com",
			callbackURL: "/watchlist",
		});
	});
});
