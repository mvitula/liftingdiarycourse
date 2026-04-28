# Routing Coding Standards

## Route Structure

All application pages must live under `/dashboard`. There are no top-level app pages other than the root marketing/landing page at `/`.

```
/                          # Public landing page
/dashboard                 # Dashboard home (protected)
/dashboard/workout/new     # Create workout (protected)
/dashboard/workout/[id]    # View/edit workout (protected)
```

Do not create routes outside of `/dashboard` for authenticated app functionality.

## Route Protection

Route protection is enforced via Next.js middleware using Clerk. All `/dashboard` routes are protected automatically — no per-page auth checks are needed.

The middleware is defined at `src/middleware.ts`:

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- Do NOT add per-page redirects to `/sign-in` as a substitute for middleware protection
- Do NOT weaken or narrow the middleware matcher
- Do NOT add route-group-based auth wrappers — middleware is the single protection layer

## File Conventions

Follow Next.js App Router conventions under `src/app/dashboard/`:

- `page.tsx` — the page component (server component by default)
- `layout.tsx` — shared layout for a route segment (add only when needed)
- `actions.ts` — Server Actions for that route (mutations only; see `data-mutations.md`)
- `_components/` — components private to that route segment

## Navigation

Use Next.js `<Link>` for all internal navigation. Do not use `<a>` tags or `router.push` for page transitions unless there is a specific programmatic need (e.g., redirecting after a form submission in a Server Action).

```tsx
import Link from "next/link";

<Link href="/dashboard">Back to dashboard</Link>
```

After a successful Server Action mutation, redirect server-side using `redirect()` from `next/navigation`:

```ts
import { redirect } from "next/navigation";

redirect("/dashboard");
```
