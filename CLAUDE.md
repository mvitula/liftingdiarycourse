# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database migrations (Drizzle)
```bash
npx drizzle-kit generate   # Generate migration files
npx drizzle-kit migrate    # Apply migrations to DB
npx drizzle-kit studio     # Open Drizzle Studio UI
```

## Architecture

**Lifting Diary** — a Next.js App Router workout tracking app.

- **Framework**: Next.js with App Router (`src/app/`)
- **Auth**: Clerk (`@clerk/nextjs`) — middleware at `src/middleware.ts` protects all routes; layout uses `<ClerkProvider>` with modal-based sign-in/sign-up
- **Database**: Neon serverless PostgreSQL via `@neondatabase/serverless` + Drizzle ORM
- **Styling**: Tailwind CSS v4 via PostCSS, shadcn/ui (new-york style), Radix UI primitives, Lucide icons
- **Language**: TypeScript with path alias `@/*` → `./src/*`

### Key directories

- `src/app/` — pages and layouts (App Router)
- `src/db/index.ts` — Drizzle instance (Neon driver)
- `src/db/schema.ts` — three tables: `workouts`, `exercises`, `sets` with cascade-delete FK relationships; exports inferred types (`Workout`, `Exercise`, `Set`, `New*` variants)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `drizzle.config.ts` — points to `src/db/schema.ts`, outputs migrations to `./drizzle/`

### Database schema summary

`workouts` → `exercises` (ordered) → `sets` (reps/weightLbs/durationSeconds). All keyed by Clerk `userId` on workouts. Cascade deletes propagate down.

### Environment variables required

- `DATABASE_URL` — Neon connection string
- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.)
