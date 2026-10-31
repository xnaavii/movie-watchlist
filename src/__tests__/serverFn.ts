/**
 * A stand-in for `@tanstack/react-start` in unit tests. `createServerFn`
 * returns a plain async function that runs the validator, then the handler,
 * so server functions can be called without the Start server runtime.
 */
type Validator = (data: unknown) => unknown;
type Handler = (context: { data: unknown }) => unknown;

export function createServerFn() {
	let validate: Validator = (data) => data;
	const builder = {
		validator(fn: Validator) {
			validate = fn;
			return builder;
		},
		inputValidator(fn: Validator) {
			validate = fn;
			return builder;
		},
		middleware() {
			return builder;
		},
		handler(handle: Handler) {
			return async (options: { data?: unknown } = {}) =>
				handle({ data: validate(options.data) });
		},
	};
	return builder;
}

export const useServerFn = <T>(fn: T) => fn;
