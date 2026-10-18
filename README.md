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
- Choose who can see each deck: only you, anyone with the link, or everyone. Public decks are listed on the Explore page, where you can search them by words in the title or subject, sort them by newest or most copied, and press "Load more" to see more. Each deck shows how many people copied it (one copy per person; your own copies don't count). Anyone who can see a deck can copy it into their own decks; your study progress stays private.
- Report a shared deck (wrong answers, rude or not okay for school, spam, something else). A deck reported by 3 different people is hidden from Explore until it is reviewed; its link keeps working. Reports are reviewed with SQL (see the comment at the top of `supabase/migrations/0014_deck_reports.sql`).
- Search decks by name or subject, filter by "to review", "has new cards" or "caught up", and sort by recently studied or A to Z.
- Upload cards from a Word `.docx`, PowerPoint `.pptx`, PDF, Excel `.xlsx` (first sheet), `.txt`, `.md`, `.csv` or `.tsv` file. Kwest reads the text like a teacher writing a reviewer, using fixed rules (no AI): it makes cards from table rows (column 1 is the front, column 2 the back, column 3 an optional note), `word - meaning` and `word: meaning` lines, a question followed by its answer (or `Q:` / `A:`), a heading ending in `:` with a short list under it, and sentences like "A cell is ..." (asked back as "What is a cell?"). `Example:` and `Note:` lines under a card become that card's note. Headings, labels such as Step 1 or Chapter 2, cover-page fields (Subject, Date, course codes), times, dates, links, page numbers and repeats are left out; sentences that wrap onto the next line are joined first, and the upload message says how many lines were left out. The cards are shown in the editor to check before saving. Header rows such as Word / Meaning are skipped. It cannot write new questions from plain paragraphs. Old `.doc`, `.ppt` and `.xls` files aren't supported, and a PDF that is a scan of paper (pictures of text) can't be read. Size limits are 100 MB for text files and 500 MB for the others; PDFs are read up to 2000 pages. Files are read in the browser and nothing is sent until you save the deck. Uses `fflate` (unzip) and `pdfjs-dist` (PDF), both loaded only on upload.
- Saving is atomic: a deck and all its cards are written in one database transaction.

**Studying**
- **Quiz** has three levels you pick before you start: **Easy** is multiple choice, **Average** is matching (up to 5 cards per round; tap a card, then its answer) and **Difficult** is identification (type the answer). A deck with too few other answers falls back to typing on Easy, and a single card falls back to typing on Average. Every answer is graded on the server like before, so XP and review dates work the same at every level (matching pairs count as multiple choice). The level is not saved with the results. Missed cards come back once at the end of the session on Easy and Difficult; in matching you keep going until every pair is right.
- **Flashcards**: flip each card and mark it *Still learning* or *I knew it*. Keyboard shortcuts included (Space, 1, 2).
- **Challenge**: a game. Get 8 right before you miss 3 (three hearts), with an optional 15-second timer per question (25 seconds for typed answers). Winning earns bonus XP and an award; the win is checked on the server.
- **Beat my score**: after a challenge, get a link to send to a friend. They play the same deck under the same rules, and a scoreboard on the link shows everyone's best game (most right, then fewest misses, then fastest). Answers are graded on the server. Link games give no XP or coins, and they never change the friend's own card progress.
- Instant feedback with the correct answer, your card's note, and which card your wrong pick belonged to.

**Progress**
- A dashboard that shows the next best thing to study, with an estimated time.
- XP, levels (New Student → Scholar), coins and a daily goal. Missing a day resets nothing; there are no streaks.
- A profile with lifetime stats, a 7-day activity chart, achievements (with progress toward locked ones) and an adjustable daily goal.
- A coin shop to customize your avatar with icons, colors and frames. Some items are free once you reach a level.
- A short onboarding flow that ends with making your first deck.

**Quality**
- Responsive from 375 px phones to desktop, with a bottom tab bar on mobile.
- Light and dark themes that follow the system setting.
- A one-screen welcome page with an animated pixel background (graph paper, drifting clouds, floating cards) and sign-up and log-in buttons. Decoration stops when the visitor prefers reduced motion.
- Navigation is a top bar with pixel-icon tabs, your level, coins and avatar, and Log out. Tabs are light: on hover the icon turns blush and a soft line slides in underneath; the page you are on keeps a blush line. On phones the tabs move to a bar at the bottom. Both bars use the same color as the page, with no line under them; a short fade shows where the page scrolls beneath.
- Home is a quest board: a time-of-day greeting, today's quest with the number of cards waiting, and three tiles (daily goal, level, coins) that each open the page where you can act on them, then recent decks. Everything rises in one after another; bars fill block by block. It sits on a calm version of the animated backdrop. With no decks yet, Home is a short welcome instead: a greeting with your name, one sentence about decks and one button (make a deck). It sits on a soft scene: a pale sun, slow clouds, tiny twinkling stars, and hills with little pine trees (`PixelMeadow`).
- The Decks list and the deck page use the same light pixel style: deck cards are small pixel frames that tint on hover, the deck page is one frame with a thin-lined stats row, and the card list and Share box are single frames with thin dividers instead of boxes inside boxes.
- Study picker, Shop, Explore, the shared-deck page, Challenge, "beat my score" pages, Profile and the first-run welcome use the same light style: one soft frame per area (the profile settings and the achievements are single frames with thin dividers), big numbers in a `StatRow`, hearts and the score bar drawn in pixels, and a calm meadow behind the first-run welcome. Pixel text is only used at 16, 24, 32 and 40px so it stays crisp.
- Log in, sign up and password pages share the same animated pixel backdrop. The form sits in a small pixel window; its fields rise in one after another, inputs glow with a pixel shadow when focused, and an error message gives one small shake.
- Install on a phone: Kwest has a web app manifest and icons, so it can be added to the home screen and opens full screen like an app. The Profile page has an "Install Kwest" button (Chrome and Edge) or steps for iPhone Safari. There is no offline mode: it still needs the internet.
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
| UI | React 19, TypeScript (strict), Tailwind CSS 4, [lucide-react](https://lucide.dev) icons, Tiny5 and Poppins |
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
4. `supabase/seed.sql`: items and achievements
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
└── seed.sql                Catalog data (items and achievements)
```

Each feature keeps its data access in a server-only `queries.ts` and its mutations in `actions.ts`, so pages stay thin.

## Architecture and security

- **Row Level Security on every table.** Users can read and change only their own rows.
- **Rewards are server-side only.** XP, coins, levels, review progress and sessions are written exclusively by Postgres functions (`start_session`, `submit_answer`, `finish_session`); the client has no write access to them.
- **Defense in depth.** `proxy.ts` redirects signed-out visitors, and every Server Action and query still verifies the user itself.
- **Narrow column grants.** Users can only update the columns they are meant to edit (for example a profile's display name, never its XP).
- **Cache Components.** Pages render a static shell instantly and stream personal data behind `<Suspense>`, with a `loading.tsx` for every route.

## Design system

Kwest has a pixel picture-book look: flat colors, thick black outlines, square corners, hard pixel shadows, and a pixel font (Tiny5) for headings and buttons. Body text uses Poppins so cards stay easy to read.

Design tokens live in [`src/app/globals.css`](src/app/globals.css) and are exposed as Tailwind colors (`bg-surface`, `text-text-muted`, `bg-secondary`, ...).

| Color | Hex | Used for |
|---|---|---|
| Lavender Blush | `#FFE6ED` | Light page background, dark-mode text and outlines |
| Blush | `#CF7486` | Primary buttons, highlights, progress (always with black text) |
| Black | `#111111` | Text, outlines and shadows, dark-mode background |

All text and background pairs meet WCAG AA contrast.

**Pixel pieces** (all drawn from text grids or plain CSS, no image files):
- `Panel` and the hero cards use a stepped-corner frame (`.pixel-frame` inside `.pixel-lift` in `globals.css`). A frame's own shadow would be cut off by its corners, so the shadow sits on the wrapper.
- `PixelBar` (`src/components/ui/pixel-bar.tsx`) is the progress bar: square blocks with a lit top edge. It is used for XP, daily goal, study progress, the challenge timer and achievement progress.
- `PixelIcon` (`src/components/brand/pixel.tsx`) is the pixel icon set, drawn from text grids.
- Buttons move down and lose their shadow when pressed. Hovers still change color only.
- A row of square dashes trims the bottom of the header.

## Roadmap

- [x] Accounts, profiles and onboarding
- [x] Dashboard with next best action and daily goal
- [x] Deck editor
- [x] Quiz and flashcard study modes
- [x] Quiz levels: easy (multiple choice), average (matching), difficult (identification)
- [x] Profile stats, 7-day activity chart, achievements and daily goal setting
- [x] Coin shop: avatar icons, colors and frames
- [x] Challenge mode (solo study game)
- [x] Beat-my-score links with a shared scoreboard
- [x] Share decks by link and copy shared decks
- [x] Explore page for public decks
- [x] Explore: copy counts, "Most copied" sort, "Load more"
- [x] Report shared decks
- [x] Deck search, filters and sort
- [x] Pixel picture-book redesign
- [x] Install on phone (web app manifest and icons)
- [x] Pixel redesign phase 2: stepped frames, block progress bars, pixel icons on Home, Study and Profile
- [x] Upload cards from Word, PowerPoint and PDF files
- [x] Pixel redesign phase 3: Decks list, deck page and deck editor (subject and description are tucked behind one link; short upload hint)
- [x] Pixel redesign phase 4: Study picker, Shop, Explore, shared-deck page, Challenge and link-game screens, results screens, Profile and onboarding
- [ ] Multiplayer study game
