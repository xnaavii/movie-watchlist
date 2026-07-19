# Movie Watchlist

A movie discovery and watchlist app built with TanStack Start, deployed on Cloudflare Workers.

## Stack

- **Framework:** TanStack Start + TanStack Router
- **Data fetching:** TanStack Query
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Better Auth
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Movie data:** [TMDB API](https://www.themoviedb.org/documentation/api) via `@lorenzopant/tmdb`
- **Deployment:** Cloudflare Workers

## Features

- Discover movies with filters (genre, year, language, rating, sort)
- Full-text search with debounced infinite scroll
- Personal watchlist with watch status (want to watch / watched)
- Movie details: cast & crew, trailers, similar movies, IMDb ratings

## Getting started

```bash
npm install
cp .env.example .env  
# fill in TMDB_API_KEY, DATABASE_URL, BETTER_AUTH_SECRET, etc.
npm run db:push 
# or npx drizzle-kit push
npm run dev
```

## Deployment

Deployed to Cloudflare Workers via Wrangler:

```bash
npm run build
npm run deploy
```

Environment variables are managed via `wrangler secret put <NAME>` for production.

## Testing

```bash
npm run test
```