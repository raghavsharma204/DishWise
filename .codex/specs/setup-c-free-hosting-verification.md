# Spec: Setup C — Free-hosting verification

Status: Complete on 2026-09-17 for the public preview and Google publication prerequisite. The hosted API was not deliberately stopped to test a failure, and the first post-deployment request is not a proven cold start. Those limits are recorded in `docs/hosting_check.md`; a real sign-in remains Spec 12. Setup C is an unnumbered roadmap setup task, not one of the 31 product feature IDs.

## Overview

Verify that DishWise's minimal Next.js site and FastAPI health endpoint can run at public provider URLs within free, no-card limits. Establish an honest homepage and privacy policy so the External Google OAuth application's public publication path can be checked. This is a prerequisite for Spec 12 sign-in and for later public product release; it does not release dish recommendations or authenticate a user.

## Depends on

- Setup B — Local application setup: complete. Its local frontend, `/health` endpoint, and locked dependencies are the deployment baseline.
- Setup A — Account-level Google/Supabase setup: complete. The existing no-card account evidence is recorded in `docs/decisions.md`; Setup C verified publication, while a real callback remains unverified.
- No numbered product feature or catalog schema is required. Spec 12 depends on Setup C, but its sign-in flow is outside this task.

## User flow

1. A visitor opens the provider-issued public frontend URL and sees a plain DishWise project homepage that accurately says recommendations and sign-in are not available yet.
2. The visitor can open a linked privacy policy describing what the current minimal site does and the intended data handling without claiming that future collection is active.
3. The page checks the public API `/health` endpoint and shows checking, responding, and unavailable states. A keyboard-accessible retry can recover after a failure. A health response says only that the API process answered.
4. An operator records the exact frontend and backend URLs, tests the public health path from the intended origin, reviews Google publication prerequisites, and records either a verified feasible path or a concrete blocker. A blocked publication path must not be represented as working sign-in.

## Routes / API endpoints

| Method | Path | Purpose | Access |
|---|---|---|---|
| `GET` | `/` | Honest public project homepage and API connection state. | Public. |
| `GET` | `/privacy` | Public privacy policy linked from the homepage and suitable for the Google branding review. | Public. |
| `GET` | `/health` | Existing lightweight FastAPI process check; no database or OAuth probe. | Public, unauthenticated. |

No recommendation, catalog, profile, or sign-in endpoint is introduced. Configure the production API's CORS allowlist for the exact frontend origin, keeping the local development origin usable in local runs. Do not use `*` for a public origin. Any provider preview URL behavior must be documented and kept out of Google production origins unless deliberately approved.

## Database changes

None. No tables, columns, constraints, indexes, migrations, seeds, or RLS changes. The hosted Supabase project's account-level status is checked, but this setup does not connect the health endpoint to it or run destructive tests against it.

## UI / Components

- Update `frontend/app/page.tsx` to replace local-only wording with an honest public homepage while preserving the bounded health check, failure message, and retry behavior. Include a visible privacy link.
- Create `frontend/app/privacy/page.tsx` with a readable privacy policy reflecting the actual minimal site, contact/owner details required by the selected provider's current branding policy, and a date. Resolve any missing owner/contact facts with the project owner before publication; do not invent them.
- Adjust `frontend/app/layout.tsx` metadata if its current title or description overstates readiness. Verify keyboard navigation, visible focus, readable text, and no horizontal overflow at 1280×800 and 1440×900.

## Recommendation / personalization changes

None. No eligibility, ranking, explanation, feedback, saves, identity persistence, or learning behavior. The homepage must not imply any of these is live.

## Data sources

No new restaurant, menu, catalog, Overpass, enrichment, or model source. Hosting feasibility evidence comes from current primary provider documentation, actual account/plan screens, deployment logs and measurements, and public URL smoke checks. Record source URLs, access dates, account-specific findings, and measured results in `docs/hosting_check.md` without copying credentials or private account data into Git.

## Files to change

- `frontend/app/page.tsx` — public homepage, health copy, and privacy navigation.
- `frontend/app/layout.tsx` — truthful page metadata, if needed after inspection.
- `backend/app/main.py` — production CORS configuration for the exact frontend origin, if the existing setting needs adjustment.
- `backend/tests/test_health.py` — focused checks if health/CORS behavior changes.
- `frontend/.env.example` and `.env.example` — document public URL and exact origin variables using placeholders only.
- `README.md` — verified deployment and local commands, public URL behavior, and current limitations.
- `ARCHITECTURE.md`, `PROJECT_SPEC.md`, and `docs/decisions.md` — only if the feasibility result changes a proposed host, public OAuth decision, or open question; record the reason and evidence.
- `IMPLEMENTATION_PLAN.md` — update the tracker when implementation starts, completes, or is blocked, with measured evidence. Drafting this spec alone does not advance it.

## Files to create

- `frontend/app/privacy/page.tsx` — public privacy policy route.
- `docs/hosting_check.md` — dated provider eligibility/limit checks, no-card evidence, deployment size and cold-start measurements, public URL/CORS/browser smoke results, and Google External publication outcome or blocker.
- `docs/deployment.md` — reproducible, secret-safe setup for the chosen frontend/API host, provider-issued URLs, environment variables, origin and redirect configuration, deployment, and rollback/recovery.
- Deployment configuration files only if the chosen provider requires them after a minimal deployment check; name and document the actual files rather than adding speculative configuration.
- This draft: `.codex/specs/setup-c-free-hosting-verification.md`.

## New dependencies

None expected. Use the existing Next.js/FastAPI dependencies and provider tooling or dashboards. If a deployment adapter or CLI becomes necessary, document its purpose, version, lockfile change, and free/no-card suitability before adding it. Do not add NLP, scraping, embedding, or hosted inference packages to the API.

## Rules for implementation

- Explain the final host choice before adding deployment configuration. Check current Vercel Hobby, Vercel Python/function limits, Supabase Free, and Google External publication/domain/branding requirements against primary provider sources and actual account eligibility. Test the lightweight FastAPI deployment first; if it fails, evaluate the documented Render fallback and record a decision before switching hosts. Do not assume older cost or limit figures remain current.
- Use one production environment with provider-issued URLs and no paid plan, card requirement, custom domain, or separate staging service. If no eligible free/no-card public path exists, record the blocker and leave public OAuth unclaimed.
- Keep public exposure to the minimal homepage, privacy page, and health endpoint. Do not deploy incomplete product screens or add public data/request endpoints. Health must not expose secrets or claim database/auth readiness.
- Put secrets only in provider-managed environment variables and local ignored files; browser-visible variables may contain only public origins. Record final origins and Supabase/Google redirect prerequisites without committing client secrets, service-role keys, tokens, or passwords.
- Google publication feasibility belongs here; actual Google/Supabase sign-in, callback handling, session lifecycle, and ownership tests belong to Spec 12. Do not use a Testing-only OAuth result as public publication evidence.
- Separate repeatable local tests from bounded live provider smoke checks. Record real measurements and failure states, including cold start, rather than presenting targets as results.

## Definition of done

- [x] Current official provider terms/limits and actual account no-card eligibility are recorded with dates and links; the chosen frontend and API hosts are documented. The unused fallback decision is reflected in the architecture and decisions record.
- [x] The minimal homepage and privacy page render at provider-issued URLs, are truthful, linked, readable and keyboard usable at 1280×800 and 1440×900, and show no unfinished product flow.
- [x] The browser calls the public API `/health` from the exact intended frontend origin. Success is observed publicly; unavailable/backend failure, timeout, and retry recovery are observed locally with the same frontend code. CORS omits the allow-origin header for an unintended origin. No product data endpoint is exposed. The hosted API was not deliberately stopped.
- [x] Deployment artifact size, a warm health call, and the first post-deployment call are measured and recorded separately. A true cold-start measurement was not established and remains a release verification check. Local frontend typecheck/build and focused backend tests pass.
- [x] Google External publication prerequisites, homepage/privacy link acceptance, final origins, Supabase Site URL, and no-cost eligibility have an evidence-backed outcome. Redirect allowlist and a real sign-in/callback are explicitly left for Spec 12.
- [x] Deployment/recovery steps and environment examples are reproducible; tracked-file review shows no committed secrets, private account exports, or paid resource configuration.
