<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Stroke Risk Screening
description: Clinical calm screening tool — dark green and teal accents on pure white, NHS clarity meets Apple Health precision.
---

# Design System: Stroke Risk Screening

## 1. Overview

**Creative North Star: "The Quiet Triage Desk"**

This system feels like a hospital screening station at mid-morning: bright, unhurried, and authoritative. Patients sit down, enter vitals, and receive a result they can understand without a medical degree. Staff see the same flow with numbers they can trust. The interface borrows **NHS digital services** clarity (plain language, strong hierarchy, no decorative noise) and **Apple Health** precision (generous spacing, confident typography, stateful feedback without drama).

The visual posture is **Restrained**: pure white surfaces, ink-forward typography, and dark green / teal accents reserved for primary actions, active selection, and risk-tier semantics. Warmth lives in copy rhythm and readable type — not cream backgrounds, not purple gradients, not hero metric blocks.

This system explicitly rejects **generic SaaS dashboards** (cream or warm-neutral backgrounds, purple gradients, glass cards, startup feature grids) and **AI landing-page tropes** (gradient text, uppercase eyebrow labels on every section, numbered section markers as decoration, identical icon-card grids). It also rejects **fear-based medical UI** — alarmist red everywhere, doom copy, panic-inducing language.

**Key Characteristics:**

- Pure white canvas; depth via spacing and 1px borders, not tinted cream surfaces
- Dark green primary + teal accent — clinical, not startup-purple
- Single humanist sans throughout (Source Sans 3 target); no display/body pairing
- Responsive motion: 150–220ms state transitions; subtle result reveal, no page choreography
- Dual-audience results: plain-language summary for patients, probability + thresholds for staff
- Risk tiers use restrained semantic color — informative, never alarmist

## 2. Colors

A restrained clinical palette: white surfaces, green-teal brand accents, and muted semantic tiers for High / Medium / Low risk.

### Primary

- **Deep Clinical Green** (`oklch(0.38 0.10 165)`): Primary buttons, active nav, focused links, key CTAs ("Run screening", "View details"). Used on ≤10% of any screen.

### Secondary

- **Screening Teal** (`oklch(0.48 0.11 195)`): Secondary actions, progress indicators, selected tab underlines, icon accents. Distinct from primary in both hue and lightness.

### Tertiary

- **Calibrated Amber** (`oklch(0.62 0.14 75)`): Medium-risk tier, caution states, non-destructive warnings. Warm but not alarmist.

### Neutral

- **Pure Canvas** (`oklch(1.000 0.000 0)`): Page background. Literal white — not warm-tinted cream.
- **Panel Surface** (`oklch(0.98 0.004 165)`): Form sections, result panels, sidebar backgrounds. Barely tinted; reads as white.
- **Ink** (`oklch(0.22 0.02 165)`): Body text, headings, labels. ≥7:1 contrast on Pure Canvas.
- **Muted Ink** (`oklch(0.48 0.02 165)`): Helper text, field descriptions, metadata. ≥4.5:1 on Pure Canvas — never washed-out gray.
- **Border** (`oklch(0.88 0.008 165)`): Dividers, input strokes, table rules. 1px only.

### Risk tier semantics (product-specific)

- **High risk** — `oklch(0.42 0.12 25)`: Deep rose-amber fill with white text. Serious, not screaming red.
- **Medium risk** — `oklch(0.62 0.14 75)`: Calibrated Amber with dark ink text.
- **Low risk** — `oklch(0.45 0.10 165)`: Deep Clinical Green tint with white text.

### Named Rules

**The Pure Canvas Rule.** Background is always literal white (`oklch(1.000 0.000 0)`). Warmth comes from green-teal accents and humanist type — never from a cream or sand body background.

**The Accent Rarity Rule.** Deep Clinical Green and Screening Teal combined occupy ≤10% of visible pixels on any screen. Their scarcity signals importance.

**The No-Alarm Rule.** Risk tiers use restrained semantic hues. Prohibited: full-saturation red fills, flashing states, or doom-gradient backgrounds on results.

## 3. Typography

**Display Font:** Source Sans 3 (with `system-ui`, `-apple-system`, `Segoe UI`, sans-serif fallback) — single family for all roles

**Body Font:** Source Sans 3 (same stack)

**Label/Mono Font:** Source Sans 3 at smaller sizes; tabular numerals for probabilities (`font-variant-numeric: tabular-nums`)

**Character:** Humanist sans with clinical warmth — open apertures and comfortable x-height for older users and quick kiosk reading. One family only; hierarchy via weight and fixed rem scale, not font pairing.

### Hierarchy

- **Display** (600, 1.75rem / 28px, line-height 1.2): Page title only — "Stroke Risk Screening". Fixed rem, not fluid clamp.
- **Headline** (600, 1.375rem / 22px, line-height 1.25): Section headers — "Patient intake", "Your result".
- **Title** (600, 1.125rem / 18px, line-height 1.3): Card titles, risk tier labels, form group labels.
- **Body** (400, 1rem / 16px, line-height 1.55): Instructions, result explanations, recommended actions. Max 65–75ch for prose blocks.
- **Label** (500, 0.875rem / 14px, line-height 1.4, letter-spacing 0.01em): Field labels, table headers, button text. Sentence case — never all-caps tracked eyebrows.

### Named Rules

**The One Voice Rule.** Source Sans 3 carries every text role. No serif display fonts. No second sans for "personality."

**The Fixed Scale Rule.** Headings use fixed rem steps (1.75 → 1.375 → 1.125 → 1 → 0.875). No fluid clamp on UI labels — users view at consistent DPI in clinical settings.

## 4. Elevation

Flat-by-default with tonal layering. Depth is conveyed through **1px borders**, **surface tints** (Panel Surface on Pure Canvas), and **spacing rhythm** — not drop shadows on every card.

Hover and focus states may add a single soft shadow (`0 2px 8px oklch(0.22 0.02 165 / 0.08)`) on interactive panels. Shadows are a **response to state**, not default decoration.

### Shadow Vocabulary

- **Focus lift** (`box-shadow: 0 0 0 3px oklch(0.48 0.11 195 / 0.25)`): Focus rings on inputs and buttons — teal glow, not browser default blue.
- **Panel hover** (`box-shadow: 0 2px 8px oklch(0.22 0.02 165 / 0.08)`): Optional on clickable result cards only.

### Named Rules

**The Flat-By-Default Rule.** Surfaces rest flat. Shadows appear only on hover, focus, or elevated modals — never as ambient decoration on static cards.

**The No-Glass Rule.** Backdrop blur and glassmorphism are prohibited unless a specific modal overlay requires scrim dimming (solid `oklch(0.22 0.02 165 / 0.4)`, not frosted glass).

## 5. Components

*[To be documented on first implementation pass — re-run `/impeccable document` after code exists.]*

Target vocabulary (from references + PRODUCT.md):

- **Primary button:** Deep Clinical Green fill, white text, 8px radius, 12px 24px padding, 180ms ease-out hover darken
- **Secondary button:** White fill, 1px Border stroke, Ink text, teal focus ring
- **Text inputs:** 1px Border stroke, 8px radius, 12px 16px padding, teal focus ring; error state uses rose-amber border + helper text (not red flash)
- **Risk tier badge:** Filled pill using tier semantic colors; white or ink text per contrast rules; tabular-nums for probability
- **Result panel:** Panel Surface background, 1px Border, 16px padding; probability as Title weight with `%` in tabular nums
- **Navigation:** Top bar, Ink logo/wordmark, Screening Teal active indicator — no sidebar cream tint

## 6. Do's and Don'ts

### Do:

- **Do** use Pure Canvas (`oklch(1.000 0.000 0)`) as the page background — let green-teal accents carry brand identity.
- **Do** pair plain-language patient copy with staff-facing probability and threshold details on the same result screen.
- **Do** use Source Sans 3 (or system fallback) at 16px body minimum for readability across age groups.
- **Do** animate state changes in 150–220ms with ease-out curves; reveal results with a subtle fade + 8px upward translate.
- **Do** honor `@media (prefers-reduced-motion: reduce)` — crossfade or instant transition, no translate.
- **Do** use tabular numerals for stroke probability, thresholds, and tier cutoffs.
- **Do** keep primary green + teal accents under 10% of any screen's visible area.

### Don't:

- **Don't** use generic SaaS dashboard aesthetics — cream or warm-neutral backgrounds, purple gradients, glass cards, hero metric blocks, or startup-style feature grids. *(PRODUCT.md anti-reference)*
- **Don't** use AI landing-page tropes — gradient text, uppercase eyebrow labels on every section, numbered section markers as decoration, or identical icon-card grids. *(PRODUCT.md anti-reference)*
- **Don't** use fear-based medical UI — alarmist red everywhere, doom copy, or panic-inducing language on results. *(PRODUCT.md anti-reference)*
- **Don't** use side-stripe borders (`border-left` > 1px colored accent) on cards, alerts, or list items.
- **Don't** use gradient text (`background-clip: text`) for headings or metrics.
- **Don't** ship a hero-metric template (big number, small label, gradient accent) on the results screen.
- **Don't** use muted gray body text below 4.5:1 contrast — bump toward Ink end of the ramp.
- **Don't** use bounce, elastic, or choreographed page-load sequences — users are in a clinical task, not watching a launch animation.
