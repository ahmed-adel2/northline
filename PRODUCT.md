# Northline Dental Clinic / DentoRash Product Brief

<!-- impeccable:product-schema 1 -->

## Platform

Web application built with Next.js App Router. It ships as a single deployable clinic template, with a public patient-facing site and a role-gated staff system.

## Product Identity

The application is a DentoRash dental-clinic platform. The current instance is branded **Northline Dental Clinic** and is a synthetic, sellable demo for the dental-clinic template.

- Public site: Northline-branded pages for discovery, trust, services, pricing, cases, team, contact, and patient check-in.
- Staff system: an internal clinic operations product for the receptionist, dentist, and owner roles.
- Tenant model: one clinic deployment, one database, one configuration. The repository is not a runtime multi-tenant router.
- Demo model: patient, staff, appointment, invoice, inventory, lab, insurance, and case data are fictional. All seeded database records are marked `is_demo`.

Do not present demo patients, prices, testimonials, case outcomes, ratings, staff, or clinic details as real. The public demo banner explicitly identifies fictional content.

## Users

### Public visitors

Prospective and current patients use the public site to understand the clinic, see the team and services, review a published pricelist, view case studies and testimonials, find contact details, and register a QR check-in.

Public users must never be able to read clinical, financial, scheduling, or staff-only records.

### Clinic staff

- **Owner:** full application access, including settings, staff, clinical records, invoices, inventory, insurance, analytics, and patient archival.
- **Dentist:** scheduling, patient records, clinical charting, treatment plans, labs, inventory, tasks, and reporting.
- **Receptionist:** scheduling, patient records, tasks, labs, inventory, invoices, claims-facing workflows, and QR arrivals. Patient archival and clinic settings are owner-only.

Roles come from the linked `staff_members` row for the signed-in Clerk user. The `/403` route handles denied access.

## Product Purpose

The product connects a clinic's outside presence with its day-to-day operations:

1. Help patients discover and contact the clinic.
2. Surface the clinic's public information, opening hours, services, published prices, team, and cases.
3. Register patient arrivals through Clerk sign-in and QR/check-in flow.
4. Manage patients, appointments, tasks, tooth findings, treatment plans, inventory, lab orders, invoices, insurance claims, staff, settings, and analytics.

The core operating loop is: find or register a patient, book a visit, check in, chart and plan care, issue or update billing, follow up, and review practice performance.

## Implemented Capabilities

### Public clinic website

- `/`: demo-aware home page with service overview, care process, contact action, clinic video, and tooth visualization.
- `/about`: clinic story and presentation.
- `/services`: service overview and pricelist visibility behavior.
- `/team`: staff qualifications and public team content.
- `/pricelist`: public procedure prices; hidden when `clinic_settings.public_pricelist` is false.
- `/cases`: before/after case examples, clearly identified as demo data.
- `/testimonials`: synthetic testimonials and feedback presentation.
- `/loyalty-points`: loyalty points page; hidden when loyalty is disabled.
- `/contact`: clinic address, phone, email, opening hours, Google Maps link, and WhatsApp/call actions.
- Sticky public header/footer, WhatsApp contact button, and responsive public layout.
- `/checkin`: Clerk sign-in required; records an arrival and attempts to match it to a patient by email or phone.
- `/sign-in` and `/sign-up`: Clerk-hosted account flows.

The public contact and appointment-request forms in the current demo are intentionally non-submitting where they do not have a real backend.

### Staff system

- `/dashboard`: today's appointments, waiting/in-progress counts, open tasks, active patient count, and due follow-ups.
- `/patients`: searchable patient directory, filtering, registration, detail, edit, archive, and clinical/financial navigation.
- `/calendar`: schedule views, appointment creation and editing, status, rooms, doctors, procedures, and date filtering.
- `/tasks`: task creation, assignment, priorities, due dates, status updates, and patient-linked follow-ups.
- `/clinical`: FDI tooth chart/odontogram, patient selection, tooth findings, and finding updates.
- `/treatment-plans`: patient and doctor planning, itemized care stages, amounts, status, and plan updates.
- `/labs`: lab order tracking for partners, work types, tooth, dates, cost, and status.
- `/invoices`: draft/issued/partial/paid/overdue invoice data, payment recording, editing, and PDF/print-oriented UI.
- `/insurance`: insurance claim records, submission/approval/rejection states, and claim updates.
- `/inventory`: stock items, categories, quantities, minimum levels, suppliers, costs, statuses, and restocking.
- `/analytics`: all/daily/weekly/monthly/yearly practice analytics, revenue and collection views, patient status, top procedures, and CSV export.
- `/qr`: clinic QR check-in content and arrival export.
- `/staff`: staff and doctor profiles, roles, specialties, availability, branch assignment, and commission fields.
- `/settings`: clinic identity, opening hours, public pricelist, loyalty availability, and integration status display.

The route set is not a placeholder: pages are backed by Drizzle queries and many include server actions for mutations.

## Data Model

The database is PostgreSQL/Supabase through Drizzle. Core namespaces currently include:

- Branches and staff
- Patients and patient arrivals
- Appointments and tasks
- Audit logs
- Invoices
- Treatment plans
- Inventory
- Lab orders
- Insurance claims
- Tooth findings
- Clinic settings
- Doctor monthly salaries

Every table enables PostgreSQL RLS. The server-only Postgres pooler role is used by application code, with no client REST access intended. New tables and schema changes must preserve the RLS convention and enable RLS explicitly.

Each main business table participates in the demo lifecycle through `is_demo` and timestamps. `tooth_findings.patient_id` is currently a text identifier in the schema and should be treated carefully until migrated to a UUID foreign key.

## Authentication and Authorization

- Clerk supplies public/patient and staff authentication.
- Clerk middleware protects every route except the explicit public route matcher.
- Staff access additionally requires a Northline organization/admin relationship and a matching active staff row.
- `src/lib/auth.ts` resolves `{ userId, name, role, staffId }` and exposes permission checks.
- Owner bypasses module permission checks.
- Patient, appointment, task, clinical, invoice, lab, inventory, settings, staff, and export permissions are centralized in `PERMS`.
- Mutations must call `requirePerm(...)` server-side; UI hiding alone is insufficient.

## Integration Status

Shipped or directly configured:

- Clerk authentication
- Supabase PostgreSQL
- Drizzle ORM and migrations
- Dynamic clinic settings
- QR/check-in route
- CSV export in analytics and invoice-report UI
- Audit log infrastructure
- Local public media and Next.js image/video assets

Configured as demo status/UI or not yet production-integrated:

- Resend email
- WhatsApp Business Cloud API
- Google Calendar/Drive
- Cloudflare R2 file storage
- AI assistant
- Production payment provider

The settings page may show these integration cards, but displaying a "connected" state does not itself prove that a live provider integration exists.

## Pricing and Billing Rules

- Numeric invoice amounts are stored as PostgreSQL numeric values and formatted in the clinic's configured currency.
- Invoice creation currently applies a 14% tax in the server action.
- `createInvoice` snapshots a consultation item and issued totals.
- `updateInvoice` recalculates balance against amounts already paid and prevents totals below paid amounts.
- Payment recording increments paid and recalculates balance/status.
- Invoice status choices include draft, issued, partial, paid, overdue, and voided-capable UI data.
- Clinical and public pricelists are separate concepts. No public price is automatically the internal authoritative price.

Future implementation must preserve issued invoice snapshots and prevent silent rewriting of issued totals.

## Demo and Provisioning Behavior

`pnpm db:seed` creates the Northline synthetic clinic and demo rows. `pnpm db:wipe-demo` deletes demo-flagged data and demo-only staff while retaining staff linked to real Clerk accounts.

For a real clinic:

1. Create/update its Supabase database and Clerk organization.
2. Configure environment variables.
3. Apply migrations.
4. Seed only real data or run the demo wipe.
5. Configure clinic settings and public publishing choices.
6. Verify staff-user bindings and permissions.

One-clinic deployment identity comes from configuration, not a runtime tenant router.

## Non-Goals and Deferred Work

- Do not add a runtime tenant router; clinic isolation is deployment/database-level.
- No native iOS, Android, or Huawei application.
- No PWA or offline production guarantee.
- English is the implemented UI; RTL/Arabic is deferred.
- WhatsApp automation requires a real Cloud API integration. The current application provides `wa.me`/contact links and QR behavior.
- CRM/loyalty/automation may have public or partial UI concepts, but are not equivalent to production-integrated services.
- There is no full payroll, treasury, consent/signature, R2 attachment, or AI assistant implementation unless explicitly added later.
- Legal copy, real product pricing, production payment terms, and real patient outcome claims have not been provided.

## Product Principles

1. Public trust and staff privacy are separate surfaces with a hard boundary.
2. A staff mutation is authorized in server code, not only hidden by UI.
3. Clinical figures and billing totals must be traceable and never silently rewritten.
4. Demo data is synthetic and must remain labeled in every public context.
5. A clinic can be launched by configuration and database provisioning rather than by forking application code.
6. Preserve English and logical CSS layout so RTL can be introduced structurally later.
