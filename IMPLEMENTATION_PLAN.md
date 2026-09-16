# Feature-by-feature Implementation Plan

[PROJECT_SPEC.md](PROJECT_SPEC.md) defines product requirements; [ARCHITECTURE.md](ARCHITECTURE.md) proposes the architecture. This file defines the implementation tasks and tracks progress. No application implementation has started.

## Current and next work

**Current:** Not started. **Next:** Setup A. **First coding feature after setup:** Spec 01 — Display stored dish cards.

This revision replaces the earlier nine broad specs with 21 smaller implementation specs. IDs below are the new authoritative IDs; they are distinct from product acceptance-criterion numbers. Update this tracker when starting, completing, or blocking a task, with a short blocker/next-action note when needed. Work on one row at a time.

| ID | Feature / task | Status |
|---|---|---|
| Setup A | Validate catalog and decide the first experience | Not started |
| Setup B | Runnable application and hosting check | Not started |
| Spec 01 | Display stored dish cards | Not started |
| Spec 02 | Choose a location and search radius | Not started |
| Spec 03 | Complete taste-preference onboarding | Not started |
| Spec 04 | Filter dishes by dietary and budget constraints | Not started |
| Spec 05 | Enter a craving and correct its interpretation | Not started |
| Spec 06 | Rank and show the first recommendation set | Not started |
| Spec 07 | Request another recommendation set | Not started |
| Spec 08 | Sign in and sign out | Not started |
| Spec 09 | Save and restore the onboarding profile | Not started |
| Spec 10 | Edit saved preferences | Not started |
| Spec 11 | Like or dislike a dish | Not started |
| Spec 12 | Save and unsave a dish | Not started |
| Spec 13 | View your saved dishes | Not started |
| Spec 14 | Remember recommendations across sessions | Not started |
| Spec 15 | Learn a little from dish and restaurant opens | Not started |
| Spec 16 | Import restaurant metadata | Not started |
| Spec 17 | Import reviewed menu offerings | Not started |
| Spec 18 | Refresh menus and handle withdrawn dishes | Not started |
| Spec 19 | Enrich dish attributes locally | Not started |
| Spec 20 | Add optional stored-vector dish similarity | Not started |
| Spec 21 | Validate and release the demo | Not started |

## Working agreement

Each spec below is a task you can ask to implement by ID and name. Its visible result defines the stopping point. Add only its necessary data contract, backend behavior, focused tests, and UI or operator command. Early features use a local fixture view; Spec 06 joins them into the first full recommendation flow. This keeps individual tasks small without building broad backend/frontend layers in isolation.

- Before starting, resolve that feature’s open decisions in `docs/decisions.md` and synchronize the product spec/architecture. Proposals are not accepted defaults.
- Define behavior → add deterministic fixtures → implement and test backend/data behavior → connect presentation → manually verify → update progress/docs → commit the completed feature.
- Keep stable IDs if execution order changes. Dependencies below describe prerequisites; the tracker is the default execution order.
- Use the proposed Next.js/FastAPI/Supabase stack, with ingestion/enrichment local. Keep catalog, eligibility/ranking, transport, and presentation independently testable.
- Normal tests use synthetic/cached fixtures, controlled auth, and controlled vectors. Real menus, Overpass, OAuth, and local models get separate smoke checks. Synthetic menu data stays visibly labeled as fixtures.
- Run destructive database tests only in a disposable local database. Never reset or use the public demo database for tests. Check ownership through direct database access and API routes.
- Apply input bounds, safe rendering/links, secrets handling, and ownership controls with each feature. Before exposing any data/request endpoint publicly, provide shared request limits across instances; local-only intermediate screens must stay local until ready.
- Check keyboard access, readable loading/errors, and representative 1280×800/1440×900 layouts as each UI feature is added. No mobile scope is introduced.
- Add reproducible commands, lockfiles, environment examples, and relevant operations notes as implementation begins. Completion requires the feature’s checks and demo, not just files existing.

**Identity gate:** Setup A decides login timing. The default execution order is conditional on accepting guest-first access. If login is required first, execute Spec 08 after Setup B (its core auth implementation needs only setup), then implement Spec 09 after Spec 03 and before exposing personalized results. Update dependencies/tracker to reflect that decision. Do not silently adopt guest access or a particular provider.

## Setup A — Validate the catalog and decide the first experience

**Product-spec references:** Required data; unresolved questions 1–7, 9–10; groundwork for acceptance criteria 5, 12, 15.

**Result:** A reviewed sample of real Carmel offerings and enough recorded decisions to implement the first recommendation flow.

**Scope and acceptance:**

- Audit a proposed sample of three restaurants: OSM metadata, menu URLs, access/reuse restrictions, formats, missing fields, and traceable sample names/prices/attributes.
- Select coverage, minimum launch catalog, permitted manual-review fallback, freshness/withdrawal policy, and price-variant representation.
- Decide supported dietary restrictions and qualifying evidence, including unknown-data handling. Inference cannot establish allergy safety.
- Decide manual location input, radius behavior, and whether price is a preference or optional hard cap, including unknown prices under a cap.
- Record a behavior table for supported cravings: “spicy and filling,” “chicken,” “surprise me,” negation, unsupported text, and conflicts with persistent preferences. Specify hard requirements versus ranking preferences and correction behavior. Dietary restrictions remain authoritative.
- Decide login timing and a viable free/no-card authentication method. Guest-first access and preset Carmel areas are architecture proposals until accepted.
- Set a small pilot/usefulness measure and numerical latency target, reporting cold starts separately. Record existing local hardware; select a model only when enrichment is implemented.
- If usable permitted data is insufficient, record the coverage limitation and scope decision before proceeding to build a crawler.

**Likely files:** `docs/decisions.md`, `data/source_audit.csv`, `data/samples/carmel_offerings.json`, `PROJECT_SPEC.md`, `ARCHITECTURE.md`.

**Verification:** Trace the sample to its sources and walk through cold-start, restricted-diet, conflicting-craving, and sparse-catalog examples. No automated tests are needed for this documentation setup step.

## Setup B — Establish a runnable application and verify hosting

**Depends on:** Setup A.

**Product-spec references:** Technical/deployment constraints; groundwork for acceptance criterion 15.

**Result:** A minimal Next.js page calls a lightweight FastAPI health endpoint locally and on the candidate free host.

**Scope and acceptance:**

- Create separate frontend/backend roots and reproducible install, start, build, and test commands. Configure dependency lockfiles, `.gitignore`, and environment examples without secrets.
- Verify current provider limits, no-card account eligibility, and a minimal FastAPI deployment before committing to that host. Record any alternative and its tradeoffs.
- Use provider-issued URLs and one deployment per component. Keep model and scraping dependencies out of the API.
- Configure intended origins; show successful and unavailable health states. Do not log credentials or sensitive request data.
- Establish the disposable local Supabase test workflow needed by the next feature; do not create future feature tables yet.

**Likely files:** `frontend/`, `backend/app/main.py`, `backend/pyproject.toml`, `supabase/config.toml`, `.gitignore`, `.env.example`, `README.md`, `docs/hosting_check.md`.

**Verification:** Health smoke test, frontend typecheck/build, local browser call, and deployed call from the actual frontend origin. Record deployment size and cold starts. Unverified provider/account feasibility remains an explicit blocker to that deployment choice.

## Spec 01 — Display stored dish cards

**Depends on:** Setup B. **Product acceptance references:** 3, 11, 13, 14, 16.

**You can demo:** A local development page loads fixture offerings from the database through FastAPI and renders dish cards.

**Implement:** Create only the catalog schema/repository/read API and card component needed here. Store configurable cities/coverage, stable restaurant/offering IDs, nullable prices/currency, source URLs, verification times, and per-attribute provenance. Allow missing vectors. Cards show unknown values, source/last-checked information, and safe restaurant/location links. Add loading, empty, and API-error states. Label synthetic fixtures clearly; this development page is not yet a recommendation feature or a new public browsing product.

**Done when:** Fixture round trips, duplicate dish names at different restaurants, foreign keys, read-only public access, rejected catalog writes, unsafe links/text, missing fields, and browser rendering. Include a second-city fixture without hardcoded Carmel logic.

## Spec 02 — Choose a location and search radius

**Depends on:** Spec 01. **Product acceptance references:** 12, 16.

**You can demo:** Select a location and see only fixture offerings within the supported coverage and chosen radius.

**Implement:** Implement the location method/radius policy accepted in Setup A, backend coordinate validation and distance filtering, and an outside-coverage message. If geolocation is offered, retain manual fallback on denial or failure. Label area-based distances approximate. Do not retain precise location history.

**Done when:** Known coordinate distances, radius boundary, malformed coordinates, outside coverage, second-city configuration, denied geolocation, and changing the selected location in the UI.

## Spec 03 — Complete taste-preference onboarding

**Depends on:** Spec 02. **Product acceptance references:** 1, 14.

**You can demo:** Complete at most five question screens and view a summary of the selected preferences.

**Implement:** Collect the agreed cuisine, spice, dietary, price, and adventurousness fields. Add a shared validated preference contract and temporary session state that survives navigation under the accepted identity policy. Keep dietary restrictions separate from soft preferences. The summary must not claim these preferences already affect ranking; Specs 04 and 06 connect them to results.

**Done when:** Valid/invalid answers, field bounds, back/next navigation, at-most-five screens, session navigation, and keyboard completion. No permanent guest account is created unless separately approved.

## Spec 04 — Filter dishes by dietary and budget constraints

**Depends on:** Spec 03. **Product acceptance references:** 2, 5, 12.

**You can demo:** The fixture dish view excludes offerings that fail the selected hard constraints and explains empty results.

**Implement:** Implement the dietary evidence/unknown-data policy and any approved price cap. Apply geography and hard constraints before any ranking. Wire onboarding constraints into the existing dish request. Never relax restrictions to fill results; unknown values cannot become evidence of suitability or allergy safety.

**Done when:** Compatible/incompatible/unknown dietary fixtures, conflicting constraints, missing prices under a cap, no matches, and UI changes after modifying restrictions.

## Spec 05 — Enter a craving and correct its interpretation

**Depends on:** Spec 04. **Product acceptance references:** 4, 5.

**You can demo:** Type a craving, see the backend interpretation, and correct or refine it before requesting results.

**Implement:** Implement the agreed bounded vocabulary for spicy/filling, chicken, surprise-me, and negation. Use Setup A’s hard-versus-soft behavior table and precedence rules. Provide editable interpreted criteria and unsupported/ambiguous-input states. Validate corrected criteria server-side; they cannot override dietary restrictions. Keep the craving separate from onboarding preferences.

**Done when:** Table-driven examples, negation, ambiguous/unsupported/empty/oversized text, contradictory criteria, corrected submissions, and unchanged onboarding preferences. Do not imply unrestricted language understanding.

## Spec 06 — Rank and show the first recommendation set

**Depends on:** Spec 05. **Product acceptance references:** 1, 2, 6, 10, 13, 15.

**You can demo:** Submit preferences, location, and craving to receive 3–5 ranked eligible dish cards with truthful explanations.

**Implement:** Connect prior features to the recommendation endpoint. Score only eligible stored offerings with configurable craving, cuisine, spice, price, distance, and cold-start discovery factors; use deterministic ties. Return fewer eligible results honestly when needed. Derive explanations from actual score contributions and stored facts; no match percentages or invented history. Keep the feature-only baseline working without embeddings or external calls. Bound payloads, candidate work, and output. Before any public exposure, add shared request limits across function instances using a verified free capability or minimal database mechanism; an in-memory-only counter is insufficient.

**Done when:** Independent controlled ranking examples, zero/two/three/four/five-plus candidates, distinct offerings, hard constraints preserved, truthful explanations, missing vectors, offline external sources, request limits across instances, and onboarding → location → corrected craving → recommendations in the browser.

## Spec 07 — Request another recommendation set

**Depends on:** Spec 06. **Product acceptance references:** 8, 9.

**You can demo:** Click “another set” to see an alternative when one exists, or a clear exhaustion message.

**Implement:** Add bounded session memory and validate submitted offering IDs. Replace at least one result when eligible unseen alternatives exist. Define memory reset on changed craving/location/preferences and distinguish a transport retry from an intentional refresh. Failed calls must not falsely advance results or memory.

**Done when:** Unseen alternatives, exhaustion, small catalogs, retries, changed search context, malformed/oversized IDs, and browser failure recovery.

## Spec 08 — Sign in and sign out

**Depends on:** Spec 07; see identity gate. **Product acceptance references:** 7, 15.

**You can demo:** Sign in with the accepted provider, see authenticated state, and sign out cleanly.

**Implement:** Implement the accepted auth method/callback and verify public-demo feasibility. Validate tokens server-side, derive identity from verified credentials, and expose only a minimal authenticated session response. Clear private UI/session state on sign-out and apply authenticated request limits. Preference persistence is the next feature.

**Done when:** Invalid/expired tokens, forged identity, canceled login, callback errors, logout state, and controlled browser auth flow. Separately smoke-test the real provider; normal tests do not depend on OAuth uptime.

## Spec 09 — Save and restore the onboarding profile

**Depends on:** Spec 08. **Product acceptance references:** 1, 7.

**You can demo:** Onboarding preferences reappear after signing out and signing back in.

**Implement:** Add owned profile records and RLS with user-scoped database access. Transfer temporary answers on first login under the accepted guest policy without overwriting an existing returning profile. Recommendations load the signed-in profile while keeping current craving separate.

**Done when:** First-login transfer, returning-profile preservation, logout/login restoration, two-user isolation through API and direct data access, failed save recovery, and recommendations using restored preferences.

## Spec 10 — Edit saved preferences

**Depends on:** Spec 09. **Product acceptance references:** 7; MVP preference editing.

**You can demo:** Edit your preferences and see the next recommendation request use the changes.

**Implement:** Add the preferences screen and validated owned update operation. Keep explicit dietary restrictions separate from learned taste weights and current craving. Invalidate the relevant recommendation context according to the refresh policy and handle failed writes honestly.

**Done when:** Preference edits persist across login, changed constraints affect eligibility, changed soft preferences affect their score contribution, invalid/unauthorized updates fail, and failed writes do not show false success.

## Spec 11 — Like or dislike a dish

**Depends on:** Spec 10. **Product acceptance references:** 6, 7, 8, 10.

**You can demo:** Like, dislike, switch, or clear feedback; the next request reflects the bounded change.

**Implement:** Decide explicit-feedback weights/caps and exact-dislike exclusion versus penalty first. Add one owned current state per user/offering, controls, and deterministic recomputation or transactional updates of derived taste. Preserve dietary restrictions and make explanations agree with active feedback. Keep state and its learning effect in this feature so the button has an observable purpose.

**Done when:** Like → Dislike → clear, retries, concurrent writes, failed writes, cross-user rejection, persistence, controlled before/after scores, and reversals without residual increments.

## Spec 12 — Save and unsave a dish

**Depends on:** Spec 11. **Product acceptance references:** 6, 7, 8.

**You can demo:** Toggle a card’s saved state independently of Like/Dislike, with state restored on return.

**Implement:** Add owned idempotent save state and card control. Decide and implement a weaker capped preference contribution than explicit feedback; unsaving reverses it. A dish can be saved and disliked. The saved collection screen is the next feature.

**Done when:** Duplicate save/unsave, saved-and-disliked combination, contribution reversal, user isolation, failed writes, and logout/login restoring the card state.

## Spec 13 — View your saved dishes

**Depends on:** Spec 12. **Product acceptance references:** 11.

**You can demo:** Open the saved-dishes page, revisit restaurant information, and remove a save there.

**Implement:** Add an owned saved-list query and page using existing cards/unsave behavior. Show empty/loading/error states and clear missing/stale/withdrawn offering states according to Setup A. Preserve references and do not imply current availability from stale data.

**Done when:** Only the current user’s saves appear; unsave updates both page and cards; empty/failed requests, stale/missing offerings, safe location links, and return-session access work.

## Spec 14 — Remember recommendations across sessions

**Depends on:** Spec 13. **Product acceptance references:** 7, 8, 9.

**You can demo:** After returning, another-set behavior accounts for recently shown recommendations.

**Implement:** Decide retention, context reset, and memory bounds. Add owned recommendation-set records and persist signed-in memory using the existing refresh behavior. Keep guest memory temporary and bounded. Add cleanup for expired memory, avoiding raw cravings and precise location history; no history page.

**Done when:** Return-session refresh, context reset, exhausted catalog, repeat-safe writes, fabricated IDs, two-user access, retention boundaries, and cleanup preserving profiles/feedback/saves.

## Spec 15 — Learn a little from dish and restaurant opens

**Depends on:** Spec 14. **Product acceptance references:** 6, 8; bounded interaction requirements.

**You can demo:** Opening a dish or restaurant has a small bounded effect on later recommendations.

**Implement:** Decide event deduplication, retention, and weak-signal caps. Record only specified impressions, opens, feedback/save transitions, and refresh events; never interpret an impression as a visit or acceptance. Validate ownership/references, cap clicks below explicit feedback, and avoid counting feedback/save state twice. Extend cleanup and define how expired signals affect derived weights.

**Done when:** Repeated/duplicate/fabricated events, cross-user access, weaker contributions, retention and recomputation, unchanged dietary restrictions, and the UI open → subsequent recommendation flow.

## Spec 16 — Import restaurant metadata

**Depends on:** Spec 15. **Product acceptance references:** Required data/acquisition; 13, 16.

**You can demo:** An operator command imports a reviewed cached Overpass sample and reports created/updated restaurants.

**Implement:** Add configured geography queries, cached responses, stable OSM identities, metadata provenance, and bounded timeouts/retries/frequency. Restrict privileged writes to the operator path. Reimports must be repeat-safe; failures preserve existing data. Keep commands and fixtures reproducible; no request-time Overpass calls.

**Done when:** Cached node/way mapping, missing URLs/cuisines, malformed coordinates, repeat import, source failures/rate limits, and second-city configuration. Run a separate bounded live source smoke check.

## Spec 17 — Import reviewed menu offerings

**Depends on:** Spec 16. **Product acceptance references:** 3, 5, 11, 13; Required data/acquisition.

**You can demo:** An operator imports a small reviewed menu batch; real offerings appear in the existing recommendation UI.

**Implement:** Build extraction for only audited formats plus permitted structured manual entry. Separate extraction/review/import, restrict reviewed source URLs and redirects, and preserve access decisions, nullable price/currency, evidence, verification times, and stable offering identities. Reject malformed records without discarding the catalog. Confirm real cards/explanations use sourced facts.

**Done when:** Known extraction fixtures and price variants, unsafe URLs/redirects, unsupported sources, repeat imports, stable feedback/save references, failed-import preservation, and manual source-to-card comparison. Normal tests use fixtures.

## Spec 18 — Refresh menus and handle withdrawn dishes

**Depends on:** Spec 17. **Product acceptance references:** 3, 11, 13.

**You can demo:** Reimport changed menu data, update cards, and show a clear status for stale or withdrawn saved dishes.

**Implement:** Apply the accepted freshness/withdrawal policy, preserving identity across updates. A fetch failure is not proof of withdrawal and must not erase dishes. Withhold offerings according to policy while preserving user references. Document refresh/recovery commands and meet the agreed launch catalog minimum or record the outstanding gate.

**Done when:** Changed price/attributes, unchanged reimport, genuine withdrawal, stale thresholds, failed retrieval, preserved saves/feedback, and recommendations/saved view showing the correct states with sources offline.

## Spec 19 — Enrich dish attributes locally

**Depends on:** Spec 18. **Product acceptance references:** 5, 10, 13.

**You can demo:** Run a local enrichment batch and inspect its uncertain attributes in the existing cards.

**Implement:** Select a suitable local tool for existing hardware. Preserve sourced/reviewed/inferred evidence and unknowns; inference cannot qualify dietary safety contrary to the accepted policy. Keep heavy dependencies out of the API, skip unchanged work predictably, and preserve feature ranking on enrichment failure.

**Done when:** Provenance, repeated batches, failed/missing-tool fallback, unchanged dietary eligibility, and manual review of an attribute sample. Smoke-test real tools separately from deterministic tests.

## Spec 20 — Add optional stored-vector dish similarity

**Depends on:** Spec 19. **Product acceptance references:** 6, 10, 13.

**You can demo:** If enabled, liked-dish similarity contributes to ranking and truthful explanations without online inference.

**Implement:** Decide model/version/dimensions and contribution first. Generate vectors locally and compare stored liked-dish vectors or their aggregate at request time. Reject incompatible vectors, handle reruns consistently, and preserve the feature-only fallback. If embeddings are deferred or unavailable, record why and verify the baseline; do not invent a model requirement.

**Done when:** Controlled vectors, model/dimension mismatch, repeat generation, missing vectors/model, actual similarity explanations, and a separate small local model smoke check if enabled.

## Spec 21 — Validate and release the demo

**Depends on:** Spec 20 and all applicable earlier checks. **Product acceptance references:** All acceptance criteria.

**You can demo:** The complete approved V1 works at public URLs with a reproducible demo and operating guide.

**Implement:** Recheck free/no-card eligibility, quotas, OAuth/origins/secrets, catalog minimum, shared request limits, and ownership policies. Demonstrate accepted first-visit and returning-user flows with external sources/local processing offline. Review keyboard and desktop layouts, second-city configuration without ranking edits, and useful outage messages. Measure agreed latency/cold starts and report pilot evidence or its pending status. Document refresh, cleanup, export/recovery, pausing/quota recovery, and rollback.

**Done when:** Release feature suites, dedicated-account deployed smoke journey, isolation and client-secret checks, offline-source/missing-vector behavior, and desktop review. Rehearse destructive migration/recovery only locally. Record unmet required criteria as remaining work.

## Product acceptance coverage

These numbers refer to PROJECT_SPEC.md acceptance criteria, not feature IDs. Spec 21 verifies the complete integration; earlier partial features do not claim full V1 acceptance.

| Product criterion | Feature specs (plus setup where noted) |
|---|---|
| 1 | 03, 06, 09 |
| 2 | 04, 06 |
| 3 | 01, 17–19 |
| 4 | 05 |
| 5 | 04–05, 17, 19 |
| 6 | 06, 11–12, 15, 20 |
| 7 | 08–15 |
| 8 | 07, 11–15 |
| 9 | 07, 14 |
| 10 | 06, 11, 19–20 |
| 11 | 01, 13, 17–18 |
| 12 | 02, 04 |
| 13 | 01, 06, 16–20 |
| 14 | 01–15, 21 |
| 15 | Setup A–B; 06, 08–15, 21 |
| 16 | 01–02, 16, 21 |

## Scope boundary

Carmel desktop demo only. Mobile/native apps, ordering, reviews/social features, a taste graph, collaborative training, online generative models, a universal crawler, live stock/open-now guarantees, a visual map, user-facing history, and enterprise infrastructure remain deferred. The fixture view is development scaffolding, not an added catalog-browsing product requirement.
