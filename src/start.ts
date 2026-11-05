import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { canonicalHostMiddleware } from "#/lib/canonicalHost";

// Defining a start instance replaces TanStack Start's default request
// middleware, so the CSRF check for server functions is added back here.
const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
	requestMiddleware: [canonicalHostMiddleware, csrfMiddleware],
}));
