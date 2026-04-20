# Data Fetching

## CRITICAL: Server Components Only

All data fetching in this app **must** be done exclusively via React Server Components.

**Never fetch data via:**
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- Any other mechanism (SWR, React Query, `useEffect`, etc.)

Server Components fetch data directly by calling helper functions at render time. This is the only approved pattern.

```tsx
// CORRECT — server component fetching data
export default async function WorkoutsPage() {
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

```tsx
// WRONG — never do this
"use client";
useEffect(() => {
  fetch("/api/workouts").then(...); // ❌
}, []);
```

## Database Queries via /data Helpers

All database queries must live in helper functions inside the `/data` directory. These functions are the only place Drizzle ORM queries are written.

**Rules:**
- Every helper function must accept a `userId` parameter and filter all queries by it
- Use Drizzle ORM exclusively — **no raw SQL**
- Helper functions are called only from Server Components, never from client code

### Directory structure

```
src/
  data/
    workouts.ts   # getWorkoutsForUser, getWorkoutById, etc.
    exercises.ts  # getExercisesForWorkout, etc.
    sets.ts       # getSetsForExercise, etc.
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: number, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}
```

## Data Authorization

**Every query must be scoped to the authenticated user.** A logged-in user must never be able to read or modify another user's data.

- Always pass `userId` (from Clerk's `auth()`) into every helper function
- Always include `eq(table.userId, userId)` in every `where` clause
- Never expose a query that fetches all rows without a `userId` filter
- For nested resources (exercises, sets), always join back to the parent workout and verify `userId` — never query by child ID alone

```ts
// CORRECT — userId is always enforced
export async function getExercisesForWorkout(workoutId: number, userId: string) {
  return db
    .select({ exercise: exercises })
    .from(exercises)
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(and(eq(exercises.workoutId, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// WRONG — no userId check, any user could access any workout's exercises
export async function getExercisesForWorkout(workoutId: number) {
  return db.select().from(exercises).where(eq(exercises.workoutId, workoutId)); // ❌
}
```

Treat missing or mismatched `userId` as an authorization failure — return `null` or throw, never return another user's data.
