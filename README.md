# Northline Dental Clinic

Northline is a Next.js 16 dental-clinic application built on the DentoRash template. It includes a public clinic website and a Clerk-protected staff clinic system backed by Supabase PostgreSQL and Drizzle ORM.

The repository currently contains a **synthetic Northline demo clinic**. Patient, staff, appointment, invoice, inventory, treatment, lab, insurance, case, and testimonial data must be treated as fictional.

## Features

### Public website

- Home, about, services, team, pricelist, cases, testimonials, loyalty, and contact pages
- Responsive clinic header/footer and sticky WhatsApp action
- Public clinic settings for name, address, phone, email, opening hours, pricelist, and loyalty
- Clerk-backed patient check-in/arrival registration
- Demo-only appointment/contact forms where no real submission backend exists

### Staff system

- Dashboard and today's appointment overview
- Patient directory, patient profiles, registration, editing, and archival
- Appointment calendar and appointment CRUD
- Tasks and follow-ups
- FDI tooth chart/odontogram
- Treatment plans
- Lab orders
- Invoices and recorded payments
- Insurance claims
- Inventory
- Practice analytics and CSV export
- QR check-in and arrival export
- Staff management
- Clinic settings
- Audit log infrastructure

## Stack

- Next.js 16.4.6 App Router
- React 19.3
- TypeScript 5
- Tailwind CSS 4.3
- Clerk 7
- Drizzle ORM 0.45
- PostgreSQL/Supabase with `postgres` driver
- Drizzle Kit
- `tsx` for scripts

## Repository Map

```text
src/app/(public)/       Public route pages and layouts
src/app/(app)/          Staff routes, server actions, and internal UI
src/app/api/            API route handlers
src/app/checkin/        Clerk patient check-in
src/components/public/  Public reusable components
src/components/internal/Internal reusable components
src/db/                 Drizzle connection and schema
src/lib/                Auth, audit, analytics, formatting, demo, QR, settings
scripts/                Database seed and demo wipe
drizzle/                Generated migrations and metadata
public/images/          Public and case images
public/videos/          Clinic video assets
```

## Prerequisites

- Node.js compatible with Next.js 16
- pnpm
- A Supabase/PostgreSQL database
- A Clerk application and organization

## Installation

```powershell
pnpm install
```

Create `.env.local` with the variables below. Never commit this file or real secrets.

```dotenv
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

# Optional but recommended for staff organization isolation
CLERK_NORTHLINE_ORG_ID="org_..."

# Optional clinic display defaults
NEXT_PUBLIC_CLINIC_CURRENCY="EGP"
NEXT_PUBLIC_CLINIC_TZ="Africa/Cairo"
```

Clerk must be configured with sign-in/sign-up pages and an organization membership model for staff. The application resolves the staff role from `staff_members.clerk_user_id` or verified email binding.

For Supabase transaction poolers, use a pooler URL with Drizzle's `prepare: false` behavior. Database migration scripts use `DATABASE_URL`; seed/wipe scripts prefer `DIRECT_URL`.

## Database Setup

Apply existing migrations:

```powershell
pnpm db:migrate
```

Generate migrations after editing `src/db/schema.ts`:

```powershell
pnpm db:generate
pnpm db:migrate
```

Seed the synthetic clinic:

```powershell
pnpm db:seed
```

Remove all demo-flagged rows and demo-only staff:

```powershell
pnpm db:wipe-demo
```

The schema enables RLS on every table. Application database access is server-side through `DATABASE_URL`; Supabase REST clients must not be used as a substitute authorization boundary.

## Clerk Staff Access

`src/lib/auth.ts` requires:

1. a signed-in Clerk user;
2. membership/admin status in the configured Northline organization;
3. an active matching `staff_members` row.

Roles are:

- `owner`
- `dentist`
- `receptionist`

The matching row can already carry `clerk_user_id`, or bind by one matching verified primary email. Active staff without a matching organization/staff record receive `/403`.

## Development

```powershell
pnpm run dev
```

Open `http://localhost:3000`.

Public routes include `/`, `/about`, `/services`, `/team`, `/pricelist`, `/cases`, `/testimonials`, `/loyalty-points`, `/contact`, `/checkin`, `/sign-in`, and `/sign-up`.

Staff routes start at `/dashboard` and include `/patients`, `/calendar`, `/tasks`, `/clinical`, `/treatment-plans`, `/labs`, `/invoices`, `/insurance`, `/inventory`, `/analytics`, `/qr`, `/staff`, and `/settings`.

## Validation

```powershell
pnpm run typecheck
pnpm run lint
pnpm run build
```

For UI work, also verify:

- desktop and 375px layouts;
- public/staff route boundaries;
- loading and empty states;
- permission-denied behavior;
- reduced-motion behavior;
- keyboard focus.

## Demo-to-Real Clinic Checklist

- Replace `clinic_settings` identity and opening hours.
- Replace public copy, team, services, cases, and testimonials.
- Remove every synthetic demo row with `pnpm db:wipe-demo`.
- Add real staff and bind their Clerk user IDs.
- Verify owner/dentist/receptionist permissions.
- Configure real public/pricelist/loyalty availability.
- Configure the real phone, email, address, and WhatsApp number.
- Add real legal copy and privacy/terms routes if required.
- Replace demo media with licensed clinic media.
- Configure and verify production Clerk, Supabase, and hosting credentials.
- Enable production payment/email/storage integrations only after credentials are implemented.

## Current Limitations

- Public appointment and contact forms may be demo-only and do not send data.
- Settings integration statuses are display data, not proof of live provider connectivity.
- WhatsApp uses direct links rather than WhatsApp Cloud automation.
- Analytics uses a 32% estimated expense calculation when no expense ledger exists.
- R2, Resend, Google integrations, AI, and production payment providers require implementation.
- Arabic/RTL is structurally deferred.
- PWA/offline operation is not implemented.

## Documentation

- `PRODUCT.md`: product scope and capabilities.
- `DESIGN.md`: visual system and interaction conventions.
- `AGENTS.md`: repository and implementation instructions.
- `README.md`: setup and operations.
