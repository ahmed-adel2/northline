# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, one codebase, different jobs.

**Public visitors — prospective and current patients.** They arrive from a search, an Instagram bio, or a shared link, on a phone, usually while deciding whether to book. They want to know who the dentists are and what they are qualified in, what the clinic does, roughly what it costs, whether other patients were treated well, where it is, and how to make contact. They must never reach clinical, financial, or scheduling records.

**Clinic staff — signed in, role-scoped.**

- **Clinic owners and group operators** decide and pay. They configure the clinic, hire staff, set prices, watch revenue, and compare branches, handle invoices, insurance claims, expenses, payroll, and reporting. They can book, reschedule, check patients in, take payment, and chase no-shows.
- **Dentists** chart, plan treatment, write notes, prescribe, and need a patient's tooth-level history in front of them during a visit, see clinic's schedule. They can book, reschedule, check patients in, take payment, and chase no-shows.
- **Receptionists** book, reschedule, write notes, check patients in, take payment, and chase no-shows, and add patient's tooth-level history.

The daily job: run a full clinic day — schedule, chart, treat, invoice, follow up — without stitching together a calendar, spreadsheet, chat app, and paper file.

## Product Purpose

DentoRash is a dental clinic platform delivered as a sellable, white-label template. Each clinic gets its own public website and its own staff-only management system, with its own database and its own branding.

It exists so a clinic can be reached, trusted, and booked from the outside, and then run entirely from the inside: scheduling, charting, treatment plans, pricing, billing, insurance, inventory, labs, payroll, and reporting in one place. Success means a patient finds the clinic and books without a phone call, and the clinic answers "how did the month go?" without opening a spreadsheet.

Because it is resold to multiple clinics, success also means a new clinic can be provisioned, seeded, branded, and launched without writing new code.

## Positioning

Built for dentistry rather than adapted to it. Charting, per-tooth treatment planning, insurance claims, and ZATCA e-invoicing are first-class parts of the product, and every figure traces back to a procedure, a tooth, and a doctor.

The template position is the differentiator: one clinic, one deployment, one database. A clinic's patients, prices, and records are physically separated from every other clinic's, its public site wears its own branding, and its staff accounts exist only inside it. Multi-branch operation is supported inside a single clinic.

## Operating Context

- The public site is the first touch: hero, about, team and qualifications, services, published pricelist, treated cases, patient testimonials, contact details, social links, and a persistent WhatsApp button.
- The clinic day: appointment calendar, check-in, in-chair charting, treatment plan acceptance, invoicing at the desk, recall and follow-up.
- Regulatory context in Saudi Arabia: ZATCA phase 2 e-invoicing and NPHIES insurance claims. Both ship as adapter interfaces with mocks in v1; certification is an external process.
- Multi-branch groups compare locations; branch staff are scoped to their own branch.
- Evaluation path for a clinic buyer: see the demo site, sign in to the demo clinic, then provision their own instance with their own branding, staff, procedures, and price list.
- Middle East and North Africa, with Egypt and Saudi Arabia as anchor markets. English ships first; Arabic and RTL are deferred but structurally planned for.
- Clinics differ in policy: some publish prices, some quote privately. The pricelist is public by default and can be switched off per clinic.

## Capabilities and Constraints

**Public site.** Home, about, team with qualifications and photos, services, published pricelist, treated cases with before/after images, testimonials, contact form, social links (Facebook, Instagram, WhatsApp, LinkedIn, email), opening hours, map, and a sticky WhatsApp contact button.

**Internal system.** Dynamic dashboard · patient profile and journey · dental chart (Universal and FDI notation, mixed dentition, perio charting, online signature) · patient management · CRM · automation and reminders · loyalty points · patient feedback · finance · treasury · payments · quotations · insurance management · ZATCA e-invoicing · NPHIES · payroll and commissions · inventory · labs · QR codes · consent forms · tasks · analytics · quick reports · patient map · team management · security · integrations · settings · logs.

**Explicitly out of v1.** WhatsApp Bot and WhatsApp automation (no Cloud API access; replaced by `wa.me` links and email). Native iOS, Android, and Huawei apps (responsive web instead that is completly responsive in mobile, tablet, and laptop viewports). PWA and service worker (so the app cannot launch offline). Full offline operation — charting only survives a dropped connection while the screen is open. Arabic and RTL.

**Pricing model.** One authoritative pricelist in billing, maintained by clinic staff, plus a separate published copy in the public site schema. Publishing is explicit. An issued invoice stores a price snapshot and is never silently rewritten; a draft invoice flags a changed source price and offers recalculation. The public figure never enters billing, and the internal figure is never published without an explicit action.

**Data and tenancy.** One Supabase Postgres project per clinic, one Vercel deployment per clinic, one Cloudflare R2 prefix per clinic. There is no runtime tenant router; clinic identity comes from environment configuration.

**Stack.** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, `src/app`, `src/style/globals.css`. Drizzle ORM over Supabase Postgres. Clerk for authentication. Vercel AI SDK through the AI Gateway for the assistant. Resend for email. `exceljs` for exports. Cloudflare R2 for files.

**Delivery plan.** Seven phases, each ending in something runnable, not a half-built module.

1. **Foundation.** Visual world locked, design tokens, UI primitives, environment contract, full database schema across fourteen namespaces, seeded demo clinic, Clerk with roles and audit logging, provisioning CLI, both layout shells, public/internal import boundary enforced.
2. **Public clinic site.** Home, about, team and qualifications, services, pricelist, cases, testimonials, contact, socials, sticky WhatsApp, SEO, publishing admin.
3. **Front desk.** Role-gated shell, dashboard, patients, appointment calendar, patient journey, tasks, QR codes.
4. **Clinical.** Tooth chart (FDI and Universal, perio, signature), treatment plans, quotations, prescriptions, consent forms, R2 attachments, offline resilience for charting.
5. **Money.** Price lists and the snapshot rule, invoices, payments, treasury, insurance and claims, ZATCA and NPHIES adapters, payroll and commissions, analytics over all-time/yearly/monthly/weekly/daily, Excel exports.
6. **Operations.** Inventory with automatic material deduction, labs, email automation and reminders, loyalty, feedback, CRM, patient map, logs, settings, team management.
7. **Intelligence and polish.** AI assistant, email flows, accessibility, performance, copy proofread.

Phase 0 must finish before anything is layered on it, because every later screen inherits the tokens, primitives, and permission model established there.

**Provisioning.** A new clinic is created by a command, not by hand: a Supabase project, migrations, seeded defaults, an R2 prefix, a Vercel project, its subdomain, and its environment variables. Seed data is flagged and removed for real clinics.

**Undecided.** Store pricing and plan structure. Payment provider for production (adapter only in v1). Arabic launch timing. Legal copy (privacy policy, terms).

## Brand Commitments

- **Name:** DentoRash. Domain `dentorash.vercel.app`, with a subdomain per clinic.
- **Voice:** practical and clinic-owner-facing. Concrete rather than aspirational. Speaks dentistry's language — tooth notation, chairside status, insurance, tax rules — rather than generic practice-software language.
- **Visual constraint, binding:** the clinical teal palette direction, chosen by the product owner. The wider visual world, typeface, and logo are not yet committed and are decided in the design process, not assumed here.
- **Per-clinic branding:** colours, logo, copy, and imagery are configurable per clinic. The template's own identity must not leak into a clinic's public site.
- No logo, brand typeface, or photography exists in the repository.

## Evidence on Hand

- The reference product is dentolize.com, consulted for the feature inventory, naming, and market context. It is a reference, not a client.
- Claims on that site are **not** this project's claims: 5,000+ dentists, 29 countries, 45+ features, 24-hour demo response, App Store 4.9, Google Play 4.8, Google 4.7, Google KSA 5.0, and named client clinics. Never reuse them.
- The repository ships a **synthetic demo clinic**: fictional staff, services, prices, patients, cases, and testimonials. Every demo record is flagged and is wiped on real-clinic provisioning. Demo names, quotes, and case images must never be presented as real patients or real outcomes.
- Absent and not to be invented: real clinic content, real testimonials, real client names, real ratings, real benchmarks, pricing of the product itself, and legal copy.

## Product Principles

1. Two surfaces, one hard boundary: a patient can always reach the clinic, and can never reach the records.
2. Every figure traces back to a treatment, a tooth, and a doctor — including the price on the invoice the patient actually received.
3. One clinic, one database, one deployment: isolation is structural, not a permission check someone might forget.
4. A new clinic launches from configuration, not from code.
5. Trust is earned by what the product refuses to do — rewrite an issued invoice, publish without consent, show a patient someone else's record.

## Accessibility & Inclusion

- Keyboard access and visible focus on every interactive surface, including the tooth chart.
- Contrast sufficient for daylight use at a reception desk, and for older patients reading on a phone outdoors.
- `prefers-reduced-motion` respected by every animation.
- English in v1, with logical CSS properties and no hard-coded left/right assumptions, so Arabic and RTL can be added without rebuilding layouts.
- Bilingual content and RTL become a requirement wherever Arabic ships.
