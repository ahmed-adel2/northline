# Design System: Northline / DentoRash

## Visual Direction

The project has two surfaces sharing the same light, clinical token system:

- **Public site — Persuade:** Northline Dental Clinic discovery and trust. It is mobile-first and should make clinic information and contact actions immediately understandable.
- **Internal clinic system — Operate:** dense, restrained, and task-oriented. Scanability, table alignment, status, and fast action paths matter more than expression.

The visual world is not a generic SaaS layer added to a clinic website. The current public page uses circular brand marks, dental imagery, clear process sections, soft clinical bands, and concise factual copy. The staff app uses persistent navigation and compact cards/tables.

Dark mode is not implemented. `color-scheme: light` is binding. Do not introduce dark-theme fragments unless the whole token system is migrated.

## Implemented Tokens

The source of truth is `src/style/globals.css`, with public-shell and internal-shell overrides and component CSS in `src/app/home.css`, `src/app/(public)`, and `src/app/(app)/*.css`.

### Core colors

| Token | Value | Intended use |
|---|---:|---|
| `--clinic-ground` | `#f4f8f8` | Main page/background |
| `--clinic-surface` | `#ffffff` | Cards, panels, top bar |
| `--clinic-ink` | `#183235` | Primary text |
| `--clinic-muted` | `#586f72` | Secondary text |
| `--clinic-hairline` | `#d7e3e3` | Dividers and borders |
| `--clinic-teal` | `#087f80` | Primary actions, active state, focus |
| `--clinic-teal-deep` | `#06696b` | Hover/pressed, stronger text |
| `--clinic-teal-tint` | `#e2f2f1` | Selection and quiet emphasis |
| `--clinic-success` | `#23734d` | Positive/completed |
| `--clinic-warning` | `#8a5b0a` | Due, pending, caution |
| `--clinic-danger` | `#a63c37` | Overdue, denied, failure |

Additional semantic colors and badges are defined directly in the surface CSS. Keep additions in the existing token family and add Tailwind theme mappings when they become reusable.

### Tailwind theme

`src/style/globals.css` maps `--color-ground`, `--color-surface`, `--color-ink`, `--color-ink-secondary`, `--color-hairline`, `--color-clinical-teal`, `--color-clinical-teal-deep`, and `--color-clinical-teal-tint`. Preserve these names for reused surfaces.

### Typography

- Sans/UI: Geist Sans from `next/font/google`, variable `--font-geist-sans`.
- Mono/figures: Geist Mono, variable `--font-geist-mono`.
- Public display and body use the same loaded family unless a future deliberate direction adds a display face.
- Use tabular-nums/Geist Mono for prices, quantities, balances, times, tooth numbers, and identifiers.
- Preserve line-height around 1.55 and clear label/body hierarchy. Public headings are larger and tighter; internal headings stay compact.

Do not implement a new display font or logo without a product decision. The incumbent Northline/DentoRash brand marks are text/SVG, not a registered logo asset.

### Radius

- `--clinic-radius-sm`: `0.5rem` — inputs and compact controls
- `--clinic-radius-md`: `1rem` — cards and panels
- `--clinic-radius-lg`: `1.5rem` — floating/large surfaces

Pills are reserved for badges/status. Primary buttons are not pills.

### Elevation

The app is flat at rest: cards use surface plus one-pixel hairline/border. Floating drawers, dialogs, dropdowns, and toasts may use shadows. Avoid stacking elevation or applying decorative shadows to every card.

The implementation has some hover depth in treatment-plan cards; if extended, keep it subtle and tied to interaction.

## Layout

### Public surface

- Sticky header and centered/edge-contained content.
- Desktop container content up to approximately 1320px.
- Mobile-first sections, generous vertical rhythm, full-width visual bands, short explanatory copy, and visible contact actions.
- Demo banner remains visible and factual.
- The main visual/action hierarchy is: understand the clinic, understand care, choose a contact path.
- The public layout is in `src/app/(public)/layout.tsx` and `src/app/home.css`.

### Internal surface

- Desktop shell: 22rem sidebar, 4.5rem top bar, scrolling content region.
- Sidebar is collapsible.
- Mobile navigation replaces/augments the desktop shell using `mobile.css`.
- Internal content has 1.5rem outer padding on desktop.
- Tables and scan-heavy lists are primary. Cards group a small number of related facts.
- Main modules are grouped in the sidebar: Front Desk, Clinical, Finance, and Operations.

Responsive verification sizes are 375px, 768px, 1024px, and 1440px. At 375px, prioritize schedule, patient, chart, and payment actions without pretending wide editors fit.

## Components and Patterns

Reuse existing classes and components before adding a new primitive.

### Public

- `SiteHeader`, `SiteFooter`, `WhatsAppChatButton`
- `HomeHeroVideo`
- `PageHeroVisual`
- `BeforeAfterSlider`
- `AppointmentRequestDemo`
- `ToothScroll`

The public header has nav, account/public-site actions, and a demo banner. The WhatsApp button should use the configured clinic phone and remain a direct `wa.me` action.

### Internal

- `Sidebar`, `TopBar`, `MobileNav`
- `PatientForm`, `AppointmentForm`, `TaskForm`
- `ConfirmButton`
- `ExportAnalyticsButton`

Client-side feature implementations live beside their route:

- `*-client.tsx` for interactive tables/forms
- `actions.ts` for server mutations
- page components for DB reads and layout

Keep this Server/Client split: fetch and authorization in server components/actions; only place `"use client"` on components that need state, browser APIs, or event handlers.

### Buttons

Use `.button` plus `.button-primary` or `.button-secondary`/existing variants. Exactly one dominant primary action in a task view.

- Primary: teal fill.
- Secondary: surface, hairline, or translucent internal action.
- Text/link: tertiary navigation.
- Destructive: danger outline or restrained danger state, never a default full red call-to-action.

### Inputs and forms

- Persistent visible labels; placeholders are hints, not labels.
- Native form controls are preferred for fixed choices.
- Inline/near-field errors must explain the failure and corrective action.
- Required fields should use native `required` and server validation.
- Use 44px minimum touch targets for mobile actions.
- Preserve keyboard focus. Global `:focus-visible` uses a 3px teal ring.

### Tables and lists

- Sticky headers where supported.
- Numeric columns align right and use tabular figures.
- Status uses semantic badges with a value/state, never decorative color.
- Search lists need an explicit empty state and result count.
- Avoid unexplained blank regions.

### Status and alerts

Use existing `.badge`, `.alert`, and status classes where possible.

- Success/green: paid, completed, confirmed, in stock.
- Warning/amber: due, pending, low stock, outstanding.
- Danger/red: overdue, rejected, denied, failed.
- Teal: active navigation, clinical selection, primary action.

Never use teal or semantic colors as decoration.

## Motion

The project uses CSS keyframes and transitions only. It does not use Framer Motion.

Existing entrance animations:

- fade in up/down
- fade in
- soft pulse
- treatment-plan reveal

Motion must be purposeful and brief. The global reduced-motion media rule sets animation and transition durations to `0.01ms` and disables smooth scrolling.

Do not add autoplay, perpetual decorative animation, or motion that hides critical content.

## Accessibility

- Use semantic landmarks and heading order.
- Give SVG icons `aria-hidden="true"` and meaningful text near icon-only controls.
- Add `aria-label`/`aria-current` for icon navigation.
- Keep visible focus.
- Use sufficient contrast for daylight reception and mobile outdoor use.
- A mobile/keyboard user must reach every action.
- Do not rely on color alone for status.
- Public and internal HTML declare `ltr`; prepare logical CSS properties if Arabic/RTL ships.
- Respect reduced motion.

## Responsive and CSS Rules

- Global tokens and Tailwind mappings are in `src/style/globals.css`.
- Public styles are concentrated in `src/app/home.css` and public route CSS.
- Internal styles are `internal.css`, `mobile.css`, and `polish.css`.
- Route-level or component-specific CSS may be colocated when it belongs to one surface.
- Use logical properties for new layout where practical (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline*`) so RTL changes remain possible.
- Avoid hard-coded width assumptions below 768px.
- CSS custom properties are preferred for recurring colors/radii.

## Demo and Trust Language

Public demo surfaces must retain clear synthetic labeling:

- Demo banner on the home page.
- "Demo only · Nothing is sent or saved" on the sample appointment form.
- Synthetic case/testimonial language rather than real-patient claims.
- No real ratings, outcomes, client names, benchmarks, or unprovided testimonials.

The public UI has a Northline brand, but DentoRash is the platform identity. Do not imply that this is a real clinic without replacing clinic content and removing seed/demo flags.

## Boundaries and Anti-Patterns

Do not:

- add gradients, glassmorphism, gradient meshes, blob backgrounds, or purple SaaS palettes;
- scatter teal over neutral surfaces;
- use large red fills for ordinary destructive actions;
- add card wrappers around every section or every metric;
- use placeholders as labels;
- add autoplay carousels or decorative pulsing;
- put patient clinical/financial data on public routes;
- use another font/logo or claim visual identity locked when it is not;
- change exact token values without updating this file and the measured implementation;
- use `!important` for routine layout fixes.

## Design Review Gate

For UI changes:

1. Read `PRODUCT.md` and this file.
2. Use the `impeccable` skill and inspect the target surface.
3. Reuse existing components/tokens before introducing primitives.
4. Verify desktop and 375px mobile behavior.
5. Verify loading, empty, denied, error, and demo states.
6. Verify keyboard/focus and reduced motion.
7. Run the mechanical detector once after the change is complete.
