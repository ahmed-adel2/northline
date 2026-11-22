---
name: DentoRash
description: Dental clinic platform — a public clinic site and a staff-only clinic system sharing one design system.
---

<!-- SEED: pre-implementation. The palette direction is confirmed; the visual world, display typeface, and logo are not yet locked. No tokens exist in code. Re-run /impeccable document once there is a build to capture the real system. -->

# Design System: DentoRash

## Overview

**Creative North Star: to be named during world discovery.**

This file records the design decisions that are settled, the reasoning behind them, and the decisions that are deliberately still open. It is a charter, not a finished token specification. Writing it honestly now matters more than making it look complete, because every later screen will be built against whatever this file claims.

DentoRash is one design system carrying two surfaces with opposite jobs. The **public clinic site** is a Persuade surface: a visitor arrives on a phone, usually deciding whether to book, and the page has to earn attention, make the clinic legible, and put a real action within reach. The **internal clinic system** is an Operate surface: a receptionist or dentist is mid-task with a patient in the chair, and the interface has to disappear into the work. These are not two brands. They are two densities and two levels of expression built from one set of tokens, so a clinic's public site and its working system feel like the same institution.

The committed palette direction is **clinical teal**. That is a constraint, not a world. It fixes the hue family and the intent — clean, medical, calm, trustworthy — but it does not decide the typeface, the composition language, the material character, the imagery stance, or the signature moves. Those are chosen before any UI code is written, through the design process recorded at the end of this file. Naming a look in advance and then building toward it produces the category default; deriving it from the clinic's own world is the point.

The physical scene that settles light versus dark: a treatment room under an operatory light at ten in the morning, a reception desk lit from a window, and an owner reviewing figures at night on a laptop. All three are bright-surface readings, and a dark default would serve none of them. The product is light-first, with a dark mode deferred and tokens structured so it can be added later without a rebuild.

**Key Characteristics:**
- Two surfaces, one token set, two densities.
- Calm and clinical at rest; the interface recedes so the patient and the numbers lead.
- Teal does real work — primary action, focus, clinical state — rather than decorating a neutral page.
- Precision over ornament. The craft is in alignment, spacing, and legible data, not in effects.
- Honest states everywhere: empty, loading, offline, pending, out of date, denied.

## Colors

The palette character is **clinical teal on a cool near-white ground**. It is a restrained system on the Operate surface and a committed one on the Persuade surface: the same colours, used at different volumes.

Exact values are `[to be resolved during implementation]`. The roles below are settled; the hex values are not, and inventing them here would create a false source of truth that later work would defend instead of measuring.

### Primary
- **Clinical Teal, base**: the primary action, active navigation, focus indication, and the one accent that carries a clinic's identity. On the public site it is allowed to own real area — a hero field, a band, a footer — not just a button.
- **Clinical Teal, deep**: hover and pressed states, and text-on-tint where contrast demands it.
- **Clinical Teal, tint**: selection backgrounds, subtle emphasis, quiet section grounds. Never used for large areas of body text.

### Neutral
- **Clinical Ground**: the page ground on both surfaces. A near-white with a faint cool cast — not pure white, which reads as a blank sheet, and not grey, which reads as disabled.
- **Surface**: cards, tables, drawers, and modal bodies. Pure white, separated from the ground by a hairline and, only where needed, by elevation.
- **Hairline**: the one-pixel divider used between rows, around cards, and under section heads. A cool, low-contrast line — never a heavy grey rule.
- **Ink**: primary text and figures. A near-black slate, not pure black.
- **Ink Secondary**: labels, metadata, secondary descriptions.
- **Ink Muted**: timestamps, helper text, placeholders, disabled labels.

### Semantic
- **Success**: paid, completed, confirmed, in stock.
- **Warning**: due soon, low stock, pending approval, out-of-date published price.
- **Danger**: overdue, voided, failed claim, conflict, denied access.

Semantic colours are used only where they carry meaning. They are never used decoratively, and they never replace the teal as the brand's action colour.

### Named Rules
**The Semantic Colour Rule.** A colour that means something is never used to mean nothing. Red is a state, not an accent; amber is a warning, not a highlight.

**The Committed Surface Rule.** On the public site teal may carry a whole band or field. On the app it stays a signal. Neither surface scatters teal as small decorations across a neutral page — that is the look of a template with a brand colour applied afterwards.

## Typography

**Display / Heading Font:** `[to be resolved during world discovery]`
**Body / UI Font:** **Geist Sans** (incumbent, via `next/font`)
**Figures / Codes:** **Geist Mono** (incumbent)

**Character:** the working system wants a calm, highly legible UI face with a real numeric voice, because the product is full of figures — prices, balances, tooth numbers, appointment times, stock counts. Geist Sans and Geist Mono are the current implementation and are a sound default for the Operate surface. The public site is a Persuade surface and deserves a display voice with a point of view; whether that is an extension of Geist or a second face is decided with the world, not assumed here.

Categories start on the page but their typefaces are not evidence: reaching for a generic serif because the subject is healthcare would be the default wearing the subject's clothes.

### Hierarchy
Exact sizes are `[to be resolved during implementation]`. The intended relationships:

- **Display**: public-site hero and major section heads only. Tight tracking, generous scale, short lines.
- **Headline**: page titles in the app and section heads on the site.
- **Title**: card and panel headings, table group heads.
- **Body**: reading copy and form text. Comfortable line length on the site; compact but never cramped in the app.
- **Label**: field labels, table headers, badge text, metadata. Slightly tracked, sentence case, never all-caps shouting.
- **Figure**: tabular numbers for money, quantities, times, and tooth numbers, so columns align and digits do not jitter.

### Named Rules
**The Tabular Figures Rule.** Any number that can change, be compared, or be totalled uses tabular figures. A column of prices that shifts width as it updates is a defect.

**The One Voice Per Job Rule.** The app has one UI face. The public site may have a display voice, but it never borrows the app's dense label styles, and the app never borrows the site's display scale.

## Layout

Two spatial grammars from one spacing scale.

**Public site (Persuade).** A centred container with generous gutters, a wide reading measure for prose, and full-bleed bands where the palette is allowed to own the page. Vertical rhythm is spacious: sections breathe, and there is more space above a heading than below it. The first viewport must make the offer intelligible and expose the primary action — booking or contacting the clinic — without scrolling. Nothing important hides behind a decorative hero.

**Internal system (Operate).** A persistent left sidebar for module navigation, a compact top bar for branch, search, and user, and a dense content region. The content region uses a twelve-column grid that collapses predictably. Tables are first-class: they are the primary reading surface for patients, invoices, stock, and claims, so column alignment, sticky headers, and row states matter more than decoration.

**Breakpoints** are checked at 375, 768, 1024, and 1440. The app is usable on a phone for the real cases — checking today's schedule, looking at a chart, taking a payment — without pretending a full invoice editor belongs on a 375px screen. The public site is designed mobile-first, because that is where patients arrive.

**Spacing** follows a 4px base with a single shared scale used by both surfaces. Density changes through which steps are used, not through a second scale. The app compresses to the smaller steps; the site expands to the larger ones.

### Named Rules
**The One Scale Rule.** Both surfaces use the same spacing scale, radii, and colours. A second scale is how two halves of one product start to look like two products.

**The Reading Order Rule.** On the public site, the primary action is reachable in the first viewport and legible without hover. On the app, the data a person came for is above the fold, and utility chrome never outranks it.

## Elevation & Depth

The system is **flat by default, with two elevation steps and one hairline**. Depth is communicated by surface separation and border, not by stacked shadows. Shadows appear only where a surface genuinely floats above another: drawers, modals, toasts, and dropdowns. Cards at rest are flat with a hairline border.

This is a deliberate restraint. Heavy shadow vocabularies date quickly and make dense clinical screens feel noisy. A clinic's interface should read as precise, not as a stack of floating panels.

### Named Rules
**The Flat At Rest Rule.** Nothing has a shadow until it floats or is interacted with. A card at rest has a border, not a shadow.

**The One Step Up Rule.** A floating surface sits exactly one step above the surface it covers. Two competing elevations in one view means the hierarchy is wrong, not the shadow.

## Shapes

Form language is **gently rounded and rectilinear**. Corners are soft enough to feel modern and calm, tight enough to keep tables and dense data aligned. There are three radii: a small radius for inputs and badges, a medium radius for cards and panels, and a large radius for modals, drawers, and other floating surfaces. Pills are reserved for status badges and filters, never for primary buttons.

Borders are one pixel and cool-toned. There is no double border, no inset border, and no border used as decoration. Clipping is used for images and charts, never for text.

## Components

No components exist yet. This section records the intended language so the first build has a target; it will be replaced with real specifications once the primitives are implemented and documented.

The component set is deliberately small, because a large set is how a design system rots. Planned primitives: Button, IconButton, Input, Select, Combobox, Textarea, Checkbox, Radio, Switch, Card, Badge, Table, Tabs, Drawer, Modal, Toast, Tooltip, Popover, EmptyState, Skeleton, Avatar, Stat, Pagination, CommandPalette.

Intended language, by component:

- **Buttons** — one primary action per view. Primary is filled teal; secondary is bordered on surface; ghost is text-only for tertiary actions. Destructive actions are outlined in danger, never filled red by default, so a mis-click is not catastrophic.
- **Inputs** — bordered on surface, with a visible focus ring, a persistent label (never placeholder-as-label), and an inline error that names the problem and what to do. Disabled fields are visibly disabled, not merely lower contrast.
- **Selects** — native selects own short, fixed-choice lists; retain persistent labels and native constraint validation. Use a custom searchable control only when the option set requires it.
- **Tables** — the workhorse. Sticky header, tabular figures, aligned numeric columns, row-level status, and an empty state that explains what to do next rather than showing a blank grid.
- **Badges** — semantic only: appointment status, invoice status, stock level, claim state. Pills, small, never used for decoration.
- **Cards** — flat with a hairline; used to group related facts, not to wrap every element on a page.
- **Drawers and modals** — the only elevated surfaces. Drawers for contextual detail and side tasks; modals for confirmations that must interrupt.
- **Empty states** — every list has one, with a sentence of explanation and the action that resolves it.
- **Charts** — restrained, axis-labelled, with the period named. A chart without a labelled period is a decoration.

### Named Rules
**The One Primary Rule.** Exactly one filled primary action per view. If two things compete to be primary, the hierarchy is undecided.

**The Explain The Empty Rule.** No screen ever shows an unexplained blank region. An empty list says why it is empty and what to do about it.

**The Semantic Badge Rule.** A badge always means a state. A badge used for emphasis is a bug.

## Do's and Don'ts

### Do:
- **Do** design both surfaces from one token set, changing only density and expression.
- **Do** put the primary action in the first viewport on the public site, in its working form — a booking or contact affordance, not a link pointing elsewhere.
- **Do** use tabular figures for every price, balance, quantity, time, and tooth number.
- **Do** show honest states: loading skeletons, empty explanations, offline indicators, pending sync counts, out-of-date published prices, and permission-denied messages that say what is missing.
- **Do** respect `prefers-reduced-motion` in every animation.
- **Do** keep contrast sufficient for daylight at a reception desk and for a patient reading on a phone outdoors.
- **Do** author product imagery as SVG built from the real design tokens, and photography as compressed `.webp` through `next/image`, lazy below the fold and prioritised only in the hero.
- **Do** label every black-boxed or invented demonstration as synthetic. Demo content is design material; it is never a claim.
- **Do** keep the clinic's own branding dominant on its public site. The template's identity must not leak into a clinic's brand.
- **Do** always rely on impeccable skills in the design, planning, and proof reading of any file you generate or edit.

### Don't:
- **Don't** use gradient meshes, floating blob backgrounds, glassmorphism, or purple SaaS gradients.
- **Don't** use autoplaying carousels or any motion that runs without a job.
- **Don't** substitute generic icon tiles or chrome for authored assets.
- **Don't** scatter the accent colour as small decorations over a neutral template — that is the category default with a sticker on it.
- **Don't** use placeholder-as-label in forms, or placeholders as the only instruction.
- **Don't** fill red for destructive actions by default, or use semantic colours decoratively.
- **Don't** invent testimonials, patient names, ratings, or outcomes. Consent flags gate every case study and testimonial before publishing.
- **Don't** show a patient's clinical, financial, or scheduling record on any public route, in any form, at any size.
- **Don't** write `DESIGN.md` tokens from imagination. Values land here after they exist in code and have been measured.
- **Don't** use framer motion in anywhere in the project

## Design Process and Gates

This section is workflow, not tokens. It is recorded here because the decisions above are only trustworthy if the process that produces them is followed.

Two surfaces, two modes: the public site is **Persuade**, the app is **Operate**. Each gets its own surface brief.

The sequence, in order, before and during the build:

1. **World discovery.** Seven concrete visual systems derived from the clinic's own world — its graphic traditions, places, ritual objects, and the publications it reads — never from practice software. Ordered by resonance.
2. **Direction roll.** The design tool deals an assigned direction plus challengers. A decision page presents them. The product owner locks one per surface. Clinical teal participates as a fixed palette constraint inside whichever world wins.
3. **Direction contract.** Six blocks written into each surface brief before code: thesis, own-world, story, first viewport, form with seed reference, and the finish condition.
4. **Craft floor.** The quality floor and absolute bans are read immediately before the first UI edit, and again before any later edit that changes appearance.
5. **Committed build.** The assigned direction is built in full, not a safer rendition. Tokens land in `globals.css` under `@theme`.
6. **Inspection.** A first-viewport capture pass at desktop and mobile, with entrance motion settled first so nothing hidden by animation reads as missing. One batch of material fixes, then one confirmation capture.
7. **Detector.** A mechanical design scan runs once over the finished UI. Mechanical findings are fixed; the rest go to review.
8. **Finish review.** A fresh reviewer receives the request, the contract, the screenshots, and the craft floor, and returns a disposition: ship, fix, rebuild, or recapture. The disposition is acted on honestly.
9. **Documentation.** `DESIGN.md` and its sidecar are rewritten from the built world. This file is the seed; it is not the finished record.

### Open Design Decisions

These are deliberately unresolved and must not be silently invented:

- **The visual world.** Not yet derived. Clinical teal constrains the palette; it does not decide the world.
- **The display typeface** for the public site. Geist is the incumbent for UI and figures.
- **The logo and brand mark.** None exists.
- **Exact colour values, type scale, and spacing steps.** Land in code, then here.
- **Whether the public site uses photography of the clinic's own people and space, or illustrated product imagery, or both.** Planned as both: generated `.webp` photography for human moments, token-built SVG for product UI.
- **Dark mode.** Deferred. Tokens must be structured so it is additive.

A `DESIGN.md` that looks finished before a single screen exists is a liability. This one is marked as a seed on purpose.
