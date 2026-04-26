# Auth Coding Standards

## Provider: Clerk

**All authentication in this app is handled exclusively by [Clerk](https://clerk.com/) (`@clerk/nextjs`).**

- Do NOT implement custom authentication logic
- Do NOT use any other auth library (NextAuth, Auth.js, etc.)
- Clerk is the single source of truth for user identity

## Middleware

Route protection is enforced globally via `clerkMiddleware` in `src/middleware.ts`. All routes are protected by default.

```ts
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

Do not bypass or weaken the middleware matcher — it must cover all app and API routes.

## Getting the Current User

In Server Components and server-side code, retrieve the authenticated user via Clerk's `auth()` helper:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is a `string | null` — always handle the `null` case (unauthenticated)
- If `userId` is `null` in a protected context, redirect or throw — never proceed without it
- Never pass a hardcoded or fabricated `userId` in place of the real value

## UI Components

Use Clerk's pre-built components for sign-in, sign-up, and user management. This app uses modal mode:

```tsx
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

<SignInButton mode="modal" />
<SignUpButton mode="modal" />
<UserButton />
```

- Do NOT build custom sign-in or sign-up forms
- `<UserButton />` is the only approved way to render the current user's avatar/menu

## Layout

Wrap the root layout with `<ClerkProvider>` — this is required for all Clerk hooks and components to function:

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## userId and the Database

The Clerk `userId` string is the foreign key that scopes all data to the authenticated user. See `data-fetching.md` for rules on passing `userId` into every database query.

- `workouts.userId` stores the Clerk `userId` directly — there is no separate users table
- Never store PII from Clerk (email, name) in the database; use `userId` only
