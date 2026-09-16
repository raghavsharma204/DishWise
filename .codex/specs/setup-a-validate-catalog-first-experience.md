# Spec: Setup A — Validate catalog and decide the first experience

Status: Complete. Three candidate sources have been audited, six factual offerings from two restaurant-hosted menus are recorded, product choices are in `docs/decisions.md`, and account-level Google/Supabase OAuth setup succeeded without a card. Public OAuth publication, sign-in, and the launch catalog gate remain later work.

## Overview

Establish whether a small, lawful, traceable catalog of real Carmel dish offerings can support the desktop recommendation demo, and settle the product choices that determine the first user flow. This is the prerequisite for Setup B and the numbered feature specs. Its result is an auditable sample and recorded decisions, not application code or a claim that the full launch catalog is ready.

## Depends on

- No earlier implementation task. Use `PROJECT_SPEC.md` for product requirements, `IMPLEMENTATION_PLAN.md` for Setup A acceptance, and `ARCHITECTURE.md` for proposals awaiting decisions.
- Review `AGENTS.md` before collecting or recording data. Obtain permission to use each public menu source under its terms and robots rules before extraction; do not bypass access controls.

## User flow

No application flow is built in this setup step. Document and walk through the accepted first visit: choose a central Carmel preset, answer at most five taste questions, enter a craving, correct its interpretation, and receive only eligible stored offerings. Sign-in follows the first results when the user wants persistence. Walk through cold start, no dietary controls, conflicting requests, sparse coverage, and denied geolocation. The flow is recorded in `docs/decisions.md` and synchronized with the product and architecture documents.

## Routes / API endpoints

No new routes or API endpoints.

## Database changes

No database changes. Record the intended representation of city coverage, source evidence, nullable prices and variants, freshness, and dietary unknowns for later schema work; do not create migrations in Setup A.

## UI / Components

No UI changes. Record the selected first-experience flow and its empty/error states for the later feature specs.

## Recommendation / personalization changes

No recommendation or personalization code changes. Supported craving terms and negation are ranking preferences, with editable interpretation and explicit unsupported-text handling. V1 has no dietary exclusions. Defer numerical learning weights to the relevant later feature; do not imply that inferred food attributes prove allergy safety.

## Data sources

- Audit three proposed restaurants in the selected Carmel coverage area. Record stable OSM identifiers where available, coordinates, restaurant metadata, menu URL, and retrieval time. OSM/Overpass may identify restaurants and menu links but is not a source of dish names unless it actually contains them.
- For each menu source, record its URL, access and reuse decision with supporting terms/robots references, retrieval and manual-verification times, format, extractability, missing fields, and any required manual-review path. Do not collect from sources whose access or reuse is unclear or disallowed.
- Capture a small sample of real offerings only where permitted. Each name, description, price/variant, and attribute must trace to a source or explicit manual review. Keep unknown values unknown and distinguish sourced, reviewed, and inferred fields. Do not claim live availability or opening status.
- Store compact audit metadata in `data/source_audit.csv` and reviewed sample records in `data/samples/carmel_offerings.json`; avoid unnecessary raw menu archives. Use real data for this audit, while later automated tests use separate deterministic synthetic fixtures.

## Files to change

- `PROJECT_SPEC.md` — replace resolved open questions with accepted decisions; leave unresolved items explicitly open.
- `ARCHITECTURE.md` — align the first-experience and data proposals with accepted decisions without presenting unverified hosting assumptions as facts.
- `IMPLEMENTATION_PLAN.md` — mark Setup A in progress when work begins and complete or blocked only when its result is verified; adjust dependencies if login timing changes the implementation order.

## Files to create

- `docs/decisions.md` — dated decision records with alternatives, rationale, owner, and outstanding validation for coverage, catalog minimum, manual review, freshness/withdrawal, price variants, dietary evidence/unknowns, location/radius, price caps, craving behavior, login timing/provider, pilot, and latency target.
- `data/source_audit.csv` — one row per proposed source with access/reuse evidence, source and menu URLs, retrieval time, format, observed fields, and disposition.
- `data/samples/carmel_offerings.json` — reviewed factual offerings with restaurant/offering IDs, source links, verification dates, nullable price/currency, variants where present, and per-attribute provenance; only sources with cleared access and narrow factual reuse contribute offerings.

The spec itself is `.codex/specs/setup-a-validate-catalog-first-experience.md`. The audit/decision files now exist; the sample must not be treated as a launch catalog.

## New dependencies

No new application dependencies. Browser and local tools may be used for the manual audit. Dedicated Google Cloud and Supabase Free projects were created only for the account-level no-card OAuth check; no application or database schema was deployed.

## Rules for implementation

- Follow `AGENTS.md` and keep V1 a desktop dish-recommendation demo for configured Carmel coverage, using only eligible free/no-card core services.
- Use a bounded, reviewed source list. No general crawler, unrestricted URL fetch endpoint, live request-time scraping, or invented menu records.
- Record the explicit V1 decision to omit dietary filters. Unknown or inferred attributes cannot establish allergy safety; supported hard constraints are never relaxed to fill results.
- Use central Carmel presets and 1/3/5-mile radii, including outside-coverage and denied-geolocation states. Price is a ranking preference only; unknown prices stay unknown.
- Record a craving behavior table for “spicy and filling,” “chicken,” “surprise me,” negation, unsupported text, and conflicts with persistent preferences. State which parts are hard requirements and which affect ranking only.
- Use guest-first timing and target Google OAuth, but verify its free/no-card account eligibility before implementing auth. Record available local processing hardware; select a model later only if needed.
- Set a measurable pilot/usefulness measure and numeric warm-response latency target, with cold starts reported separately. Do not claim provider eligibility, performance, or recommendation quality without evidence.
- If permitted dish data is inadequate, record the precise coverage gap and a scope decision before advancing. Do not silently broaden collection methods.

## Definition of done

- [x] Three proposed Carmel restaurants have source audits covering OSM metadata, menu URLs, permissions, formats, missing fields, and retrieval times; unavailable permissions are recorded rather than replaced with invented facts.
- [x] A reviewed sample of actual permitted offerings traces names and prices/variants to source evidence, while unavailable attributes remain unknown and verification dates are preserved.
- [x] `docs/decisions.md` records coverage, minimum launch catalog, review fallback, freshness/withdrawal policy, price variants, no-dietary-filter scope, location/radius, price behavior, craving correction, login timing/provider, pilot measure, and latency target; outstanding validation remains visible.
- [x] Cold-start, no-dietary-control, conflicting-craving, denied-geolocation, outside-coverage, and sparse-catalog walkthroughs are documented against the recorded decisions and revised `PROJECT_SPEC.md` acceptance criteria 5, 12, and 15.
- [x] `PROJECT_SPEC.md` and `ARCHITECTURE.md` reflect accepted choices, and `IMPLEMENTATION_PLAN.md` tracks Setup A as complete with public OAuth verification retained as a later gate.
- [x] No application code, migrations, paid services, secrets, or unapproved source content are introduced. No automated test suite, lint, type-check, or build applies to this documentation setup step; manual source tracing and walkthroughs are its verification.
