# UI Coding Standards

## Component Library

**All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com/) components.**

- NO custom UI components are to be created under any circumstances
- NO raw HTML elements styled with Tailwind in place of an available shadcn/ui component
- If a required component does not yet exist in the project, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- shadcn/ui components live in `src/components/ui/` — do not modify these files directly

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/).

### Required format

Dates must display with an ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2026
```

### Implementation

Use `format` from `date-fns` with the `do MMM yyyy` format token:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

> `do` produces the ordinal day (1st, 2nd, 3rd, 4th…). `MMM` is the abbreviated month name. `yyyy` is the four-digit year.
