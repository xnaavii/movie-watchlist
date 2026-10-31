# Architecture

How the Watchlist codebase is put together, and the patterns to follow when
adding to it. For styling rules see [DESIGN.md](./DESIGN.md).

## Stack

| Layer | Library | Docs |
| --- | --- | --- |
| Framework | TanStack Start (React 19, SSR, server functions) | [tanstack.com/start](https://tanstack.com/start/latest) |
| Routing | TanStack Router, file based | [tanstack.com/router](https://tanstack.com/router/latest) |
| Server state | TanStack Query v5 | [tanstack.com/query](https://tanstack.com/query/latest) |
| Client UI state | zustand (only for app-shell state) | [zustand docs](https://zustand.docs.pmnd.rs) |
| Auth | Better Auth (email + Google) | [better-auth.com](https://www.better-auth.com/docs/integrations/tanstack) |
| Database | Drizzle ORM on Neon Postgres | [orm.drizzle.team](https://orm.drizzle.team) |
| Validation | zod | [zod.dev](https://zod.dev) |
| UI | shadcn/ui, Tailwind v4 | [ui.shadcn.com](https://ui.shadcn.com) |
| Hosting | Cloudflare Workers (+ Workers AI, Cache API) | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| Tests | Vitest + Testing Library | `pnpm test` |

Use **pnpm**. Imports use the `#/` alias for `src/` (for example
`#/features/media/queries`), or a relative path inside the same feature.

## Folders

```
src/
  routes/           One file per URL. Thin: params, loader, head, page.
  features/<name>/  Everything for one feature (media, watchlist, sound, ...)
  components/       App-wide components (Sidebar, TabBar, RowCarousel, ...)
  components/ui/    shadcn components. Vendored: change sparingly.
  hooks/            App-wide hooks (useInView, useInfiniteScrollTrigger, ...)
  lib/              App-wide setup: auth, tmdb client, edge cache, env, AI
  db/               Drizzle schema and client
  integrations/     QueryClient setup and devtools
  __tests__/        Test helpers (server function stand-in, Workers env)
```

### Inside a feature

```
features/media/
  components/        React components
    MediaCredits.tsx       presents data it is given (props in, JSX out)
    MediaCreditsView.tsx   fetches with useQuery, handles loading/error/empty,
                           then renders MediaCredits
    MediaCardSkeleton.tsx  loading placeholder
  hooks/             Feature hooks (useX)
  server/
    media.functions.ts     server functions: the endpoints the client calls
    media.server.ts        the work: TMDB/DB calls. Server only.
  queries.ts         query option factories (mediaQueries.details(ref), ...)
  schemas.ts         zod schemas for server function inputs
  types/ or types.ts shared types (client safe)
  utils/             pure helpers, each with a .test.ts next to it
```

Not every feature needs every folder. Copy the shape of `media` or
`watchlist` when starting a new one.

## Rules of thumb

### Routes stay thin

A route file defines search params (`validateSearch` with zod), the `loader`,
`head`, and a page component that composes feature components. If a route
grows its own sub-components or data logic, move them into the feature. See
`routes/_app/movies/$movieSlug.tsx`.

Loaders prefetch with the feature's query options, using
`queryClient.query(...)` / `queryClient.infiniteQuery(...)` (or a helper like
`loadMediaDetails`). Only load what is above the fold; sections lower down
fetch their own data inside `LazySection`.

### Server code: `.functions.ts` calls `.server.ts`

```ts
// media.functions.ts: the endpoint. Validate, then hand off.
export const getMediaDetails = createServerFn({ method: "GET" })
  .validator(mediaRefSchema)
  .handler(({ data }) => fetchMediaDetails(data));

// media.server.ts: the work.
export function fetchMediaDetails(ref: MediaRef): Promise<MediaDetails> { ... }
```

- **Every server function validates its input with a zod schema.** They are
  public HTTP endpoints, so types alone don't protect them.
- Server code calls `.server.ts` functions directly, never another feature's
  server *function* (that is an RPC endpoint).
- Endpoints that need a signed-in user call `ensureSession()` (throws) or
  `getSession()` (returns null) from `lib/auth.functions.ts`.
- Files named `*.server.ts`, and modules that import
  `@tanstack/react-start/server-only`, can't be imported by client code. The
  build fails if they are. Client code that needs a type from the server side
  gets it from the feature's `types.ts` instead.
- New TMDB calls go through `fromTmdb(..., { key, ttl })` in `media.server.ts`
  so they are edge cached.

### Data fetching with TanStack Query

- Every query lives in a feature's `queries.ts` factory, never inline in a
  component. Keys start with the feature (`["media", ...]`, `["watchlist", ...]`,
  `["sound", ...]`, `["picks", ...]`, `["account", ...]`). Per-title keys continue with the media
  type and id: `["media", "movie", 550, "credits"]`.
- Components call `useQuery(mediaQueries.credits(ref))`, or
  `useSuspenseQuery` when the loader already fetched it.
- After a change, invalidate the feature's key prefix (`watchlistQueries.allKey`).
  Don't call `router.invalidate()` for data changes.
- Mutations live in hooks (`useAddToWatchlist`). Failed mutations already
  show a toast through the `MutationCache` in
  `integrations/tanstack-query/root-provider.tsx`. Only add an `onError` for
  something extra.

### Signed in vs guest

Watchlist reads use `forUserOrGuest(server, guest)` and writes use
`saveForUserOrGuest(account, guest)` from `lib/clientAuth.ts`. Guests' lists
live in localStorage (`features/watchlist/guest`) and are imported into the
account on sign-in by `AuthStateSync`.

### Which state goes where

| State | Where |
| --- | --- |
| Anything from the server | TanStack Query |
| Anything that should survive a reload or be shareable (filters, tabs, search text) | URL search params via the route's `validateSearch` |
| Local UI (open/closed, input draft) | `useState` |
| App-shell state shared across distant components (install prompt, display mode) | zustand (`features/pwa/appShellStore.ts`) |
| Guest watchlist | localStorage, read through watchlist queries |

### React

- Follow the rules of hooks (Biome checks them).
- Derive values during render instead of copying props into state with
  `useEffect`. Effects are for syncing with something outside React (timers,
  event listeners, the browser).
- `useMemo` only for work that is actually expensive or needs a stable
  reference (for example deduping infinite pages with `uniqueMedia`).
- Components are named exports, one main component per file, named after the
  file.

### Movies and TV shows

Every title is a `MediaRef` (`{ mediaType, id }`), because TMDB movie and TV
ids overlap. Build keys with `mediaKey(ref)`. Don't assume movies only.

## Adding a feature, step by step

Say you want a "Collections" feature:

1. `features/collections/server/collections.server.ts`: the DB or API calls.
2. `features/collections/schemas.ts`: zod schemas for the inputs.
3. `features/collections/server/collections.functions.ts`: one
   `createServerFn` per endpoint, `.validator(schema)`, handler calls step 1.
4. `features/collections/queries.ts`: `collectionQueries.list()` and friends
   with keys starting `["collections", ...]`.
5. `features/collections/hooks/useCreateCollection.tsx` for mutations.
   Invalidate `["collections"]` on success.
6. `features/collections/components/`: `CollectionList` (props in) and
   `CollectionListView` (fetches, then renders `CollectionList`).
7. `routes/_app/collections.tsx`: loader prefetches, page renders the View.
   Add it to `components/nav/navItems.ts` if it's a top-level destination.
8. Tests next to the code (`*.test.ts(x)`), not under `routes/`.

## Checks before a PR

```sh
pnpm test         # vitest
pnpm exec tsc --noEmit
pnpm build
```
