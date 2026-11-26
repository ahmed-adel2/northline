# Agent Guide

## Project

Northline/DentoRash is a Next.js 16 + React 19 dental-clinic web application. It has a public clinic website and a Clerk-protected staff system backed by Supabase PostgreSQL and Drizzle ORM.

Read these before making changes:

- `PRODUCT.md` for product truth, capabilities, and boundaries.
- `DESIGN.md` for visual tokens and UI conventions.
- `README.md` for setup and commands.
- `package.json` for exact scripts and dependencies.

## Non-Negotiable Stack Rules

- Next.js App Router under `src/app`.
- TypeScript everywhere; no `any`.
- Tailwind CSS v4 is installed, but most existing UI styling is in project CSS. Reuse existing classes/tokens.
- Drizzle ORM for database access.
- Clerk for auth.
- Server Components and server actions for protected DB work.
- Add `"use client"` only for interactive browser-owned components.
- Do not add dependencies. If a missing dependency is genuinely necessary, stop and request approval before changing the manifest.

## Repository Layout

- `src/app/(public)/`: public routes and public layouts.
- `src/app/(app)/`: staff routes, server actions, client modules, and internal CSS.
- `src/app/api/`: API route handlers.
- `src/app/checkin/`: Clerk patient-arrival/check-in flow.
- `src/app/sign-in/` and `src/app/sign-up/`: Clerk UI routes.
- `src/components/public/`: public reusable components.
- `src/components/internal/`: staff reusable components.
- `src/lib/auth.ts`: Clerk/Drizzle staff-session and permission resolution.
- `src/lib/audit.ts`: audit logging helper.
- `src/lib/demo-data.ts`: synthetic demo data.
- `src/lib/public-clinic-settings.ts`: public settings fallback and database read.
- `src/lib/analytics.ts`: practice analytics calculations.
- `src/db/index.ts`: server-only Drizzle connection.
- `src/db/schema.ts`: tables, enums, RLS, and inferred types.
- `scripts/seed.ts`: demo data seed.
- `scripts/wipe-demo.ts`: remove demo-flagged data.
- `drizzle/`: migration SQL and Drizzle metadata.
- `public/images/` and `public/videos/`: clinic media.

Route folders using `(public)` and `(app)` are route groups, not URL segments.

## Next.js Specifics

This is Next.js 16.4.6, not an older Next.js model. Before changing framework behavior, routes, params, search params, caching, middleware, or layouts, read the relevant local guide in `node_modules/next/dist/docs/`. The project also contains generated agent guidance:

```md
<!-- BEGIN:nextjs-agent-rules -->
```

Keep that guidance in `AGENTS.md` when regenerating or editing it.

Server Component dynamic params and search params are Promise-based in this project. Follow the existing `params: Promise<{...}>` and `searchParams: Promise<{...}>` patterns.

## Commands

```powershell
pnpm run dev
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:wipe-demo
```

Validation requirement: run `pnpm run build` and `pnpm run lint` before declaring UI/code work done. Run `pnpm run typecheck` for TypeScript changes too.

Database commands require `.env.local`. `db:generate` and `db:migrate` read `DATABASE_URL`; seed/wipe prefer `DIRECT_URL` and then `DATABASE_URL`.

## Environment Variables

- `DATABASE_URL`: Supabase/transaction pooler Postgres connection used by the application and Drizzle.
- `DIRECT_URL`: direct Postgres connection for seed/wipe scripts.
- Clerk variables: standard `NEXT_PUBLIC_CLERK_*` and Clerk server credentials expected by `@clerk/nextjs`.
- `CLERK_NORTHLINE_ORG_ID` or `CLERK_ORG_ID`: optional configured Northline organization ID.
- `NEXT_PUBLIC_CLINIC_CURRENCY`: defaults to `EGP`.
- `NEXT_PUBLIC_CLINIC_TZ`: defaults to `Africa/Cairo`.

Never commit or log secrets. Never edit `.env*` files unless the user explicitly asks.

## Database Workflow

1. Edit `src/db/schema.ts`.
2. Run `pnpm db:generate`.
3. Inspect generated SQL in `drizzle/`.
4. Run `pnpm db:migrate` against the intended database.
5. Update inferred types and affected queries/actions.
6. Seed/wipe safely if demo data is affected.

Tables enable RLS with `.enableRLS()`. Keep server-side access as the architectural boundary: the Supabase REST API is not an application data API.

Use Drizzle conditionals and explicit `.where(...)`; do not fetch unbounded lists where filters/pagination are intended.

Numeric currency columns are strings at runtime. Convert with `Number(...)` only at calculation/formatting boundaries.

## Authentication and Authorization

- Public routes are explicitly listed in `src/middleware.ts`.
- Internal routes pass through Clerk middleware and then `getSession()`/`requirePerm(...)`.
- Resolve staff identity through `getSession()`; do not infer the role from an email or query parameter.
- Call `requirePerm(...)` for every mutating server action.
- Owner bypasses permission tables but staff row linkage is still required.
- Do not expose public staff, patient, appointment, invoice, or audit records.

## Mutations and Audit

Follow existing server-action patterns:

```ts
"use server";

export async function exampleAction(formData: FormData) {
  const session = await requirePerm("...");
  // validate
  // mutate
  await logAudit(session, { action: "update", entity: "...", entityId: "...", before, after });
  revalidatePath("/...");
  return { ok: true };
}
```

- Validate both types and domain constraints.
- Return `{ ok: true, data }` or `{ ok: false, error }` consistently for action results.
- Revalidate every affected route.
- Use `logAudit()` for create/update/status/payment/settings mutations.
- Audit failure must not block or undo the primary user action.
- Recheck authorization after any action is relocated or extracted.

## Public vs Internal Boundaries

Public routes may show:

- clinic identity and contact information;
- services and published prices;
- public team/cases/testimonials;
- a check-in page and account prompts.

Public routes must not query or serialize patient records, staff schedules, balances, invoices, chart findings, or audit logs.

Internal pages must use `getSession()` or `requirePerm(...)` directly or through their layout.

## Demo Data

Never describe demo content as real. Keep synthetic content explicitly labeled. `is_demo` rows are the cleanup contract for `db:wipe-demo`.

Demo lifecycle code should:

- mark every seed row;
- make public claims synthetic;
- not present seed staff as registered real staff;
- keep real `clerk_user_id` staff out of demo cleanup.

## UI Work

Always use the `impeccable` skill for UI/design tasks.

- Read `PRODUCT.md` and `DESIGN.md`.
- Reuse existing components and CSS classes.
- Two surfaces: public = Persuade; internal = Operate.
- Use the existing clinical teal palette and Geist fonts.
- One primary action per view.
- Use semantic badges only for real states.
- Use visible labels, keyboard focus, and 44px mobile targets.
- No Framer Motion.
- No gradients, glassmorphism, decorative blobs, autoplay, or generic SaaS ornament.
- Verify 375px and desktop layouts.
- Preserve `prefers-reduced-motion`.
- Use logical properties for layout where practical.

## Styling Locations

- Shared global tokens: `src/style/globals.css`.
- Public page shell: `src/app/home.css`.
- Public route-specific styles: colocated in `src/app/(public)/`.
- Internal shell: `src/app/(app)/internal.css`.
- Internal responsive: `src/app/(app)/mobile.css`.
- Internal finishing/status styles: `src/app/(app)/polish.css`.

Before adding a utility or class, check whether an existing named class already expresses the pattern.

## Route and Component Patterns

- Prefer Server Components for pages and DB reads.
- Put browser state in `*-client.tsx`.
- Put mutation functions in colocated `actions.ts`.
- Use route `loading.tsx` for expensive staff transitions.
- Use `notFound()` for missing records rather than returning a success-shaped fallback.
- Use a stable patient code (`P-001`) in public staff links, while resolving the database UUID internally.

## Data and Content Accuracy

- Do not assume integrations are production-live because settings UI says connected.
- Do not add real testimonials, ratings, clinic claims, legal copy, or benchmarks.
- Clearly distinguish shipped behavior from planned capabilities.
- Future English/Arabic work should prepare RTL with logical CSS properties.

## Change Discipline

- Make the smallest coherent change.
- Search prior patterns before introducing a helper or component.
- Preserve existing behavior outside scope.
- Update directly related documentation.
- Update `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, and `README.md` when features or architecture materially change.
- Run focused checks, then full build/lint/typecheck as appropriate.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
