# Data Mutations

## CRITICAL: Server Actions Only

All data mutations in this app **must** be done exclusively via Next.js Server Actions.

**Never mutate data via:**
- Route handlers (`src/app/api/`)
- Client-side fetch/axios calls
- Any other mechanism (SWR mutations, `useEffect` with POST, etc.)

## Server Action File Conventions

Server actions must live in colocated `actions.ts` files, placed alongside the page or component that uses them.

```
src/app/
  dashboard/
    page.tsx
    actions.ts     # server actions for the dashboard route
  workouts/
    [id]/
      page.tsx
      actions.ts   # server actions for the workout detail route
```

Every `actions.ts` file must begin with the `"use server"` directive.

```ts
"use server";
```

## Parameter Typing

All server action parameters must be explicitly typed. `FormData` is **never** an acceptable parameter type.

```ts
// CORRECT — typed parameters
export async function createWorkout(params: CreateWorkoutParams) { ... }

// WRONG — FormData is forbidden
export async function createWorkout(formData: FormData) { ... } // ❌
```

## Validation with Zod

Every server action must validate its arguments with [Zod](https://zod.dev/) before touching the database. Define a schema per action and call `.parse()` (or `.safeParse()` when you want to return a validation error rather than throw).

```ts
"use server";

import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
});

type CreateWorkoutParams = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(params: CreateWorkoutParams) {
  const validated = createWorkoutSchema.parse(params);
  await insertWorkout(validated.name, validated.date, userId);
}
```

Never trust input data even when TypeScript types suggest it is safe — Zod is required on every action.

## Database Mutations via /data Helpers

Server actions must **not** call Drizzle ORM directly. All database writes must go through helper functions in the `src/data/` directory.

**Rules:**
- `src/data/` helper functions are the only place Drizzle ORM write calls are written
- Server actions call these helpers; they do not import from `@/db` themselves
- Helper functions must accept a `userId` parameter and enforce ownership on every write

### Directory structure

```
src/
  data/
    workouts.ts   # insertWorkout, updateWorkout, deleteWorkout, etc.
    exercises.ts  # insertExercise, deleteExercise, etc.
    sets.ts       # insertSet, updateSet, deleteSet, etc.
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function insertWorkout(name: string, date: string, userId: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ name, date, userId })
    .returning();
  return workout;
}

export async function deleteWorkout(workoutId: number, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Example server action

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
});

type CreateWorkoutParams = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(params: CreateWorkoutParams) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse(params);
  return insertWorkout(validated.name, validated.date, userId);
}
```

## Data Authorization

Every mutation must be scoped to the authenticated user. A user must never be able to modify another user's data.

- Always obtain `userId` from Clerk's `auth()` inside the server action — never accept `userId` as a parameter from the caller
- Always pass `userId` into every `src/data/` helper
- Always include `eq(table.userId, userId)` in every `where` clause on update/delete operations
- For nested resources (exercises, sets), join back to the parent workout and verify `userId` — never mutate by child ID alone

```ts
// CORRECT — userId is fetched server-side and enforced in the query
export async function deleteExercise(exerciseId: number, userId: string) {
  await db
    .delete(exercises)
    .where(
      and(
        eq(exercises.id, exerciseId),
        exists(
          db.select().from(workouts).where(
            and(eq(workouts.id, exercises.workoutId), eq(workouts.userId, userId))
          )
        )
      )
    );
}
```

```ts
// WRONG — no userId check, any user could delete any exercise
export async function deleteExercise(exerciseId: number) {
  await db.delete(exercises).where(eq(exercises.id, exerciseId)); // ❌
}
```

Treat a missing or mismatched `userId` as an authorization failure — throw an `"Unauthorized"` error, never silently proceed.

## Redirects

`redirect()` from `next/navigation` must **never** be called inside a server action. Redirects must be handled client-side after the server action resolves.

```ts
// CORRECT — redirect is done client-side after the action resolves
"use client";

import { useRouter } from "next/navigation";
import { createWorkout } from "./actions";

export function NewWorkoutForm() {
  const router = useRouter();

  async function handleSubmit() {
    await createWorkout({ ... });
    router.push("/dashboard"); // ✅ redirect after action resolves
  }
}
```

```ts
// WRONG — redirect() called inside a server action
export async function createWorkout(params: CreateWorkoutParams) {
  // ...
  redirect("/dashboard"); // ❌
}
```
