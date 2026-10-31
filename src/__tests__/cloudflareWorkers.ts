/**
 * Stands in for the `cloudflare:workers` module, which only exists inside the
 * Workers runtime. Tests set the bindings they need with `vi.mock`.
 */
export const env: Record<string, unknown> = {};
