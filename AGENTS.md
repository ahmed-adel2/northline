# Agent Guide
Northline/DentoRash: Next.js 16.4.6, React 19, Clerk, Supabase PostgreSQL, Drizzle. Read `PRODUCT.md`, `DESIGN.md`, `README.md`, and `package.json` before changes.
## Rules
- App Router in `src/app`; TypeScript only, no `any`. Reuse existing CSS/tokens; Tailwind v4 is installed.
- Drizzle for DB; Clerk for auth. Protected DB work belongs in Server Components/server actions. Add `"use client"` only for browser interaction.
- Do not add dependencies without approval. Never edit/commit/log `.env*` secrets.
- Before changing Next.js behavior, routes, params, search params, caching, middleware, or layouts, read the matching guide in `node_modules/next/dist/docs/`. Params/searchParams are Promises; follow local patterns.
- Keep the generated `nextjs-agent-rules` block in this file.
## Structure
`src/app/(public)` public routes; `src/app/(app)` staff routes/actions/client modules; `src/app/api` handlers; `src/app/checkin`, `sign-in`, `sign-up` flows. Shared public/internal components: `src/components/{public,internal}`. Auth/audit/settings/analytics/demo helpers: `src/lib/{auth,audit,public-clinic-settings,analytics,demo-data}.ts`. DB: `src/db/{index,schema}.ts`; migrations: `drizzle/`; seed/wipe: `scripts/`. Route groups do not affect URLs.
## Data, auth, mutations
- Schema changes: edit `src/db/schema.ts` → `pnpm db:generate` → inspect SQL → migrate intended DB → update queries/types. DB commands need `.env.local`; migrations use `DATABASE_URL`, seed/wipe prefer `DIRECT_URL`.
- Tables use RLS; server access is the boundary—Supabase REST is not an app data API. Use explicit Drizzle filters/pagination; currency numerics are runtime strings, convert with `Number()` only for calculations/formatting.
- Public routes may expose clinic/contact info, published services/prices, public team/cases/testimonials, check-in/account prompts—never patient/staff records, schedules, balances, invoices, chart findings, or audits.
- Internal routes use `getSession()`/`requirePerm(...)`. Resolve staff identity through `getSession()`; never infer role from email/query params. Every mutation requires `requirePerm(...)`; owner bypasses permission tables, not staff linkage.
- Follow colocated `"use server"` actions: authorize, validate types/domain constraints, mutate, audit with `logAudit()`, revalidate affected paths, return `{ok:true,data}` or `{ok:false,error}`. Audit failure must not undo/block the mutation. Recheck authorization when moving/extracting actions.
- Use `notFound()` for missing records. Staff links use stable patient codes (e.g. `P-001`), resolve UUID internally.
## Demo/content
Mark every seed row `is_demo`; demo claims/content must be explicitly synthetic, never portray seed staff as real/registered, and cleanup must not remove staff with real `clerk_user_id`. Do not claim integrations are live based only on settings UI; do not invent testimonials, ratings, clinic claims, legal copy, or benchmarks.
## UI
For UI/design work, use the `impeccable` skill and read `PRODUCT.md`/`DESIGN.md`. Public = Persuade; internal = Operate. Reuse components/classes and clinical teal/Geist tokens; one primary action per view; semantic badges only for real states. Ensure labels, keyboard focus, 44px mobile targets, 375px + desktop layouts, reduced-motion support, and logical CSS properties. No Framer Motion, gradients, glassmorphism, blobs, autoplay, or generic SaaS ornament.
Styles: `src/style/globals.css` (tokens), `src/app/home.css` (public shell), route-local public CSS, `src/app/(app)/{internal,mobile,polish}.css` (staff UI). Check existing classes before adding one.
## Verify and document
Run `pnpm run build` and `pnpm run lint` for UI/code work; also `pnpm run typecheck` for TypeScript changes. Other commands: `pnpm run dev`, `pnpm db:{generate,migrate,seed,wipe-demo}`. Make the smallest coherent change, preserve out-of-scope behavior, search existing patterns, and update directly related docs—including `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, or `README.md` for material feature/architecture changes.
`````
