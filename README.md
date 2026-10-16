# Kwest

*Knowledge is the adventure.* A pixel-art study game: your study sets become tomes in a cozy room, and studying grows your character and world.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS) · Vercel

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and **publishable** key
   (Supabase → Project Settings → API Keys). Never use the secret / service_role key in this app.
3. Database: run these files in order in Supabase → SQL Editor:
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_functions.sql`
   3. `supabase/migrations/0003_security.sql`
   4. `supabase/seed.sql`
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint |

## Project layout

```
src/
  app/            routes (App Router)
  components/ui/  shared UI (Button, Panel, ...)
  lib/
    supabase/     browser, server and proxy clients
    game/         progression rules mirrored from the database (display only)
    types/        database types
    routes.ts     public / auth-only route lists
  proxy.ts        session refresh + route protection
supabase/
  migrations/     schema, game functions, security
  seed.sql        items, achievements, starter tome
```

## Security model

- XP, coins, levels, progress, sessions and inventory are written **only** by Postgres functions
  (`start_session`, `submit_answer`, `finish_session`, `buy_item`). The client can't set them.
- Every table has Row Level Security; users only see their own rows.
- `proxy.ts` redirects signed-out users, but every Server Action must still check the user itself.
