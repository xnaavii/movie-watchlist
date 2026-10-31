import { queryOptions } from "@tanstack/react-query";
import { authClient } from "#/lib/auth-client";

/** Queries about the signed-in account itself. */
export const accountQueries = {
	/** How the user signs in (password, Google), from Better Auth. */
	linkedAccounts: () =>
		queryOptions({
			queryKey: ["account", "linkedAccounts"],
			queryFn: async () => {
				const { data, error } = await authClient.listAccounts();
				if (error) throw new Error(error.message);
				return data;
			},
			staleTime: 5 * 60 * 1000,
		}),
};
