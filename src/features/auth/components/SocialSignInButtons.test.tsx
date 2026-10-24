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
			<SocialSignInButtons providers={{ google: false, apple: false }} />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("only shows configured providers", () => {
		render(<SocialSignInButtons providers={{ google: true, apple: false }} />);

		expect(
			screen.getByRole("button", { name: /continue with google/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /continue with apple/i }),
		).not.toBeInTheDocument();
	});

	it("starts the provider sign in and returns to the redirect path", async () => {
		render(
			<SocialSignInButtons
				providers={{ google: true, apple: true }}
				redirect="/watchlist"
			/>,
		);

		await userEvent.click(
			screen.getByRole("button", { name: /continue with apple/i }),
		);

		expect(signInSocial).toHaveBeenCalledWith({
			provider: "apple",
			callbackURL: `${window.location.origin}/watchlist`,
			errorCallbackURL: `${window.location.origin}/auth/login`,
		});
	});

	it("ignores redirects to other sites", async () => {
		render(
			<SocialSignInButtons
				providers={{ google: true, apple: false }}
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
