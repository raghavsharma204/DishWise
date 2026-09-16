# Single-feature Implementation Plan

[PROJECT_SPEC.md](PROJECT_SPEC.md) defines product requirements, [ARCHITECTURE.md](ARCHITECTURE.md) proposes the architecture, and [docs/decisions.md](docs/decisions.md) records accepted choices. This roadmap defines independently reviewable implementation units and tracks progress. Setup B local application infrastructure is implemented; numbered product features have not started.

## Current and next work

**Current:** Setup B — Local application setup is complete. A local Next.js page checks FastAPI health, and a disposable local Supabase PostgreSQL connection was verified. No product feature or deployment is complete.

**Next ready work:** Setup C — Free-hosting verification, or Spec 01 — Display stored dish cards. Their explicit dependencies determine execution order. Public OAuth publication and real sign-in remain unverified.

This revision replaces the previous 21-spec roadmap with the 31 single-feature specs approved in conversation. These are the authoritative feature IDs; product acceptance-criterion numbers are separate. Setup B now has a local application implementation; the numbered product features and public deployment remain unstarted. Resolve historical references through the migration table below. Do not reset completed setup work.

| ID | Feature / task | Status |
|---|---|---|
| Setup A | Validate catalog and decide the first experience | Complete: account-level no-card OAuth verified; public sign-in remains a later gate |
| Setup B | Local application setup | Complete: local health flow and disposable database verified |
| Setup C | Free-hosting verification | Not started |
| Spec 01 | Display stored dish cards | Not started |
| Spec 02 | Open restaurant information | Not started |
| Spec 03 | Select a Carmel location | Not started |
| Spec 04 | Select a search radius | Not started |
| Spec 05 | Complete taste onboarding | Not started |
| Spec 06 | Exclude unavailable catalog offerings | Not started |
| Spec 07 | Interpret a craving | Not started |
| Spec 08 | Correct craving interpretation | Not started |
| Spec 09 | Rank the first recommendation set | Not started |
| Spec 10 | Explain a recommendation | Not started |
| Spec 11 | Request another recommendation set | Not started |
| Spec 12 | Sign in and sign out | Not started |
| Spec 13 | Save and restore onboarding preferences | Not started |
| Spec 14 | Edit saved preferences | Not started |
| Spec 15 | Record dish feedback | Not started |
| Spec 16 | Personalize from explicit feedback | Not started |
| Spec 17 | Save and unsave a dish | Not started |
| Spec 18 | View saved dishes | Not started |
| Spec 19 | Personalize from saves | Not started |
| Spec 20 | Remember previously shown recommendations | Not started |
| Spec 21 | Record recommendation interactions | Not started |
| Spec 22 | Personalize from dish and restaurant opens | Not started |
| Spec 23 | Expire interaction history | Not started |
| Spec 24 | Import restaurant metadata | Not started |
| Spec 25 | Extract a menu into reviewable records | Not started |
| Spec 26 | Import reviewed dish offerings | Not started |
| Spec 27 | Refresh existing dish information | Not started |
| Spec 28 | Mark a dish as withdrawn | Not started |
| Spec 29 | Enrich dish attributes locally | Not started |
| Spec 30 | Generate and store dish embeddings | Not started |
| Spec 31 | Rank using stored dish similarity | Not started |
| Release | Release verification checklist | Not started |

## Working agreement

- One spec delivers one observable behavior. Include only the necessary data contract/fixture, backend, tests and smallest UI or operator command. File paths below are proposed, not claims that files exist.
- State the ID and name when starting; update status on start, completion or blockage. Record evidence and the next action for incomplete work. Completion means criteria and tests pass and the result can be demonstrated.
- Dependencies, not row order, determine readiness. Work on one spec at a time; do not pull unrelated future features into a slice. Imports can proceed without authentication or learning.
- Preserve accepted decisions: curated Midtown/Arts & Design District coverage, approximate presets, default 3-mile radius with 1/3/5 choices, guest-first access, Google/Supabase auth, no dietary filters, price and supported cravings as soft preferences, 30-day freshness, and variants under one offering identity.
- Resolve feature-specific open choices before dependent behavior. Distinguish speculative defaults from decisions and explain important architectural choices before implementing them.
- Define behavior → add deterministic fixtures → implement/test data and backend behavior → connect presentation → manually verify → update docs/tracker → commit the completed slice.
- Normal tests use synthetic/cached fixtures, controlled auth and controlled vectors. Label synthetic dishes. Live menus, Overpass, OAuth and local models get separate bounded smoke checks.
- Use a disposable local database for destructive tests; never reset or use the public demo database for tests. Verify ownership through both API and direct database access.
- Include security, safe links/text, input bounds, keyboard access, desktop layouts at 1280×800 and 1440×900, and loading/empty/error states with each affected feature. These are acceptance requirements, not separate product features.
- Before public data/request endpoints are exposed, provide shared request limits across instances; in-memory-only counters are insufficient. Intermediate incomplete product screens stay local. Hosting checks expose only the minimal intended site/health surface.
- Recording and learning are separate: Spec 15 records feedback and Spec 16 uses it; Spec 17 records saves and Spec 19 uses them. Earlier UI must not claim an unimplemented learning effect. Like/Dislike/switch/clear, save/unsave and sign-in/sign-out each remain a single state lifecycle.
- Add relevant migrations, lockfiles, environment examples and reproducible commands only. No secrets, paid dependencies or mobile scope. Each feature is testable without later consumers; release requires full integration.

## Setup A — Validate catalog and decide the first experience

**Status:** Complete; preserve recorded evidence. **Depends on:** None.

**Result:** Three audited restaurant candidates, six reviewed factual offerings from two menus and recorded first-experience decisions. Fork's third-party menu remains on hold. This sample does not meet the five-restaurant/25-offering release gate.

**Likely files:** `docs/decisions.md`, `data/source_audit.csv`, `data/samples/carmel_offerings.json`, `PROJECT_SPEC.md`, `ARCHITECTURE.md`, existing `.codex/specs/setup-a-validate-catalog-first-experience.md`.

**Acceptance criteria:** Source evidence, permitted factual reuse, unknowns, variants, coverage, freshness, guest-first flow, supported craving behavior, pilot and latency targets are recorded. Account-level Google/Supabase setup without a card is verified. Public publication and a real callback remain explicit gates in Setup C and Spec 12, not completed claims.

**Tests/review:** Manual source tracing and cold-start, no-dietary-control, conflicting-craving, sparse-catalog and location-fallback walkthroughs. No application test suite applies. Do not repeat completed auditing solely because feature IDs changed.

## Setup B — Local application setup

**Status:** Complete. The local health flow and disposable database workflow are specified and verified in `.codex/specs/setup-b-local-application-setup.md` and `README.md`.

**Depends on:** Setup A.

**Result:** Next.js calls a FastAPI health endpoint locally, and a disposable local Supabase test database can be used.

**Likely files:** `frontend/package.json`, `frontend/app/page.tsx`, `frontend/app/layout.tsx`, `backend/pyproject.toml`, `backend/app/main.py`, `backend/tests/test_health.py`, `supabase/config.toml`, `.gitignore`, `.env.example`, `README.md`, relevant lockfiles.

**Acceptance criteria:** Separate frontend/backend roots, reproducible install/start/build/test commands, placeholder environment examples, successful and unavailable health states. Establish the local database test workflow without future feature tables. Keep model/scraping dependencies outside the API.

**Tests:** Health smoke test, frontend build/typecheck, browser-to-API call and failure state, and local database connection check.

**Verification (2026-09-16):** `uv run --locked pytest` passed 2 tests; `npm run typecheck` and `npm run build` passed. Browser checks at 1280×800 and 1440×900 showed no horizontal overflow. Healthy, stopped-backend, 404, malformed-JSON, timeout, and retry recovery states were observed. `npm ci` succeeded in root and frontend, and `uv sync --locked` succeeded in backend. `npm run db:start` started only local PostgreSQL; `npm run db:status` showed `linked_project:null` and a loopback DB URL; a local `SELECT 1` returned `1`; `npm run db:stop` stopped it. `/health` still returned `{"status":"ok"}` with the database stopped. No feature tables or public deployment were created.

## Setup C — Free-hosting verification

**Depends on:** Setup B.

**Result:** The minimal site and health endpoint work at provider URLs; public OAuth prerequisites have a documented feasibility outcome.

**Likely files:** `docs/hosting_check.md`, `docs/deployment.md`, `frontend/app/page.tsx`, `frontend/app/privacy/page.tsx`, deployment configuration if necessary, `.env.example`, `README.md`.

**Acceptance criteria:** Verify actual no-card eligibility/limits for the proposed Vercel frontend/FastAPI hosting and Supabase; document any Render fallback decision. Establish an honest public homepage/privacy policy, final origins/redirects, and Google External publication eligibility without presenting unfinished product flows as released. Setup A account evidence remains valid; real sign-in is Spec 12. Use one hosted production environment, no paid resources or secrets in files.

**Tests:** Deployed health call from the intended origin, failed-backend state, deployment-size/cold-start measurements, homepage/privacy link review and recorded provider/publication checks. An unavailable no-cost publication path blocks public auth; do not invent eligibility.

## Spec 01 — Display stored dish cards

**Depends on:** Setup B.

**Result:** A local fixture page loads stored offerings through FastAPI and displays dish cards.

**Likely files:** `supabase/migrations/*_catalog.sql`, `backend/app/repositories/catalog.py`, `backend/app/routes/dishes.py`, `frontend/components/DishCard.tsx`, `frontend/app/dev/dishes/page.tsx`, `backend/tests/integration/test_catalog.py`, `frontend/tests/e2e/dish-cards.spec.ts`.

**Acceptance criteria:** Store configurable cities/coverage, stable restaurant/offering IDs, source and verification metadata, provenance, nullable prices and variants, and status. Display known fields and explicit unknowns. Label synthetic fixtures; allow only approved public read fields and reject public writes. This is a development view, not recommendations.

**Tests:** Fixture round trips, foreign keys, duplicate names across restaurants, variants, missing fields, unsafe text/source links, rejected writes, loading/empty/error rendering, and second-city fixtures.

## Spec 02 — Open restaurant information

**Depends on:** Spec 01.

**Result:** A dish opens restaurant details and a safe external location link.

**Likely files:** `backend/app/routes/restaurants.py`, `frontend/components/RestaurantDetails.tsx`, `frontend/components/DishCard.tsx`, `backend/tests/test_restaurants.py`, `frontend/tests/e2e/restaurant-info.spec.ts`.

**Acceptance criteria:** Show stored address/details and available website; derive the location link from stored coordinates. Missing information remains unknown; no live-hours or availability claims. Reuse this action later in saved dishes.

**Tests:** Dish-to-restaurant association, missing details, invalid IDs, unsafe URLs, correct destination coordinates, and keyboard open/close.

## Spec 03 — Select a Carmel location

**Depends on:** Spec 01.

**Result:** Choosing Midtown or Arts & Design District changes the origin and approximate distances.

**Likely files:** `data/coverage/carmel.json`, `backend/app/location.py`, `backend/app/routes/locations.py`, `frontend/components/LocationSelector.tsx`, `frontend/lib/guest-session.ts`, `backend/tests/test_location.py`, `frontend/tests/e2e/location.spec.ts`.

**Acceptance criteria:** Verify accepted reference-point coordinates against reviewed evidence. Use configured coverage/preset IDs with the default 3-mile radius. No geolocation permission or address API is needed; reject unsupported locations and avoid precise location history.

**Tests:** Known coordinate distances, changed origin, unsupported IDs, approximate labels, operation without geolocation, and additional-city configuration.

## Spec 04 — Select a search radius

**Depends on:** Spec 03.

**Result:** Selecting 1, 3, or 5 miles changes eligible offerings.

**Likely files:** `backend/app/location.py`, `frontend/components/RadiusSelector.tsx`, `backend/tests/test_radius.py`, `frontend/tests/e2e/radius.spec.ts`.

**Acceptance criteria:** Default to 3 miles; validate allowed values server-side. Intersect radius with configured central Carmel coverage. A larger radius never implies wider catalog coverage; show an honest empty state.

**Tests:** Boundary distances, invalid/negative radii, all three choices, changing location then radius, and out-of-coverage exclusion even within five miles.

## Spec 05 — Complete taste onboarding

**Depends on:** Setup B; no location or auth dependency.

**Result:** At most five screens produce a validated temporary profile and summary.

**Likely files:** `backend/app/schemas/preferences.py`, `frontend/components/Onboarding.tsx`, `frontend/lib/guest-session.ts`, `backend/tests/test_preferences.py`, `frontend/tests/e2e/onboarding.spec.ts`.

**Acceptance criteria:** Collect cuisine, spice, price sensitivity and adventurousness; no dietary inputs. Answers survive guest navigation without creating an anonymous account. Do not claim ranking before Spec 09.

**Tests:** Valid/invalid answers, field bounds, back/next navigation, screen-count limit, temporary state restoration and keyboard completion.

## Spec 06 — Exclude unavailable catalog offerings

**Depends on:** Spec 01.

**Result:** Stale or verified withdrawn fixture offerings are withheld from recommendation candidates.

**Likely files:** `backend/app/recommendations/eligibility.py`, `backend/app/repositories/catalog.py`, `frontend/app/dev/dishes/page.tsx`, `backend/tests/test_eligibility.py`.

**Acceptance criteria:** Apply the accepted 30-day re-verification policy with a defined time boundary. Distinguish stale from withdrawn; preserve records/IDs and show no-eligible-results honestly. No dietary filters or price cap. Use fixture statuses here; operator updates come later.

**Tests:** Fixed-clock freshness boundary, missing verification times, fresh/stale/withdrawn records, preserved stored records, and unknown price remaining eligible under the same status/location conditions.

## Spec 07 — Interpret a craving

**Depends on:** Setup B.

**Result:** A local input view displays structured criteria returned by the backend.

**Likely files:** `backend/app/recommendations/parse_craving.py`, `backend/app/routes/cravings.py`, `frontend/components/CravingInput.tsx`, `backend/tests/test_cravings.py`, `frontend/tests/e2e/craving.spec.ts`.

**Acceptance criteria:** Follow the accepted soft-preference table for spicy/filling, chicken, surprise-me and negation. Surface unsupported/ambiguous input; bound request size. Do not rank or mutate profiles here.

**Tests:** Table-driven phrases, negation, empty/oversized requests, unsupported/ambiguous text, and displayed interpretation/error.

## Spec 08 — Correct craving interpretation

**Depends on:** Spec 07.

**Result:** Users edit interpreted criteria and submit validated corrections.

**Likely files:** `backend/app/schemas/cravings.py`, `frontend/components/CravingCriteriaEditor.tsx`, `backend/tests/test_corrected_criteria.py`, `frontend/tests/e2e/craving-correction.spec.ts`.

**Acceptance criteria:** Use the parser's bounded criteria vocabulary and validate edits server-side. Corrections change only the current request; they cannot alter profile answers or catalog eligibility. Allow refinement after unsupported input.

**Tests:** Add/remove/change criteria, malformed or contradictory submissions, unsupported keys, parse-failure recovery, and unchanged original profile fixture.

## Spec 09 — Rank the first recommendation set

**Depends on:** Specs 04–06 and 08.

**Result:** A request returns up to five ranked eligible dish cards.

**Likely files:** `backend/app/recommendations/scoring.py`, `backend/app/routes/recommendations.py`, `frontend/app/recommendations/page.tsx`, `backend/tests/test_scoring.py`, `backend/tests/integration/test_recommendations.py`, `frontend/tests/e2e/first-recommendations.spec.ts`.

**Acceptance criteria:** Apply eligibility before configurable soft scoring for craving, cuisine, spice, price, distance and novelty. Return 3–5 when available and fewer honestly otherwise; variants are not duplicate dishes. Unknown prices are neutral. Cravings do not rewrite profiles. No live source/model calls. Explanations and learned signals arrive separately; do not claim them. Keep this partial flow local unless public safeguards are implemented.

**Tests:** Independent ranking examples, deterministic ties, zero/two/three/four/five-plus results, distinct offerings, authoritative constraints, unknown prices, missing vectors, offline sources and guest submission.

## Spec 10 — Explain a recommendation

**Depends on:** Spec 09.

**Result:** Each recommendation shows a reason based on actual ranking factors.

**Likely files:** `backend/app/recommendations/explanations.py`, `frontend/components/DishCard.tsx`, `backend/tests/test_explanations.py`, `frontend/tests/e2e/explanations.spec.ts`.

**Acceptance criteria:** Use stored facts and active scoring contributions. Cold-start reasons cannot invent history; unknown data cannot justify a positive match. No percentages or allergy-safety claims. Later learning specs extend reasons only when their signals exist.

**Tests:** Score/reason agreement, missing facts, cold start, negative criteria and safe readable rendering.

## Spec 11 — Request another recommendation set

**Depends on:** Spec 09.

**Result:** Another-set action shows an alternative when possible or explains exhaustion.

**Likely files:** `backend/app/recommendations/refresh.py`, `frontend/components/AnotherSetButton.tsx`, `frontend/lib/guest-session.ts`, `backend/tests/test_refresh.py`, `frontend/tests/e2e/refresh.spec.ts`.

**Acceptance criteria:** Bound temporary session memory; replace at least one result when eligible unseen alternatives exist. Define context reset on location/radius/preferences/craving changes. Distinguish transport retry from intentional refresh; failed calls cannot advance memory. Cross-session storage is Spec 20.

**Tests:** Unseen alternatives, small/exhausted catalogs, context changes, retries, malformed/oversized IDs and failure recovery.

## Spec 12 — Sign in and sign out

**Depends on:** Setup C; no recommendation-learning dependency.

**Result:** Google/Supabase sign-in establishes a verified session and sign-out clears private state.

**Likely files:** `backend/app/auth.py`, `frontend/lib/supabase.ts`, `frontend/app/auth/callback/route.ts`, `frontend/components/SignIn.tsx`, `backend/tests/test_auth.py`, `frontend/tests/e2e/auth.spec.ts`.

**Acceptance criteria:** Verify real callback/publication feasibility using final URLs. Derive identity from server-verified tokens; protect secrets and redirects/origins. Preserve guest-first access; no email service or anonymous-account merging. Public auth remains blocked if publication/sign-in is unverified.

**Tests:** Invalid/expired tokens, forged identity, canceled login, unsafe redirects, callback failure, logout cleanup, controlled browser tests and separate real-provider smoke check.

## Spec 13 — Save and restore onboarding preferences

**Depends on:** Specs 05 and 12; integrate with Spec 09 when present.

**Result:** First-login answers persist and return after a later login.

**Likely files:** `supabase/migrations/*_profiles.sql`, `backend/app/routes/profile.py`, `frontend/lib/profile.ts`, `backend/tests/integration/test_profiles.py`, `frontend/tests/e2e/profile-persistence.spec.ts`.

**Acceptance criteria:** Use owned records and RLS. First-login transfer must not overwrite an existing profile. Clear private UI on logout. Supply canonical signed-in answers to recommendation requests when implemented; current craving stays separate.

**Tests:** First transfer, existing-profile preservation, failed save, return-session summary, API/direct-database isolation and recommendation integration when Spec 09 exists.

## Spec 14 — Edit saved preferences

**Depends on:** Specs 09 and 13.

**Result:** An edited preference persists and affects the next recommendation request.

**Likely files:** `backend/app/routes/profile.py`, `frontend/app/preferences/page.tsx`, `backend/tests/integration/test_profile_updates.py`, `frontend/tests/e2e/edit-preferences.spec.ts`.

**Acceptance criteria:** Validate owned updates; keep current craving and learned weights separate. Reset relevant recommendation context when available. Failed writes cannot show false success.

**Tests:** Invalid/unauthorized changes, restored-session values, changed score contribution, failed-write recovery and preserved unrelated fields.

## Spec 15 — Record dish feedback

**Depends on:** Specs 01 and 12.

**Result:** Set, switch or clear Like/Dislike and restore it in another session.

**Likely files:** `supabase/migrations/*_feedback.sql`, `backend/app/routes/feedback.py`, `frontend/components/DishFeedback.tsx`, `backend/tests/integration/test_feedback.py`, `frontend/tests/e2e/feedback.spec.ts`.

**Acceptance criteria:** Maintain one owned state per user/offering with reversible, repeat-safe writes. Reject invalid references; show write failures honestly. Store feedback only; do not promise personalization before Spec 16.

**Tests:** Like → Dislike → clear, duplicate/concurrent requests, invalid IDs, API/database user isolation, failure recovery and return-session state.

## Spec 16 — Personalize from explicit feedback

**Depends on:** Specs 09–10, 13 and 15.

**Result:** Existing Likes/Dislikes change subsequent ranking and explanations.

**Likely files:** `backend/app/recommendations/taste_profile.py`, `backend/app/recommendations/scoring.py`, `backend/app/recommendations/explanations.py`, `backend/tests/test_feedback_learning.py`, `frontend/tests/e2e/feedback-learning.spec.ts`.

**Acceptance criteria:** Decide bounded weights and exact-dislike exclusion versus penalty. Use deterministic recomputation or consistent transactional updates; reversals remove obsolete contributions. Preserve base catalog eligibility and explicit profile answers. Reasons reflect active feedback.

**Tests:** Controlled before/after scores, repeated feedback without drift, clear/switch reversal, combined signals, unchanged hard constraints and cross-session reasons.

## Spec 17 — Save and unsave a dish

**Depends on:** Specs 01 and 12; no feedback-learning dependency.

**Result:** Saved state persists independently of Like/Dislike.

**Likely files:** `supabase/migrations/*_saves.sql`, `backend/app/routes/saves.py`, `frontend/components/SaveDishButton.tsx`, `backend/tests/integration/test_saves.py`, `frontend/tests/e2e/save-toggle.spec.ts`.

**Acceptance criteria:** Owned idempotent save/unsave with restored card state. A dish can be saved and disliked; failed writes must not fake success. Collection and learning are separate features.

**Tests:** Duplicate/concurrent writes, return-session state, invalid/unauthorized references, write failures and independence from feedback fixtures.

## Spec 18 — View saved dishes

**Depends on:** Specs 02 and 17.

**Result:** A collection shows the user's saved offerings with restaurant and unsave actions.

**Likely files:** `backend/app/routes/saves.py`, `frontend/app/saved/page.tsx`, `backend/tests/integration/test_saved_list.py`, `frontend/tests/e2e/saved-list.spec.ts`.

**Acceptance criteria:** Provide empty/loading/error states. Label stale/withdrawn records honestly while preserving references. Reuse existing controls so removal synchronizes list/card state.

**Tests:** User isolation, empty list, stale/withdrawn/missing-reference fixtures, unsave synchronization, failed load, links and return-session access.

## Spec 19 — Personalize from saves

**Depends on:** Specs 16 and 17.

**Result:** Saves add a weaker preference signal; unsaving removes it.

**Likely files:** `backend/app/recommendations/taste_profile.py`, `backend/app/recommendations/explanations.py`, `backend/tests/test_save_learning.py`, `frontend/tests/e2e/save-learning.spec.ts`.

**Acceptance criteria:** Define weights/caps below explicit feedback and saved-and-disliked handling without deleting either state. Recompute consistently, preserve eligibility and explain only active evidence.

**Tests:** Relative bounded contributions, duplicate saves, unsave reversal, saved/disliked combinations, stable eligibility and restored-session ranking.

## Spec 20 — Remember previously shown recommendations

**Depends on:** Specs 11 and 12.

**Result:** Returning-session refresh considers recently shown recommendations.

**Likely files:** `supabase/migrations/*_recommendation_memory.sql`, `backend/app/recommendations/memory.py`, `frontend/lib/recommendation-session.ts`, `backend/tests/integration/test_memory.py`, `frontend/tests/e2e/returning-refresh.spec.ts`.

**Acceptance criteria:** Store owned bounded memory with agreed context reset/expiration. Ignore expired memory immediately; physical cleanup is Spec 23. Guest memory stays temporary; no history page, raw cravings or precise location history.

**Tests:** Return-session alternatives, reset/exhaustion, repeat-safe writes, invalid references, two-user isolation and fixed-clock expiration.

## Spec 21 — Record recommendation interactions

**Depends on:** Specs 02, 11–12, 15 and 17.

**Result:** Agreed UI actions create validated deduplicated records.

**Likely files:** `supabase/migrations/*_interactions.sql`, `backend/app/routes/interactions.py`, `frontend/lib/interactions.ts`, `backend/tests/integration/test_events.py`, `frontend/tests/e2e/events.spec.ts`.

**Acceptance criteria:** Record only impressions, dish/restaurant opens, feedback/save transitions and refreshes. Validate user/offering/set references and define event IDs, bounds and retention metadata. Impressions do not prove acceptance/visits. Recording alone does not change ranking; current feedback/save states remain their learning source.

**Tests:** Expected events per action, retry deduplication, fabricated/cross-user references, payload/rate bounds, sensitive-field exclusion and no duplicate feedback/save contributions.

## Spec 22 — Personalize from dish and restaurant opens

**Depends on:** Specs 16, 19 and 21.

**Result:** Open events have a small capped effect on subsequent ranking.

**Likely files:** `backend/app/recommendations/taste_profile.py`, `backend/tests/test_open_learning.py`, `frontend/tests/e2e/open-learning.spec.ts`.

**Acceptance criteria:** Decide how restaurant opens map to dish attributes. Keep weights weaker than explicit feedback, ignore expired events, and cap repeated clicks. Impressions do not count as opens or visits. Preserve eligibility.

**Tests:** Repeated/duplicate opens, cap/relative weights, expiry, no impression-only learning, no double-counted feedback/saves and open → next recommendation.

## Spec 23 — Expire interaction history

**Depends on:** Specs 20–22.

**Result:** An operator removes expired memory/events while preserving durable state.

**Likely files:** `pipeline/prune_history.py`, `pipeline/tests/test_prune_history.py`, `docs/data_operations.md`.

**Acceptance criteria:** Document retention and a scoped preview/dry-run command. Reconcile materialized signals if needed; cleanup cannot revive expired effects or remove profiles/feedback/saves/catalog. Repeated runs are safe.

**Tests:** Fixed-clock boundaries, preview/deletion counts, repeated runs, signal consistency and durable-state preservation in a disposable database.

## Spec 24 — Import restaurant metadata

**Depends on:** Spec 01 and completed Setup A; no auth/learning dependencies.

**Result:** An operator imports a bounded cached Overpass sample.

**Likely files:** `pipeline/pyproject.toml`, `pipeline/import_restaurants.py`, `pipeline/sources/overpass.py`, `pipeline/tests/test_restaurant_import.py`, `data/coverage/carmel.json`, `docs/data_operations.md`.

**Acceptance criteria:** Use configured geography, stable OSM identity, metadata/provenance, cached responses and bounded retries/timeouts/frequency. Privileged writes are operator-only; repeat imports update without duplicates and failure preserves data. No request-time Overpass calls.

**Tests:** Cached node/way mapping, missing metadata, malformed coordinates, reruns, failures/rate limits, second-city configuration and one separate bounded live check.

## Spec 25 — Extract a menu into reviewable records

**Depends on:** Setup A and Setup B; no database-import dependency.

**Result:** One reviewed format produces structured candidates for manual review.

**Likely files:** `pipeline/extract_menu.py`, `pipeline/sources/menus.py`, `data/menu_sources.json`, `pipeline/tests/fixtures/menus/`, `pipeline/tests/test_extraction.py`, `docs/data_operations.md`.

**Acceptance criteria:** Fetch only reviewed public sources with permitted access/reuse and validated redirects. Preserve source evidence, nullable values and variants. Candidates are not published automatically; no general crawler. Manual structured entry remains valid for unsupported formats.

**Tests:** Approved fixtures, absent/variant prices, malformed/unsupported formats, unsafe URLs/redirects, blocked retrieval and zero catalog writes. Compare a small permitted sample with its source.

## Spec 26 — Import reviewed dish offerings

**Depends on:** Spec 01 and Setup A; restaurants from Spec 24 or reviewed manual entry; Spec 25 output optional.

**Result:** A reviewed batch creates traceable stored offerings.

**Likely files:** `pipeline/import_offerings.py`, `pipeline/schemas/offerings.py`, `pipeline/tests/test_offering_import.py`, `data/reviewed/`, `docs/data_operations.md`.

**Acceptance criteria:** Validate review status, restaurant identity, variants, provenance and verification times. Reject malformed/unreviewed records without discarding data. Unchanged reruns are safe; changes to existing offerings require Spec 27's explicit refresh path. Real cards preserve source facts.

**Tests:** Valid/invalid batches, missing restaurants, reruns, duplicate variants, changed-record rejection/report, stable IDs and source-to-card comparison. Integrate recommendations when Spec 09 exists.

## Spec 27 — Refresh existing dish information

**Depends on:** Spec 26.

**Result:** Reviewed updates change existing details without changing offering identity.

**Likely files:** `pipeline/refresh_offerings.py`, `pipeline/tests/test_refresh_offerings.py`, `docs/data_operations.md`.

**Acceptance criteria:** Apply reviewed price/description/variant updates and verification times while preserving feedback/save references and provenance. Fetch failures never erase/withdraw dishes. Invalidate enrichment/vector metadata if its input changes; regeneration is separate.

**Tests:** Changed/unchanged updates, renewed freshness, failed-fetch preservation, stable reference fixtures, vector invalidation and updated cards without duplication.

## Spec 28 — Mark a dish as withdrawn

**Depends on:** Specs 06 and 26.

**Result:** An evidenced withdrawal removes the dish from eligible results without deleting its record.

**Likely files:** `pipeline/mark_withdrawn.py`, `pipeline/tests/test_withdrawal.py`, `docs/data_operations.md`.

**Acceptance criteria:** Require verified disappearance or direct notice with source/time/reason. Distinguish withdrawal from stale/unverified status. No withdrawal from fetch failure or hard deletion. Reuse eligibility/status display behavior.

**Tests:** Verified withdrawal, missing-evidence rejection, failed-fetch non-withdrawal, repeat command, preserved reference fixtures and saved-view integration when Spec 18 exists.

## Spec 29 — Enrich dish attributes locally

**Depends on:** Spec 26.

**Result:** A local batch adds inspectable inferred attributes to reviewed offerings.

**Likely files:** `pipeline/enrich_attributes.py`, `pipeline/pyproject.toml`, `pipeline/tests/test_enrichment.py`, `docs/data_operations.md`.

**Acceptance criteria:** Select a free tool for the recorded M2/16 GB hardware. Preserve sourced values, inference provenance/version and unknowns. Reruns are predictable; failures preserve baseline ranking. No allergy-safety claims, vectors or request-time models in this spec.

**Tests:** Provenance, sourced-value preservation, unchanged/revised inputs, missing-tool failure and stable eligibility; separate local-tool smoke check and manual attribute review.

## Spec 30 — Generate and store dish embeddings

**Depends on:** Spec 26; Spec 29 enrichment optional.

**Result:** A local batch stores vectors with model/version/dimension metadata.

**Likely files:** `pipeline/generate_embeddings.py`, `supabase/migrations/*_embeddings.sql`, `pipeline/tests/test_embeddings.py`, `docs/data_operations.md`.

**Acceptance criteria:** Choose a free model fitting local hardware; enable pgvector if needed. Preserve input/model consistency, skip unchanged work and reject incompatible vectors. Missing-vector fallback survives failure. No ranking changes or online inference yet.

**Tests:** Controlled-vector storage, dimension/model mismatch, reruns, revised input, missing-model failure and separate small real-model smoke check; no normal-test model downloads.

## Spec 31 — Rank using stored dish similarity

**Depends on:** Specs 16 and 30.

**Result:** Similarity to liked dishes contributes to ranking and explanations.

**Likely files:** `backend/app/recommendations/similarity.py`, `backend/app/recommendations/scoring.py`, `backend/app/recommendations/explanations.py`, `backend/tests/test_similarity.py`, `frontend/tests/e2e/similarity.spec.ts`.

**Acceptance criteria:** Define a bounded contribution from compatible liked-dish vectors or their aggregate. Preserve eligibility and feature-only fallback with absent likes or missing/incompatible vectors. No online inference. If optional similarity is deferred, record the decision rather than marking unimplemented work complete.

**Tests:** Controlled similarity ordering, contribution/reason agreement, absent likes, partial/mismatched/stale vectors and success with model/source access disabled.

## Release verification checklist — not a product feature

**Depends on:** All required feature behavior integrated; optional-vector disposition recorded. **Status:** Not started.

**Evidence files:** `docs/deployment.md`, `docs/demo-checklist.md`, `docs/validation-results.md`, `README.md`, relevant integration/browser tests.

- [ ] Meet five reviewed restaurants and 25 distinct reviewed offerings within approved coverage and freshness; the setup sample is insufficient.
- [ ] Verify free/no-card hosting, public OAuth publication and real sign-in, provider URLs, origins and secrets. No unapproved paid plan or additional hosted environment.
- [ ] Verify shared request limits across instances before public data endpoints are enabled; input/work bounds, token checks and ownership are already part of implementing slices.
- [ ] Run guest onboarding → location/radius → craving/correction → ranked explained results → another set, plus returning-user profile/feedback/saves/learning journeys.
- [ ] Verify API/direct-database isolation, safe links/text, no privileged client secrets or sensitive logs, useful failure states, keyboard access and both desktop sizes.
- [ ] Verify stored-catalog recommendations with Overpass/menu/model access unavailable and the operator machine offline; exercise missing-vector fallback and second-city fixtures without ranking changes.
- [ ] Measure warm API p95 against the accepted three-second target; record environment, request count and catalog size. Report cold starts separately.
- [ ] Recruit the agreed five pilot participants; report whether at least three identify a recommended dish they would consider trying. Set the still-unagreed date before recruitment; pending evidence remains pending.
- [ ] Document refresh, withdrawal, pruning, local export/recovery, provider pausing/quota recovery and rollback. Rehearse destructive operations only in a disposable local database.
- [ ] Run relevant feature suites and a dedicated-account deployed smoke journey. Record unmet required criteria as remaining work; files existing does not prove release readiness.

## Previous-ID migration guide

Existing decision records and the Setup A spec may contain historical references. This table disambiguates them; it does not reopen completed decisions. Reconcile old drafts with the new scope before use. IDs remain stable after this approved replacement even if execution order changes.

| Previous task | New task(s) |
|---|---|
| Setup A | Setup A, completion preserved |
| Setup B | Setup B local setup; Setup C hosting/public OAuth prerequisites |
| 01 — Stored cards | 01–02 |
| 02 — Location/radius | 03–04 |
| 03 — Onboarding | 05 |
| 04 — Catalog eligibility | 06, geographic filtering in 03–04 |
| 05 — Craving/correction | 07–08 |
| 06 — First recommendations | 09–10 |
| 07 — Another set | 11 |
| 08 — Authentication | 12 |
| 09 — Profile persistence | 13 |
| 10 — Edit preferences | 14 |
| 11 — Feedback and learning | 15–16 |
| 12 — Saves and learning | 17, 19 |
| 13 — Saved collection | 18 |
| 14 — Recommendation memory | 20, 23 |
| 15 — Interaction learning | 21–23 |
| 16 — Restaurant import | 24 |
| 17 — Menu extraction/import | 25–26 |
| 18 — Refresh/withdrawal | 27–28 |
| 19 — Attribute enrichment | 29 |
| 20 — Vectors/similarity | 30–31 |
| 21 — Release | Release verification checklist |

In particular, historical coordinate checks referring to Spec 02 now belong to Spec 03; enrichment references to Spec 19 now mean Spec 29; public-auth references to Setup B/Spec 08 now mean Setup C/Spec 12.

## Product acceptance coverage

Numbers refer to PROJECT_SPEC.md, not feature IDs. Release review verifies integration; partial feature completion does not imply full V1 acceptance.

| Product criterion | Feature specs / setup |
|---|---|
| 1 — Short onboarding and recommendations | 03–05, 07–09, 13 |
| 2 — Eligible result count | 04, 06, 09 |
| 3 — Sourced cards and unknown values | 01, 25–29 |
| 4 — Interpretation/refinement | 07–08 |
| 5 — No dietary controls/safety claims; hard location constraints | 01, 03–06, 09, 29 |
| 6 — Bounded learning | 16, 19, 22; optional 31 |
| 7 — Persistence and isolation | 12–23 |
| 8 — Reversible/repeat-safe actions | 11, 15, 17, 20–23 |
| 9 — Alternatives and exhaustion | 11, 20 |
| 10 — Truthful explanations | 10, 16, 19, 22, 31 |
| 11 — Saves and restaurant information | 02, 17–18, 27–28 |
| 12 — Coverage and distance | 03–04 |
| 13 — Cached catalog and vector fallback | 06, 09, 24–31 |
| 14 — Desktop usability | Each UI slice and release review |
| 15 — Public free flow and security | Setup A–C, each affected slice, release review |
| 16 — Configurable coverage | 01, 03–04, 24, release review |

## Scope boundary

Carmel desktop demo only. Dietary filters, mobile/native support, ordering/delivery/reservations, reviews/social features, a taste graph, collaborative model training, online generative models, a universal crawler, live stock/open-now guarantees, visual maps, a history page and enterprise infrastructure remain deferred. Early fixture screens are development scaffolding, not public browsing requirements.
