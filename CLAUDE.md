# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Interactive web app with solutions to "Exercises for Programmers" by Brian P. Hogan. 57 exercises across 10 chapters (02–10), each implemented as a Next.js page.

## Commands

```bash
pnpm dev         # Start development server
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # ESLint
pnpm commit      # Interactive conventional commit prompt (commitizen)
```

No test framework is configured.

## Environment Variables

Create `.env.local` with:
```
OPENWEATHERMAP_API_KEY=...   # Exercise 48
OMDB_API_KEY=...             # Exercise 50
```

Exercises 47 (ISS) and 49 (Flickr) hit public APIs and need no key.

## Architecture

**Tech stack**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 (strict), Semantic UI React 3 (beta), styled-components 6, `marked` (markdown rendering).

**Routing**: Exercise pages live at `src/app/[chapter]/[exercise-name]/page.tsx`. Chapter folders use numeric prefixes matching the book (e.g. `02-input-processing-and-output/`).

**All components and pages are `'use client'`** — React hooks are used throughout; there is no server-rendered exercise UI.

### Component hierarchy

- `Exercises` — category container; provides `color` and `folder` via `ExercisesContext` to children
- `Exercise` — reads context to build its `<Link href>` dynamically; uses `next/link`, not `Grid.Column as="a"`
- `Solution` — page wrapper; renders a back button (`useRouter().back()`) and an info icon that lazily fetches and renders a markdown problem statement into a modal on demand

`src/components/index.ts` re-exports all three; import from there.

### Exercise page pattern

Every exercise page follows the same structure:

1. Input state initialised to `""` (or `null` for numbers)
2. Output state initialised to `null`; rendered only after first submission
3. Calculations in the `onClick` handler, never during render
4. Constants (conversion factors, lookup tables) defined at module level
5. `.trim()` called in `onChange` so whitespace-only strings fail the empty-check guard
6. `parseFloat`/`parseInt` results checked with `isNaN`; domain errors (division by zero, invalid ranges) surface as user-facing messages, not crashes
7. Multi-field forms store state as an object and use `event.target.name` to update fields

### Markdown loading

Exercise pages pass a path like `/exercises/02-.../01-....md` to `<Solution>` via the `markdown` prop. On first icon click, `Solution` fetches the file, parses it with `marked` using a custom `Renderer`, and displays HTML via `dangerouslySetInnerHTML`. The renderer rewrites relative image `src` values to `/exercises/{chapter}/` so assets resolve correctly.

### API routes

Four routes under `src/app/api/` proxy external services for chapters 09–10:

| Route | External API | ISR TTL | Auth |
|---|---|---|---|
| `/api/weather` | OpenWeatherMap | 5 min | `OPENWEATHERMAP_API_KEY` env or `key` query param |
| `/api/movie` | OMDB | 1 hour | `OMDB_API_KEY` env or `key` query param |
| `/api/flickr` | Flickr public feed | 1 min | none |
| `/api/whos-in-space` | Open Notify | 1 min | none |

OMDB error handling checks both HTTP status and `data.Response === "False"`.

### Semantic UI CSS

CSS is kept as a local file at `src/app/semantic.css` (with fonts/images under `src/app/themes/`), not imported from the `semantic-ui-css` npm package. The npm package's minified CSS contains a selector that Turbopack's strict CSS parser rejects.

### Package manager

Uses pnpm 11. Key config:
- `package.json` → `pnpm.onlyBuiltDependencies: ["sharp", "unrs-resolver"]` — approves Next.js dependency build scripts under pnpm 11's stricter defaults
- `semantic-ui-react@3.0.0-beta.2` declares peer deps against React 16–18 but the project runs React 19; pnpm resolves this without a strict peer check

### Other notes

- Path alias `@/*` → `src/*`
- Component prop types in co-located `.types.ts` files
- `next.config.mjs` enables the styled-components SWC compiler and React strict mode
- Semantic UI `Grid` layouts use `stackable` and `doubling` for responsive behaviour
- Public markdown files live in `public/exercises/{chapter}/`
