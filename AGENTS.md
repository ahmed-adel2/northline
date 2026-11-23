# AGENTS.md

## Stack
- Next.js (App Router), TypeScript, Tailwind. Check package.json for exact versions.
- Don't add dependencies without asking.

## Commands
- Dev: `pnpm run dev`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Run build + lint before declaring a task done.

## Structure
- Routes: `app/`
- Components: `components/`
- Utils/lib: `lib/`
- Prefer Server Components; add `"use client"` only when needed.

## UI work
- Always use the `impeccable` skill for any UI/design task.
- Reuse existing components and design tokens before creating new ones.
- Brand: <colors, fonts, tone, one line each>

## Rules
- Make minimal, focused changes; don't refactor unrelated code.
- Match existing code style and naming.
- Never commit secrets or edit `.env*` files.
- If requirements are unclear, ask before building.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
