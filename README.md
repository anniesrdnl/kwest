# Kwest

**Turn your notes into flashcard decks. Study a little every day, and remember more.**

Kwest is a study web app built around spaced repetition, with light game elements (levels, XP, coins and a daily goal) that reward steady practice without punishing missed days.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Auth-3ecf8e?logo=supabase&logoColor=white)

---

## Contents

- [Features](#features)
- [How studying works](#how-studying-works)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Architecture and security](#architecture-and-security)
- [Design system](#design-system)
- [Roadmap](#roadmap)

## Features

**Decks**
- Create, edit and delete decks of flashcards. Each card is either a *word → meaning* or a *question → answer*, with an optional note.
- Reorder cards and give each deck a color.
- Upload cards from a `.txt`, `.csv` or `.tsv` file (for example saved from Excel or Google Sheets). Column 1 is the front, column 2 the back, and an optional column 3 is the note. Text files can use one card per line with a tab, ` - ` or `:` between front and back. A header row is skipped. Files are read in the browser and nothing is sent until you save the deck.
- Saving is atomic: a deck and all its cards are written in one database transaction.

**Studying**
- **Quiz**: multiple choice, true/false and typed answers. New cards get easier formats; familiar cards ask you to type. Missed cards come back once at the end of the session.
- **Flashcards**: flip each card and mark it *Still learning* or *I knew it*. Keyboard shortcuts included (Space, 1, 2).
- Instant feedback with the correct answer, your card's note, and which card your wrong pick belonged to.

**Progress**
- A dashboard that shows the next best thing to study, with an estimated time.
- XP, levels (New Student → Scholar), coins and a daily goal. Missing a day resets nothing; there are no streaks.
- A profile with lifetime stats, a 7-day activity chart, achievements (with progress toward locked ones) and an adjustable daily goal.
- A coin shop to customize your avatar with icons, colors and frames. Some items are free once you reach a level.
- A short onboarding flow with a ready-made starter deck.

**Quality**
- Responsive from 375 px phones to desktop, with a bottom tab bar on mobile.
- Light and dark themes that follow the system setting.
- WCAG AA color contrast, visible focus states, 44 px touch targets, labelled form fields and reduced-motion support.

## How studying works

Kwest uses a Leitner-style spaced-repetition system with five boxes:

| Box | Next review |
|---|---|
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 7 days |
| 5 | 14 days, then 30 days |

- A correct quiz answer on a due card moves it up one box; a wrong answer sends it back to box 1.
- Flashcard self-reports never move cards between boxes. They mark weak cards so they are shown sooner.
- Sessions pick cards in this order: due reviews, recently missed cards, new cards, then the rest.
- A deck is *mastered* when it has at least 5 cards and every card is in box 4 or higher.

All grading, XP and coin rewards happen in Postgres functions, so the browser can't award itself points. Answers given in under 0.7 seconds earn no XP.

## Tech stack

| Area | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router with Turbopack, Cache Components and Partial Prefetching |
| UI | React 19, TypeScript (strict), Tailwind CSS 4, [lucide-react](https://lucide.dev) icons, Poppins |
| Backend | [Supabase](https://supabase.com): Postgres, Auth and Row Level Security, accessed with `@supabase/ssr` |
| Validation | [zod](https://zod.dev) 4, shared by the browser and Server Actions |

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project (the free tier is enough)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from **Supabase → Project Settings → API Keys**:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The **publishable** key |
| `NEXT_PUBLIC_SITE_URL` | Where the app runs, e.g. `http://localhost:3000` |

> [!WARNING]
> Only the publishable key belongs in this app. Never use the secret or `service_role` key: anything prefixed `NEXT_PUBLIC_` is sent to the browser.

### 3. Set up the database

In **Supabase → SQL Editor**, run these files in this order:

1. `supabase/migrations/0001_schema.sql`: tables, enums and indexes
2. `supabase/migrations/0002_functions.sql`: study sessions, grading, rewards and triggers
3. `supabase/migrations/0003_security.sql`: permissions and Row Level Security
4. `supabase/seed.sql`: items, achievements and the starter deck
5. `supabase/migrations/0004_dashboard.sql`: review counts per deck
6. `supabase/migrations/0005_rename_tome_to_deck.sql`: renames two functions
7. `supabase/migrations/0006_save_deck.sql`: atomic deck saving
8. `supabase/migrations/0007_achievement_copy.sql`: plain-language achievement names
9. `supabase/migrations/0008_shop_categories.sql`: new item types (run on its own)
10. `supabase/migrations/0009_shop.sql`: avatar shop items and avatar choices

For local development, turn off **Authentication → Providers → Email → Confirm email** so new accounts can sign in right away.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build (includes type checking) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/                    Routes (App Router)
│   ├── (auth)/             Log in, sign up, password reset
│   ├── (onboarding)/       First-run welcome flow
│   └── (app)/              Signed-in pages: home, decks, study, profile
├── components/
│   ├── brand/              Logo and wordmark
│   └── ui/                 Shared UI: Button, Panel, Field, TextArea, ...
├── features/               Code grouped by feature
│   ├── auth/               Server Actions and forms
│   ├── dashboard/          Dashboard queries and cards
│   ├── decks/              Deck queries, actions, editor and schemas
│   ├── study/              Quiz and flashcard sessions
│   ├── onboarding/         Welcome steps
│   ├── navigation/         Top bar and mobile tab bar
│   ├── profile/            Profile queries and form
│   └── progression/        XP bar
├── lib/
│   ├── supabase/           Browser, server and proxy clients
│   ├── game/levels.ts      Level math (mirrors the database; display only)
│   └── types/database.ts   Database types
└── proxy.ts                Session refresh and route protection
supabase/
├── migrations/             Schema, functions, security and later changes
└── seed.sql                Catalog data and the starter deck
```

Each feature keeps its data access in a server-only `queries.ts` and its mutations in `actions.ts`, so pages stay thin.

## Architecture and security

- **Row Level Security on every table.** Users can read and change only their own rows.
- **Rewards are server-side only.** XP, coins, levels, review progress and sessions are written exclusively by Postgres functions (`start_session`, `submit_answer`, `finish_session`); the client has no write access to them.
- **Defense in depth.** `proxy.ts` redirects signed-out visitors, and every Server Action and query still verifies the user itself.
- **Narrow column grants.** Users can only update the columns they are meant to edit (for example a profile's display name, never its XP).
- **Cache Components.** Pages render a static shell instantly and stream personal data behind `<Suspense>`, with a `loading.tsx` for every route.

## Design system

Design tokens live in [`src/app/globals.css`](src/app/globals.css) and are exposed as Tailwind colors (`bg-surface`, `text-text-muted`, `bg-secondary`, ...).

| Token | Light | Dark | Used for |
|---|---|---|---|
| Espresso Brown | `#3E2723` | text | Text, primary buttons |
| Butter Yellow | `#FFEDA2` | primary buttons | Highlights, selected states, progress |
| Background | `#FBF8F1` | `#1E1513` | Page background |

All text and background pairs meet WCAG AA contrast.

## Roadmap

- [x] Accounts, profiles and onboarding
- [x] Dashboard with next best action and daily goal
- [x] Deck editor
- [x] Quiz and flashcard study modes
- [x] Profile stats, 7-day activity chart, achievements and daily goal setting
- [x] Coin shop: avatar icons, colors and frames
- [ ] Multiplayer study game
