import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialSignInButtons } from "./SocialSignInButtons";

const { signInSocial } = vi.hoisted(() => ({
	signInSocial: vi.fn(),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: { signIn: { social: signInSocial } },
}));

describe("SocialSignInButtons", () => {
	beforeEach(() => {
		signInSocial.mockReset();
		signInSocial.mockResolvedValue({ data: {}, error: null });
	});

	it("renders nothing when no provider is configured", () => {
		const { container } = render(
			<SocialSignInButtons providers={{ google: false }} />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("shows Google when it is configured", () => {
		render(<SocialSignInButtons providers={{ google: true }} />);

		expect(
			screen.getByRole("button", { name: /continue with google/i }),
		).toBeInTheDocument();
	});

	it("starts the provider sign in and returns to the redirect path", async () => {
		render(
			<SocialSignInButtons
				providers={{ google: true }}
				redirect="/watchlist"
			/>,
		);

		await userEvent.click(
			screen.getByRole("button", { name: /continue with google/i }),
		);

		expect(signInSocial).toHaveBeenCalledWith({
			provider: "google",
			callbackURL: `${window.location.origin}/watchlist`,
			errorCallbackURL: `${window.location.origin}/auth/login`,
		});
	});

	it("ignores redirects to other sites", async () => {
		render(
			<SocialSignInButtons
				providers={{ google: true }}
				redirect="//evil.example"
			/>,
		);

		await userEvent.click(
			screen.getByRole("button", { name: /continue with google/i }),
		);

		expect(signInSocial).toHaveBeenCalledWith(
			expect.objectContaining({ callbackURL: `${window.location.origin}/` }),
		);
	});
});
