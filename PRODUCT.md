# Product

## Register

product

## Users

Two primary audiences share the same screening flow:

- **Patients** checking their own stroke risk during a visit or self-assessment. They need plain-language results, reassurance, and clear next steps — not jargon or alarmism.
- **Clinicians and hospital staff** running preventive screening workflows. They need trustworthy probability scores, risk tiers, and recommended actions that align with the deployed model and metadata thresholds.

The project is also graded academically, so the interface must demonstrate clinical rigor, model transparency, and deployment readiness — not just visual polish.

## Product Purpose

A stroke risk screening tool that accepts routine patient health inputs (age, comorbidities, glucose, BMI, smoking status, etc.), runs them through the trained imblearn pipeline saved in `artifacts/`, and returns a **calibrated stroke probability**, **High / Medium / Low risk tier**, and **recommended clinical action**.

Success means a patient or clinician can complete intake in under two minutes, understand the result without medical training (patients) or without doubting the model (staff), and see recommendations that match the risk thresholds defined in `artifacts/metadata.json`.

## Brand Personality

**Clinical · Calm · Reassuring**

The tool should feel like a trusted hospital screening station — not a startup dashboard. Warmth comes through copy, spacing, and human-readable explanations, not playful illustration or gamification. Visual identity leans on **dark green and teal accents** against a restrained, high-clarity layout. Confidence is earned by showing calibrated probabilities and evidence-backed tiers, not by shouting metrics.

## Anti-references

- **Generic SaaS dashboards** — cream or warm-neutral backgrounds, purple gradients, glass cards, hero metric blocks, and startup-style feature grids.
- **Fear-based medical UI** — alarmist red everywhere, doom copy, or panic-inducing language that erodes trust.
- **AI landing-page tropes** — gradient text, uppercase eyebrow labels on every section, numbered section markers used as decoration, identical icon-card grids.

## Design Principles

1. **Clinical trust over flash** — Every screen should feel appropriate in a healthcare context; credibility matters more than novelty.
2. **Dual-audience clarity** — Patients get plain-language summaries; staff get the numbers, thresholds, and model context they need to act.
3. **Calibrated confidence** — Show probabilities and risk tiers honestly; never imply certainty the model does not have.
4. **Warmth without gamification** — Reassuring tone and readable layout, not badges, streaks, or cartoon mascots.
5. **Pipeline fidelity** — The UI reflects the deployed artifact (`best_model.joblib` + `metadata.json`); intake fields, tiers, and actions stay in sync with the notebook's clinical interpretation.

## Accessibility & Inclusion

Basic accessibility as a baseline: readable contrast, clear labels on every input, logical focus order, and `@media (prefers-reduced-motion: reduce)` support when motion is added. No formal WCAG certification target, but avoid low-contrast muted text and design for users who may be older or less tech-savvy.
