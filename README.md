# Movie Watchlist

A movie discovery and watchlist app built with TanStack Start, deployed on Cloudflare Workers.

## Stack

- **Framework:** TanStack Start + TanStack Router
- **Data fetching:** TanStack Query
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Better Auth
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Movie data:** [TMDB API](https://www.themoviedb.org/documentation/api) via `@lorenzopant/tmdb`
- **Ratings:** OMDb API (IMDb ratings)
- **Streaming availability:** Watchmode API
- **Deployment:** Cloudflare Workers

## Features

- Discover movies with filters (genre, year, language, rating, sort)
- Full-text search with debounced infinite scroll
- Personal watchlist with watch status (want to watch / watched)
- Movie details: cast & crew, trailers, similar movies, IMDb ratings, streaming availability

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your database

This project uses [Neon Launchpad](https://neon.new) for a zero-config Postgres database. Running the dev server for the first time will prompt you to create one, which automatically populates `DATABASE_URL`.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | How to get it |
|---|---|
| `DATABASE_URL` | Auto-populated by [Neon Launchpad](https://neon.new) |
| `BETTER_AUTH_URL` | Your app's base URL (e.g. `http://localhost:3000` in dev) |
| `BETTER_AUTH_SECRET` | Generate with `npx -y @better-auth/cli secret` |
| `TMDB_BEARER_TOKEN` | [TMDB API settings](https://www.themoviedb.org/settings/api) — v4 auth bearer token |
| `OMDB_API_KEY` | [OMDb API](https://www.omdbapi.com/apikey.aspx) — used for IMDb ratings |
| `WATCHMODE_API_KEY` | [Watchmode API](https://api.watchmode.com/) — used for streaming availability |

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run the dev server

```bash
npm run dev
```

## Testing

```bash
npm run test
```

## Deployment

Deployed to Cloudflare Workers via Wrangler:

```bash
npm run build
npm run deploy
```

Environment variables/secrets are managed via `wrangler secret put <NAME>` for production — set each of the variables above (except `BETTER_AUTH_URL`, which should point at your production URL).