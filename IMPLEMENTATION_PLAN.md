# MVP Implementation Plan

Sources: [PROJECT_SPEC.md](PROJECT_SPEC.md) and [architecture.md](architecture.md). The architecture file currently uses a lowercase filename.

Status: Planning only. No application code, dependencies, database changes, accounts, or deployments have been created by this plan.

Launch location: Carmel, Indiana. Target: a desktop web portfolio/demo using only free services without a credit card required for core functionality.

## Working approach

- Follow the proposed Next.js + FastAPI + Supabase architecture, subject to the early hosting check. Keep ingestion and embedding generation local.
- Each milestone ends with a demonstrable result, its relevant checks, and a small review. Dependencies are prerequisites, not a requirement to bundle milestones together.
- File paths below are proposed repository-relative paths, not existing files. Add related dependency lockfiles whenever dependencies change.
- Use Python unit/API tests for backend logic, database integration tests for constraints and access policies, and browser tests for important user journeys. Prefer a few meaningful behavior tests over implementation snapshots.
- Use deterministic synthetic fixtures for automated tests. Real menu sources and OAuth are checked separately; normal tests must not depend on live restaurant websites or provider uptime.
- Run destructive database tests only against a disposable local test database. A local test database is not a second hosted production environment. Never reset the public demo database to run tests.
- Keep security checks with the features they protect. The final milestone verifies integration rather than deferring security until launch.
- A milestone is complete when its acceptance criteria and tests pass and its demo can be reviewed. Record limitations and decisions; do not silently expand scope or introduce paid services.

## Milestone 1 — Resolve data and product feasibility

**Depends on:** None.

**Testable result:** A small audited sample of real Carmel menu offerings and a decision record that bounds the MVP.

**Likely files:** `docs/decisions.md`, `data/source_audit.csv`, `data/samples/carmel_offerings.json`, `PROJECT_SPEC.md`, `architecture.md`.

**Acceptance criteria:**

- Audit a proposed sample of three restaurants in the intended coverage area. Record OSM metadata availability, menu URLs, access/reuse restrictions, extractable formats, and missing fields.
- Establish the launch coverage, minimum catalog size, manual-review fallback, refresh policy, and existing hardware available for local enrichment.
- Resolve supported dietary filters and unknown-data handling before implementing filtering. Preserve unknowns; inferred ingredients do not establish allergy safety.
- Record location input/radius, price ranking versus hard caps, login provider/timing, dislike behavior, and initial feedback weights. Mark unaccepted defaults as proposals.
- Agree on a small pilot, a usefulness measure, and a numerical response-time target with cold starts reported separately. These are decisions to make, not promises invented by this plan.
- If permitted menu data is insufficient, document the precise coverage limitation before building a crawler.

**Tests/review:** Manually trace sample names, prices, and attributes to their sources; verify Carmel coordinates and access notes. Walk through cold-start, restricted-diet, and low-coverage scenarios using the proposed decisions. No automated test suite is needed for this documentation milestone.

## Milestone 2 — Minimal application and free-hosting check

**Depends on:** Milestone 1 for hosting/auth decisions; may begin with the unchanged stack while catalog decisions are pending.

**Testable result:** A minimal Next.js page can call a FastAPI health endpoint locally and on the candidate free host.

**Likely files:** `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`, `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `backend/pyproject.toml`, `backend/app/main.py`, `backend/tests/test_health.py`, `.gitignore`, `.env.example`, `README.md`, `docs/hosting_check.md`, optional `backend/vercel.json` if configuration is necessary.

**Acceptance criteria:**

- Separate frontend and backend project roots exist in one repository. Document reproducible install, start, build, and test commands.
- Recheck current provider limits and no-card eligibility. Verify a small FastAPI deployment on Vercel before depending on that choice; use the Render alternative only if necessary and record the reason.
- Use provider URLs and one deployment per component; no staging infrastructure or paid resources.
- The API contains no scraping or model dependencies. Environment examples contain placeholders only.
- The frontend handles both successful and unavailable health responses; CORS permits its configured origin.

**Tests:** Backend health smoke test, frontend typecheck/build, local browser request, and deployed request from the actual frontend origin. Record cold-start behavior and deployment size. Provider/account availability is an explicit gate if it cannot be verified.

## Milestone 3 — Catalog database with reproducible fixtures

**Depends on:** Milestones 1–2.

**Testable result:** A database can load and query a small catalog without any external API.

**Likely files:** `supabase/config.toml`, `supabase/migrations/001_catalog.sql`, `supabase/tests/catalog.sql`, `backend/tests/fixtures/catalog.json`, `backend/app/repositories/catalog.py`, `backend/tests/integration/test_catalog.py`, `README.md`.

**Acceptance criteria:**

- Define cities/coverage, restaurants, and restaurant-specific dish offerings with stable identifiers, nullable prices, source URLs, timestamps, and attribute provenance.
- Enable pgvector and allow missing embeddings; record model/version metadata when present.
- Public catalog access exposes only approved fields and is read-only. Import writes require a privileged operator path.
- Fixtures include missing prices, unknown dietary attributes, duplicate dish names at different restaurants, and out-of-coverage offerings.

**Tests:** Apply migrations to an empty disposable database; test foreign keys, duplicate identity constraints, unknown-field round trips, catalog reads, and rejection of anonymous/authenticated catalog writes.

## Milestone 4 — Bounded restaurant import

**Depends on:** Milestone 3.

**Testable result:** An operator imports Carmel restaurant metadata from a cached Overpass response.

**Likely files:** `pipeline/pyproject.toml`, `pipeline/import_restaurants.py`, `pipeline/sources/overpass.py`, `pipeline/tests/test_restaurant_import.py`, `pipeline/tests/fixtures/overpass.json`, `data/coverage/carmel.json`, `docs/data_operations.md`.

**Acceptance criteria:**

- Query configured geography and cache responses; no restaurant-by-restaurant live lookup in the recommendation path.
- Preserve OSM identity, names, coordinates, available cuisine and menu/website references, and retrieval time.
- Reimporting the same response updates existing records rather than duplicating them.
- Bound request frequency, timeouts, and retries. Failure leaves previously imported data usable.

**Tests:** Fixture-based mapping for nodes/ways as applicable, missing URLs/cuisines, malformed coordinates, repeat imports, timeouts, and rate-limit responses. One operator-run live sample validates the source; automated tests use cached fixtures.

## Milestone 5 — Reviewed dish import from selected menus

**Depends on:** Milestones 1, 3–4.

**Testable result:** Selected permitted menus produce reviewable dish records that can be imported safely.

**Likely files:** `pipeline/extract_menus.py`, `pipeline/import_dishes.py`, `pipeline/sources/menus.py`, `pipeline/tests/test_menu_extraction.py`, `pipeline/tests/test_dish_import.py`, `pipeline/tests/fixtures/menus/`, `data/menu_sources.json`, `docs/data_operations.md`.

**Acceptance criteria:**

- Support only the audited menu format(s) and a simple structured manual-entry fallback; no generic crawler or administration UI.
- Separate extraction from approval/import. Record name, description, price/currency when known, source, last verification, and access decision.
- Restrict fetching to reviewed public sources and validate redirects; do not allow arbitrary user-provided fetch URLs.
- Stable import identities preserve user references on later refreshes. A fetch failure does not delete dishes; stale/withdrawn handling follows Milestone 1 policy.
- Reject malformed records and report failures without discarding the existing catalog.

**Tests:** Known menu fixture extraction, absent prices, price variants under the chosen representation, unsafe URL/redirect rejection, blocked/unsupported sources, repeated import, and failed-refresh preservation. Manually compare imported sample offerings with source menus.

## Milestone 6 — Local enrichment and optional embeddings

**Depends on:** Milestone 5.

**Testable result:** An operator enriches a small dish batch locally and stores inspectable attributes and embeddings.

**Likely files:** `pipeline/enrich_dishes.py`, `pipeline/embeddings.py`, `pipeline/tests/test_enrichment.py`, `pipeline/tests/test_embeddings.py`, `pipeline/pyproject.toml`, `docs/data_operations.md`.

**Acceptance criteria:**

- Use a free local model/tool that fits the available hardware. Keep its dependencies out of the backend package.
- Preserve sourced versus inferred attributes and unknown values; do not convert guesses into verified dietary claims.
- Store vector dimensions and model/version consistently; skip unchanged work or update it predictably on rerun.
- Missing models, failed enrichment, or absent embeddings do not prevent feature-based recommendations.

**Tests:** Attribute/provenance validation, incompatible vector dimension/model rejection, repeated enrichment, and missing-model fallback. Run a small real-model smoke check locally; use controlled vectors for deterministic automated tests. Manually review a sample of inferred attributes.

## Milestone 7 — Craving interpretation and eligibility rules

**Depends on:** Milestones 1 and 3; does not require embeddings or a complete real catalog.

**Testable result:** Tested Python functions turn supported input into structured criteria and filter fixture dishes.

**Likely files:** `backend/app/recommendations/criteria.py`, `backend/app/recommendations/parse_craving.py`, `backend/app/recommendations/eligibility.py`, `backend/tests/test_cravings.py`, `backend/tests/test_eligibility.py`.

**Acceptance criteria:**

- Support the agreed vocabulary, including spicy/filling, chicken, surprise-me, and negation. Return interpretable criteria and unsupported/ambiguous-input status.
- Apply configured geography/radius, dietary policy, and any agreed price cap before ranking.
- Unknown information follows the agreed policy and never becomes fabricated evidence.
- Keep temporary craving criteria separate from persistent onboarding preferences.

**Tests:** Table-driven positive/negative craving examples, ambiguous input, empty/oversized input, known coordinate distances, radius boundary, unsupported city, missing prices under a cap, conflicting constraints, and unknown dietary evidence.

## Milestone 8 — Ranked recommendations API

**Depends on:** Milestones 3 and 7; Milestone 6 enables the similarity term but is not needed for baseline tests.

**Testable result:** An API returns ranked fixture or stored catalog offerings with truthful explanations.

**Likely files:** `backend/app/recommendations/scoring.py`, `backend/app/recommendations/explanations.py`, `backend/app/routes/recommendations.py`, `backend/app/schemas/recommendations.py`, `backend/tests/test_scoring.py`, `backend/tests/test_explanations.py`, `backend/tests/integration/test_recommendations.py`.

**Acceptance criteria:**

- Use configurable weights for craving/taste, spice, price, distance, novelty, and available dish similarity.
- Return 3–5 distinct offerings when possible; return fewer with a coverage/constraint explanation when necessary.
- Explanations derive from actual scoring contributions and stored attributes. Cold-start explanations do not invent prior feedback.
- Accept bounded recently shown offering IDs for guest refreshes; replace at least one result when eligible unseen alternatives exist and explain exhaustion otherwise.
- No live menu, Overpass, or model calls occur during a request. Missing vectors preserve the baseline.

**Tests:** Controlled ranking comparisons, deterministic ties, zero/two/five-plus eligible candidates, duplicate offering prevention, refresh/exhaustion, explanation consistency, missing embeddings, and success with external data/model access disabled. Keep expected ranking examples independent of the implementation formula.

## Milestone 9 — Guest onboarding and recommendation interface

**Depends on:** Milestones 2 and 8.

**Testable result:** A desktop visitor can complete onboarding and obtain another set of recommendations without an account.

**Likely files:** `frontend/app/page.tsx`, `frontend/app/recommendations/page.tsx`, `frontend/components/Onboarding.tsx`, `frontend/components/LocationInput.tsx`, `frontend/components/CravingInput.tsx`, `frontend/components/DishCard.tsx`, `frontend/lib/api.ts`, `frontend/lib/guest-session.ts`, `frontend/tests/e2e/guest-recommendations.spec.ts`.

**Acceptance criteria:**

- At most five onboarding screens collect the agreed preferences.
- Manual Carmel area selection works with geolocation denied/unavailable. Area-based distances are labeled approximate.
- Show interpreted criteria and allow correction before resubmission.
- Cards show name, restaurant, known price, available attributes, explanation, and safe restaurant/location links.
- Loading, empty, unsupported-input, outside-coverage, and backend-failure states are usable. Temporary preferences survive navigation without creating a permanent guest account.

**Tests:** Browser flow from onboarding through corrected craving and refresh; denied geolocation; empty/error responses; unknown fields and external links. Check keyboard navigation and 1280×800 and 1440×900 layouts. Do not test mobile layouts.

## Milestone 10 — Authentication and persistent preferences

**Depends on:** Milestones 1, 3 and 9.

**Testable result:** A user signs in, retains onboarding answers, edits preferences, and restores them in a later session.

**Likely files:** `supabase/migrations/002_profiles.sql`, `supabase/tests/profile_access.sql`, `backend/app/auth.py`, `backend/app/routes/profile.py`, `backend/tests/integration/test_profile_auth.py`, `frontend/lib/supabase.ts`, `frontend/app/auth/callback/route.ts`, `frontend/app/preferences/page.tsx`, `frontend/components/SignIn.tsx`, `frontend/tests/e2e/profile.spec.ts`.

**Acceptance criteria:**

- Implement the single provider/login timing selected in Milestone 1; no email-delivery service or anonymous-account merging.
- Save temporary onboarding after first login without overwriting an existing returning user's profile unintentionally.
- Validate tokens and derive identity server-side. Use user-scoped database access and ownership/RLS policies.
- Signing out clears private UI state. Editing explicit preferences persists and affects future recommendations.

**Tests:** Invalid/expired tokens, forged user IDs, two-user isolation through both API and direct data access, canceled login, callback failure, first-login transfer, returning-user preservation, and logout/login restoration. Automate app behavior with controlled auth fixtures; manually smoke-test the real OAuth callback and provider configuration.

## Milestone 11 — Like/Dislike persistence and learning

**Depends on:** Milestones 8 and 10.

**Testable result:** Feedback changes the next recommendation request and remains effective after signing back in.

**Likely files:** `supabase/migrations/003_feedback.sql`, `supabase/tests/feedback_access.sql`, `backend/app/routes/feedback.py`, `backend/app/recommendations/taste_profile.py`, `backend/tests/test_taste_updates.py`, `backend/tests/integration/test_feedback.py`, `frontend/components/DishFeedback.tsx`, `frontend/tests/e2e/feedback.spec.ts`.

**Acceptance criteria:**

- One current Like/Dislike state per user/offering; switching and clearing feedback are supported.
- Update feedback and derived profile consistently using a transaction or deterministic recomputation. Retries do not multiply learning effects.
- Explicit feedback changes the appropriate score contribution on the next request and persists across sessions.
- Dietary restrictions remain untouched. Handle failed writes without leaving the UI falsely reporting success.

**Tests:** Like → Dislike → clear, duplicate retries, concurrent updates, two-user isolation, failed write recovery, controlled before/after preference scores, and return-session behavior. Verify reversals do not leave residual repeated preference increments.

## Milestone 12 — Saved dishes

**Depends on:** Milestones 10–11.

**Testable result:** A user saves, revisits, and removes a dish independently of Like/Dislike.

**Likely files:** `supabase/migrations/004_saves.sql`, `supabase/tests/saves_access.sql`, `backend/app/routes/saves.py`, `backend/app/recommendations/taste_profile.py`, `backend/tests/integration/test_saves.py`, `frontend/app/saved/page.tsx`, `frontend/components/SaveDishButton.tsx`, `frontend/tests/e2e/saves.spec.ts`.

**Acceptance criteria:**

- Save/unsave are idempotent, user-specific operations independent of explicit feedback.
- Saved dishes survive logout/login and show current available catalog details.
- Saves contribute a weaker bounded preference signal than Likes; removing a save updates that contribution consistently.
- Empty lists, failed writes, and stale/withdrawn offerings have clear states; stale data is not presented as current availability.

**Tests:** Duplicate save/unsave, saved-and-disliked combination, cross-user access rejection, preference contribution reversal, return-session restoration, and missing/stale catalog entries in the saved view.

## Milestone 13 — Bounded interactions and recommendation memory

**Depends on:** Milestones 11–12.

**Testable result:** Returning users get refresh-aware results and small, capped learning effects from relevant interactions.

**Likely files:** `supabase/migrations/005_interactions.sql`, `supabase/tests/interaction_access.sql`, `backend/app/routes/interactions.py`, `backend/app/recommendations/taste_profile.py`, `backend/app/routes/recommendations.py`, `pipeline/prune_events.py`, `frontend/lib/interactions.ts`, `backend/tests/integration/test_interactions.py`, `frontend/tests/e2e/recommendation-memory.spec.ts`.

**Acceptance criteria:**

- Record only the specified impressions, dish/restaurant opens, feedback/save transitions, and requests for another set. Do not infer acceptance or a visit from an impression.
- Persist signed-in recommendation memory without creating a history page. Keep guest memory bounded and temporary.
- Deduplicate repeated events; cap weak click signals below explicit feedback and avoid counting feedback/save events a second time.
- Implement the documented retention limit with an operator-run cleanup command. Avoid retaining precise location histories or raw cravings unnecessarily.

**Tests:** Duplicate events, repeated clicks, fabricated event/user IDs, cross-user reads, refresh after a new session, catalog exhaustion, retention cleanup boundaries, and unchanged dietary restrictions. Verify cleanup is scoped to expired events and preserves feedback/saves.

## Milestone 14 — Public-demo integration and operational handoff

**Depends on:** Milestones 4–6 and 9–13; all earlier checks pass.

**Testable result:** The complete MVP works at public URLs with the approved real Carmel catalog and a short reproducible demo procedure.

**Likely files:** `README.md`, `docs/deployment.md`, `docs/demo-checklist.md`, `docs/validation-results.md`, `.env.example`, existing deployment configuration, `backend/app/middleware/request_limits.py`, `backend/tests/integration/test_request_limits.py`, `backend/tests/integration/test_city_configuration.py`, `frontend/tests/e2e/mvp.spec.ts`.

**Acceptance criteria:**

- Meet the agreed catalog minimum and coverage; record gaps rather than fabricate offerings.
- Recheck free/no-card hosting, OAuth callback URLs, configured origins, environment secrets, and publicly accessible frontend/API. Use one production environment.
- Apply shared request limits that work across function instances; an in-memory-only counter is insufficient. Bound guest requests and payloads as well as signed-in activity using a free host capability or minimal database-backed mechanism.
- Complete onboarding → recommendation → login → feedback/save → logout/login → updated recommendation with the local processing machine offline.
- Demonstrate cached-catalog operation during external-source failure; show useful database/API outage messages.
- Confirm no privileged credentials in client bundles, private records accessible across users, unsafe HTML from menus, or sensitive tokens/precise locations in logs.
- Measure the agreed response-time target and cold starts, run the small pilot if participants are available, and report actual evidence. Pending pilot feedback remains explicitly pending.
- Document menu refresh, event cleanup, local export/recovery, free-tier pausing/quota recovery, and deployment rollback. No advanced monitoring system is required.
- Add a second-city test fixture through data/configuration without changing ranking logic; public coverage remains Carmel.

**Tests:** One end-to-end deployed smoke journey using a dedicated test account; targeted security and quota-limit checks; desktop keyboard/layout review; offline-source test; second-city configuration integration test. Run migration/recovery rehearsals against a disposable local database, never production. Reuse previously passing feature suites and rerun them for the release; add fixes only for discovered failures.

## Dependency and review checkpoints

- Milestones 1–3 establish decisions, viable hosting, and storage.
- Milestones 4–6 prepare real data; Milestones 7–9 can progress using fixtures once their prerequisites exist.
- Milestone 9 is the first complete guest recommendation demonstration.
- Milestones 10–12 establish the persistent personalization loop.
- Milestone 13 completes bounded interaction learning; Milestone 14 verifies the integrated public demo.

This ordering permits independent reviews without requiring the entire catalog pipeline before evaluating recommendation behavior. It does not authorize implementation or automatic delegation.

## Specification acceptance-criteria coverage

Numbers refer to the numbered acceptance criteria in PROJECT_SPEC.md.

| Spec criteria | Primary milestones |
|---|---|
| 1 — short onboarding | 9 |
| 2 — 3–5 eligible offerings and small-result handling | 7–9 |
| 3 — sourced cards and unknown values | 3, 5–6, 9 |
| 4 — craving interpretation/refinement | 7, 9 |
| 5 — dietary exclusions and uncertain evidence | 1, 6–7 |
| 6 — explicit and weaker bounded learning | 11–13 |
| 7 — persistence and user isolation | 10–13 |
| 8 — mutually exclusive/idempotent feedback | 11–13 |
| 9 — refresh and exhaustion | 8–9, 13 |
| 10 — truthful explanations | 8 |
| 11 — saved dishes and restaurant information | 9, 12 |
| 12 — location fallback and distance | 7, 9 |
| 13 — cached catalog and missing-vector fallback | 6, 8, 14 |
| 14 — desktop usability | 9, 14 |
| 15 — free public flow and basic security | 2–3, 10–14 |
| 16 — additional city through data/configuration | 3–4, 14 |

## Explicitly deferred

Mobile/native support, ordering/delivery/reservations, reviews/social features, a taste graph, trained collaborative filtering, online generative models, a universal menu crawler, live stock/open-now guarantees, a visual map, user-facing history, and enterprise deployment infrastructure remain outside V1. Do not add them to satisfy incidental implementation preferences.
