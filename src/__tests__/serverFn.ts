/**
 * A stand-in for `@tanstack/react-start` in unit tests. `createServerFn`
 * returns a plain async function that runs the validator, then the handler,
 * so server functions can be called without the Start server runtime.
 * Like Start, the validator can be a function or a zod (Standard) schema.
 */
type ValidatorFn = (data: unknown) => unknown;
type StandardSchema = {
	"~standard": {
		validate: (
			data: unknown,
		) =>
			| { value: unknown; issues?: undefined }
			| { issues: readonly { message: string }[] }
			| Promise<unknown>;
	};
};
type Validator = ValidatorFn | StandardSchema;
type Handler = (context: { data: unknown }) => unknown;

function toValidatorFn(validator: Validator): ValidatorFn {
	if (typeof validator === "function") return validator;
	return (data) => {
		const result = validator["~standard"].validate(data);
		if (result instanceof Promise) throw new Error("Async schemas unsupported");
		const { issues } = result as { issues?: readonly { message: string }[] };
		if (issues) throw new Error(JSON.stringify(issues));
		return (result as { value: unknown }).value;
	};
}

export function createServerFn() {
	let validate: ValidatorFn = (data) => data;
	const builder = {
		validator(validator: Validator) {
			validate = toValidatorFn(validator);
			return builder;
		},
		inputValidator(validator: Validator) {
			validate = toValidatorFn(validator);
			return builder;
		},
		middleware() {
			return builder;
		},
		handler(handle: Handler) {
			return async (options: { data?: unknown } = {}) =>
				handle({ data: await validate(options.data) });
		},
	};
	return builder;
}

export const useServerFn = <T>(fn: T) => fn;
