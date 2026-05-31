# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16, React 19, and TypeScript app for interactive solutions to *Exercises for Programmers*. Route pages live in `src/app`, grouped by chapter and exercise slug, for example `src/app/07-data-structures/35-picking-a-winner/page.tsx`. Shared UI components live in `src/components`, with component props kept in adjacent `*.types.ts` files. Exercise prompt content is stored as Markdown under `public/exercises/<chapter>/<exercise>.md`. Global styling is in `src/app/semantic.css`, with Semantic UI React and styled-components used for UI.

## Build, Test, and Development Commands

Use pnpm; the repo pins `pnpm@10.33.4`.

- `pnpm install`: install dependencies.
- `pnpm dev`: start the local Next.js development server.
- `pnpm build`: create a production build and catch route/type integration issues.
- `pnpm start`: run the production server after a successful build.
- `pnpm lint`: run ESLint using Next.js core-web-vitals and TypeScript rules.
- `pnpm test`: run Jest unit tests.
- `pnpm test:watch`: run Jest in watch mode while developing.
- `pnpm commit`: create a Conventional Commit through Commitizen.

## Coding Style & Naming Conventions

Write TypeScript and React function components. Follow the existing style: two-space indentation, double quotes, semicolons, named props interfaces/types in adjacent `*.types.ts` files, and default exports for page/component files where already used. Keep exercise route folders numeric and slugged, matching the Markdown file name, such as `48-grabbing-the-weather`. Prefer Semantic UI React components for layout consistency before introducing new UI primitives.

## Testing Guidelines

Unit tests use Jest with React Testing Library and `@testing-library/jest-dom`. Run `pnpm test` for the suite, or `pnpm test:watch` while developing. Prefer user-facing queries such as `getByRole`, `getByText`, and `getByLabelText`. Colocate tests near the code they cover and name files `*.test.ts` or `*.test.tsx`. For changes, run `pnpm test`, `pnpm lint`, and `pnpm build` before opening a PR.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits enforced by commitlint and Husky. Use examples like `fix: update weather route`, `feat: add exercise 58`, or `docs: update README`. Release automation treats `feat` as minor, `fix` as patch, and breaking changes as major. Pull requests should include a short description, linked issue when relevant, verification commands run, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Do not commit `.env.local` or API keys. Exercises using external services require `OPENWEATHERMAP_API_KEY` and `OMDB_API_KEY` locally. Keep API access in `src/app/api/*/route.ts` server routes rather than exposing secrets to client components.
