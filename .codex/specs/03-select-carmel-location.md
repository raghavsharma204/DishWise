# Spec 03 — Select a Carmel location

Status: Implemented locally on 2026-09-20. The accepted preset coordinates were rechecked, and the owner-approved operational central-Carmel coverage polygon is recorded as a product/catalog boundary rather than an official district boundary. The feature remains local-only.

## Overview

A guest needs a simple way to choose an approximate starting area before recommendations can apply distance. Add a manual selector for Midtown or Arts & Design District to the local catalog preview. Selection changes backend-calculated approximate distances to stored restaurants and keeps a bounded guest-session choice, without browser geolocation, address search, a map, or location history.

This is the location-origin slice in the roadmap. It establishes configurable city, coverage, and preset IDs plus deterministic distance calculation. It does not filter offerings by radius, rank or recommend dishes, accept arbitrary coordinates, or expose the unfinished product publicly. Spec 04 owns 1/3/5-mile radius selection and geographic eligibility; later recommendation specs consume the selected IDs.

## Depends on

- Spec 01 — Display stored dish cards: the local-only catalog page/API, stored restaurant IDs and nullable coordinate pairs, read-only database role, deterministic second-city fixture, and disposable local database workflow.
- Setup A: the accepted manual Midtown and Arts & Design District presets, approximate-distance wording, guest-first flow, default 3-mile radius, and no-geolocation decision.
- Setup B: local Next.js/FastAPI processes and test commands. Setup C does not make this feature public.
- The owner approved the exact operational `central-carmel` coverage polygon on 2026-09-20 after reviewing the accepted geographic evidence. `docs/decisions.md` records its purpose, sources, review date, and status as a product coverage limit rather than an official district boundary; the related `PROJECT_SPEC.md` question is resolved. The factual configuration does not reuse the synthetic fixture rectangle.

## User flow

1. A guest opens the local `/dev/dishes` preview. Above the cards, the page offers two manual choices: **Midtown** and **Arts & Design District**. No browser permission prompt or address field appears. Before selection, cards do not claim a distance.
2. Selecting a preset sends only its stable ID to FastAPI. The backend resolves the configured origin, reads stored restaurant coordinates, and returns distance in miles for each restaurant with a complete coordinate pair. The UI labels every value **Approx. distance from [area]** and shows **Approx. distance unknown** when coordinates are absent.
3. Changing the preset replaces the origin and recomputes the displayed values. It does not change card order or eligibility in this spec. The current selection and `radius_miles: 3` are kept in versioned `sessionStorage` as IDs/allowed values only so a tab reload can restore the guest context. Raw coordinates, distance history, timestamps, and prior selections are not stored.
4. If storage is unavailable, the selector continues in memory for the current page. If a stored ID is stale or unsupported, discard it, show the two supported choices, and do not silently substitute another location. A configuration/API failure shows a readable, keyboard-accessible retry state without hiding the catalog cards.
5. The public preview remains limited to its existing homepage, privacy page, and health check. Denied or unavailable geolocation has no effect because the application never requests it.

## Routes / API endpoints

| Method | Path | Purpose | Access |
|---|---|---|---|
| `GET` | `/api/dev/locations` | Return the configured location choices as stable city/coverage/preset IDs, user-facing labels, `approximate: true`, and `default_radius_miles: 3`. Do not return preset coordinates or the coverage polygon to the browser. | Unauthenticated local development only; absent/404 in production. |
| `GET` | `/api/dev/locations/{preset_id}/distances` | Resolve one supported preset and return bounded per-restaurant approximate distances for the stored catalog. | Unauthenticated local development only; absent/404 in production. |

The distance response contains the selected city, coverage and preset IDs/label; `approximate: true`; and a stable list of `{restaurant_id, distance_miles}` where distance is nullable for unknown restaurant coordinates. Round only the serialized display value (one decimal mile); keep full precision during calculation. Order by restaurant ID and cap the response at the existing local catalog limit. Return 404 for a well-formed unknown preset ID, 422 for malformed/oversized IDs, and 503 for invalid configuration or database failure. The client cannot submit coordinates, city IDs, coverage IDs, radius values, URLs, or query expressions.

Use a standard haversine great-circle calculation in `backend/app/location.py`, with Earth radius documented in the module. Location resolution and distance calculation stay in the backend so later eligibility logic can reuse the same tested functions. These local-only GET routes inherit the exact-origin CORS policy and read-only database role. Any public location/catalog endpoint requires shared cross-instance request limiting and a release review.

## Database changes

No schema migration, new table, user row, RLS policy, or write grant is required. `catalog_cities`, `catalog_coverage_areas`, and `catalog_restaurants` already hold stable IDs, nullable coverage GeoJSON, and paired nullable coordinates.

During implementation, update the disposable reviewed-sample loader to read the approved `central-carmel` boundary from `data/coverage/carmel.json` instead of inserting an unverified null extent. Continue loading only audited restaurant coordinates; Josephine remains null unless separately verified. The loader may replace data only in the disposable local database. Synthetic fixtures keep fictional polygons and known test coordinates, including a second city, and must not be relabeled as geographic evidence.

No selection or distance is persisted in PostgreSQL. The browser stores only the current versioned preset ID and the accepted default radius value in session storage. Authentication, owned persistent preferences, and cross-session state are outside this spec.

## UI / Components

- Create `frontend/components/LocationSelector.tsx` as a labeled radio group or equivalently accessible single-choice control populated from the locations endpoint. It owns loading, retry, unavailable-storage, unsupported-stored-value, and selection states, with visible focus and no geolocation affordance.
- Create `frontend/lib/guest-session.ts` with a versioned, allowlisted parser/writer for `{city_id, coverage_id, preset_id, radius_miles}`. Treat browser storage as untrusted, catch access/quota errors, and validate a restored preset against server-provided configuration before use. Store no coordinates or history.
- Update `frontend/components/DishCatalog.tsx` to load configuration, request distances after selection, retain cards during a location error, and associate distance values by stable restaurant ID.
- Update `frontend/components/DishCard.tsx` to render the selected preset's approximate distance or an explicit unknown. Repeated offerings from one restaurant receive the same value.
- Keep `/dev/dishes` local-only and readable without horizontal overflow at 1280×800 and 1440×900. Controls, status, errors, and retry must be keyboard accessible and announced appropriately without moving focus unexpectedly.

## Recommendation / personalization changes

No recommendation, ranking, explanation, feedback, save, interaction, or learning behavior is added. This spec calculates and displays approximate restaurant distances but does not apply the 3-mile radius to eligibility; Spec 04 owns radius selection and coverage/radius intersection. Card order and membership remain unchanged when the origin changes.

The session value is temporary request context, not a persistent preference or precise location. It must not overwrite later profile data or imply previous user behavior. V1 still has no dietary filters or allergy-safety claims.

## Data sources

- Runtime preset and coverage configuration comes only from checked-in `data/coverage/carmel.json`; runtime requests do not call OpenStreetMap, Overpass, geocoding, browser geolocation, or an operator machine.
- Midtown uses preset ID `midtown` and the accepted approximate origin `39.9757552, -86.1289362`. On 2026-09-20, OpenStreetMap API node `10085774350` still returned those coordinates for Fork and Ale House. The City of Carmel Midtown page identifies Fork + Ale House in Midtown and describes Midtown as connecting the Arts & Design District and City Center.
- Arts & Design District uses preset ID `arts-design-district` and the accepted approximate origin `39.9786375, -86.1259628`. On 2026-09-20, the OSM API geometry for way `1101349116` still produced that rounded center for Woody's Library Restaurant. The City of Carmel identifies the Arts & Design District in Old Town Carmel; the restaurant point is an approximate area reference, not an asserted district centroid.
- `data/coverage/carmel.json` records source URLs, OSM element type/ID, source timestamps where available, review date, coordinate method (`node` or `geometry_center`), labels, stable IDs, default radius, and the approved operational coverage polygon/provenance. GeoJSON coordinates use longitude/latitude order. OpenStreetMap attribution and ODbL source metadata remain preserved.
- The factual restaurant coordinates continue to come from the reviewed audit/catalog. Unknown coordinates stay null and produce unknown distance; do not geocode or guess them.

## Files to change

- `backend/app/main.py` — register the location router only under the existing local catalog gate.
- `backend/app/repositories/catalog.py` — add a bounded read of stable restaurant IDs and nullable coordinate pairs, ordered by ID.
- `backend/scripts/load_reviewed_sample.py` — validate and load the approved coverage record from configuration into the disposable local catalog.
- `backend/tests/fixtures/catalog.sql` — extend only deterministic synthetic distance/unknown/second-city cases as needed.
- `frontend/components/DishCatalog.tsx` — coordinate selector state, distance request, and recoverable errors.
- `frontend/components/DishCard.tsx` — show approximate distance or unknown without changing card eligibility/order.
- `data/source_audit.csv` — refresh the two OSM coordinate check dates/evidence during implementation without changing unverified restaurant facts.
- `docs/decisions.md` and `PROJECT_SPEC.md` — record the approved operational coverage polygon decision and resolve the Spec 03 coordinate/coverage question before coding dependent behavior.
- `README.md` — document the local location demonstration, configuration provenance, storage behavior, and verified commands after implementation.
- `IMPLEMENTATION_PLAN.md` — update status only when implementation starts, completes, or is blocked; drafting this spec does not advance it.

## Files to create

- `data/coverage/carmel.json` — validated Carmel city/coverage/preset configuration and reviewed provenance; no placeholder or synthetic factual boundary.
- `backend/app/location.py` — configuration parsing/validation, preset resolution, point-in-coverage validation, and haversine distance calculation independent of HTTP/database code.
- `backend/app/routes/locations.py` — local-only allowlisted configuration and distance endpoints.
- `backend/tests/test_location.py` — deterministic configuration, endpoint, and distance tests.
- `frontend/components/LocationSelector.tsx` — accessible manual preset selector and its states.
- `frontend/lib/guest-session.ts` — bounded versioned guest context storage and validation.
- `frontend/tests/e2e/location.spec.ts` — manual-selection, changed-origin, persistence/fallback, error, accessibility, and desktop-layout checks.
- `.codex/specs/03-select-carmel-location.md` — this specification.

## New dependencies

None. Python's standard `json`, `math`, and `pathlib` modules cover configuration and haversine calculation. Existing FastAPI/Pydantic, React/Next.js, TypeScript, pytest, and Playwright tooling cover the API, UI, and deterministic tests. OpenStreetMap and City of Carmel pages are review-time evidence, not paid services or runtime dependencies.

## Rules for implementation

- Before code changes, explain and record the operational coverage-boundary choice. It must be evidence-backed, owner-approved, configurable, and clearly distinguished from an official legal/district boundary. Do not copy the synthetic fixture rectangle or silently broaden coverage to all Carmel.
- Treat `data/coverage/carmel.json` as untrusted input at startup/request boundary: require unique bounded IDs, exactly two valid Carmel presets for V1, paired finite coordinates in legal ranges, a closed valid Polygon, source metadata, and `default_radius_miles: 3`. Reject invalid configuration rather than partially serving it.
- Do not hardcode Carmel labels, IDs, preset count, or coordinates in distance logic, route code, or UI. A second-city fixture must work by substituting configuration/catalog data, without changing calculation or presentation logic.
- Accept only configured preset IDs from the client. Never accept arbitrary coordinates, addresses, or URLs; never invoke browser geolocation; never log or persist location selections/history. Preset IDs may appear in ordinary request paths, but request logging must not add raw coordinates.
- Validate that each configured preset lies within its approved coverage polygon. Preserve full calculation precision, round only API display values, label distances approximate, and return null for unknown restaurant coordinates. Do not substitute preset coordinates for a restaurant.
- Keep the feature local-only until the catalog/recommendation flow and shared public rate limiting are complete. No selection may change eligibility until Spec 04, and no distance may become a ranking/explanation factor before its owning later spec.
- Run destructive/loader checks only against the disposable unlinked local Supabase database. Follow `frontend/AGENTS.md` and the installed Next.js documentation before editing frontend code.

## Definition of done

- [x] The project owner has approved an evidence-backed operational `central-carmel` Polygon; `docs/decisions.md`, `PROJECT_SPEC.md`, source audit, and `data/coverage/carmel.json` agree on its scope/provenance. Current OSM records confirm the two accepted preset origins, and neither point is described as an official district centroid.
- [x] On the local preview, a guest can select either Midtown or Arts & Design District with pointer or keyboard; changing the choice changes known restaurant distances while card membership/order stays fixed. All values are labeled approximate, and missing restaurant coordinates show unknown.
- [x] A reload restores a valid choice and the default 3-mile context from versioned session storage. Invalid/stale storage is discarded, blocked storage falls back to in-memory state, and no coordinates or selection history are stored in the browser or database.
- [x] No browser geolocation/address API is called or requested. Unsupported/malformed IDs, invalid configuration, empty catalog, unknown coordinates, timeouts, malformed responses, and API/database failures have deterministic, honest, recoverable behavior.
- [x] Backend tests cover accepted reference points, zero/known-distance haversine cases, rounding, changed origin, antipodal/numeric edge handling as appropriate, unknown coordinate pairs, invalid/unsupported IDs, bounded reads, closed/configured coverage, and a second-city configuration without Carmel-specific logic.
- [x] Browser tests cover both choices, approximate labels, shared-restaurant distances, changed origin, default radius context, session restore/corruption/storage failure, no geolocation invocation, loading/error/retry, keyboard operation, and 1280×800 and 1440×900 layouts without horizontal overflow.
- [x] Config parsing, backend tests, frontend type check/build, and focused Playwright tests pass using documented commands. The reviewed-sample loader is exercised only against the disposable local database; the public preview still exposes no product route; lockfiles remain unchanged unless justified; and no secrets are committed.
- [x] The README and roadmap record only observed implementation evidence. The feature does not claim radius filtering, recommendation eligibility/ranking, location tracking, real sign-in, launch-catalog readiness, or public deployment.
