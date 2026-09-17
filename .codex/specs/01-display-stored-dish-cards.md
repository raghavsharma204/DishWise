# Spec 01 — Display stored dish cards

Status: Implemented locally on 2026-09-17, with a later local preview correction requested by the owner. The page can show the six reviewed factual offerings; synthetic fixtures remain in tests. See `IMPLEMENTATION_PLAN.md` for measured verification. No public catalog product is deployed.

## Overview

A diner needs to see what a stored dish offering actually says before the app can recommend it. Build a local development page that reads a small, labeled fixture catalog from PostgreSQL through FastAPI and renders dish cards. This establishes the catalog and presentation contract for later features. It is not a recommendation set or a public product page. Setup A's six reviewed factual offerings remain below the five-restaurant/25-offering release gate.

## Depends on

- Setup A for the accepted catalog, provenance, variant, freshness, and coverage decisions and the permitted factual sample.
- Setup B for the running Next.js/FastAPI roots and disposable local Supabase PostgreSQL workflow. Setup C is not required for this local feature.
- No numbered feature spec. Spec 02 can later add restaurant opening; Specs 03, 04, 06, 09, and 10 own location, radius, eligibility, ranking, and explanations respectively.

## User flow

1. An operator starts the disposable local database, applies the migrations, and loads either the labeled synthetic test fixture or the fixed six-offering reviewed factual sample, then starts the existing local API and frontend using documented commands.
2. At `/dev/dishes`, a guest sees a loading state, then one card per stored offering with dish name, restaurant, known price or explicit unknown, available basic attributes with provenance, and menu source/last verification details. Variants appear under the same offering card with their own labels and prices. The page labels synthetic records or the reviewed factual sample and says it is a catalog preview, not recommendations or proof of availability.
3. With no records, show an honest empty catalog message. On database/API failure or malformed response, show an error and keyboard accessible retry. Missing optional facts stay unknown; stale verification is displayed as a date without implying a live menu check.
4. The existing `/` preview and `/privacy` remain minimal public surfaces. The development page and catalog API are available only in an explicit local development configuration; deployed preview builds must not expose them.

## Routes / API endpoints

| Method | Path | Purpose | Access |
|---|---|---|---|
| `GET` | `/dev/dishes` | Render the local catalog preview. | Local development only; absent or 404 in production. |
| `GET` | `/api/dev/dishes` | Return a bounded, deterministic list of stored offering cards joined to restaurant names and limited public catalog fields. No caller supplied URL, sorting expression, or unbounded pagination. | Unauthenticated local development only; route absent or 404 in production. |

Return one object per offering ID, with restaurant ID/name, nullable description and base price/currency, ordered price variants, available attributes with value and provenance, source URL, verification time, and catalog status. Use a stable ordering by restaurant and offering ID. Return an empty list for an empty catalog and a non-success response for a database failure. The browser does not connect to PostgreSQL or Supabase directly. No catalog write route is exposed; POST/PATCH/DELETE are rejected. Keep CORS restricted to the configured local frontend origin. Before any later public catalog endpoint is exposed, add shared request limits across instances and review the read contract.

## Database changes

- Create one migration under `supabase/migrations/` for `catalog_cities`, `catalog_coverage_areas`, `catalog_restaurants`, `catalog_offerings`, `catalog_price_variants`, and `catalog_attributes`. IDs are stable text keys, not names; foreign keys link coverage to city, restaurant to city and coverage, and offering/variant/attribute to the owning restaurant or offering. Include uniqueness for restaurant source IDs where present and for variant label per offering. Duplicate offering names across different restaurants are valid.
- Cities store name and state/country identifiers; coverage areas store a named, configurable geographic extent when verified. Store restaurant coordinates as a nullable pair of bounded latitude/longitude, plus nullable address/cuisine/site/menu fields, source identifier/URL, and last retrieval time. The reviewed sample has no verified Josephine coordinates or coverage polygon, so those remain null until location work. Do not hardcode Carmel into the table definitions or query; fixtures include a second synthetic city to verify the contract.
- Offerings store menu name, nullable description and base price/currency, source URL, last verification time, review/status fields, and name/description/price provenance. A missing base price remains null even when variants have prices. Variants store label, amount, currency, and provenance under one offering ID. Attributes store a controlled kind/value, provenance (`sourced`, `manually_reviewed`, or `inferred`), nullable evidence/source reference, and review time. Unknown values are absent or null, never inferred as negative facts. Store a status suitable for later withdrawn/freshness filtering, but this spec does not decide recommendation eligibility.
- Add foreign keys, positive price checks, valid currency/coordinate checks, nonempty required text, timestamp checks, and indexes on city/coverage, restaurant, offering status/verification, and child foreign keys. Keep schema small; no embedding, auth, feedback, save, or interaction tables yet.
- Enable RLS on catalog tables and grant the backend a dedicated read-only role with a read policy. Use an allowlisted API response model to limit fields; RLS alone does not restrict columns. Grant no anonymous or browser write access, and do not use a service-role key for this read path. Local fixture loading is an operator action against the disposable database only. Test read-only and rejected-write behavior through both API and database roles. Any later public deployment requires shared request limiting first.

## UI / Components

- Create `frontend/components/DishCard.tsx` to render one offering identity, with variant prices grouped underneath. Render menu text as text, not HTML. Permit external source links only after `https:` URL validation and add safe external-link attributes. A missing or unsafe URL becomes plain source-unavailable text.
- Create `frontend/app/dev/dishes/page.tsx` for the local loading, cards, empty, error, and retry states. Keep it out of the production build or make production requests return 404. Use the existing TypeScript/Tailwind setup, visible focus states, readable labels, and desktop layout at 1280×800 and 1440×900.
- Do not add a restaurant details action, location/radius controls, craving input, feedback, save controls, match claims, or explanation text. Those belong to later specs.

## Recommendation / personalization changes

None. The endpoint lists stored fixture offerings; it does not apply geographic or freshness eligibility, rank or choose 3–5 results, explain matches, record impressions, or personalize. V1 has no dietary filter. A displayed attribute, especially an inferred one, never establishes allergy safety.

## Data sources

- The runtime source is the stored local PostgreSQL catalog only. The deterministic test fixture is synthetic, clearly labeled, and contains Carmel coverage plus a second city, duplicate names across restaurants, missing prices/attributes, and variants. Fixtures carry source/verification and provenance fields without presenting synthetic data as real restaurant facts. Test unsafe links as rejected input and as a controlled malformed API response, rather than seeding them as valid sources.
- Setup A's `data/samples/carmel_offerings.json` supplies a fixed, local-only factual preview of six previously reviewed offerings from two menus. It is not an automatic public seed and does not satisfy the release gate. No new live menu, Overpass, scraping, OAuth, or model source is introduced.

## Files to change

- `backend/app/main.py` — register the local-only catalog route and keep the existing health route and restricted CORS.
- `backend/pyproject.toml` and `backend/uv.lock` — add the minimal PostgreSQL client and lock it if implementation requires one.
- `frontend/package.json` and `frontend/package-lock.json` — add only tooling needed for a focused browser test, if used.
- `frontend/.env.example`, `.env.example`, and `README.md` — document local database/API configuration, migration/fixture loading, preview behavior, and verified checks without secrets.
- `IMPLEMENTATION_PLAN.md` — update progress and verification evidence when implementation actually starts or completes, not for this draft.
- `PROJECT_SPEC.md`, `ARCHITECTURE.md`, and `docs/decisions.md` — change only if implementation resolves a conflicting/open decision; record the decision explicitly.

## Files to create

- `supabase/migrations/<timestamp>_catalog.sql` — first catalog schema, constraints, indexes, RLS, and grants.
- `backend/app/repositories/catalog.py` — bounded read query and mapping independent of HTTP.
- `backend/app/routes/dishes.py` — local-only GET route and allowlisted response contract.
- `backend/tests/fixtures/catalog.sql` — deterministic disposable-database seed with labeled synthetic records.
- `backend/scripts/load_reviewed_sample.py` — fixed local-only loader for the six reviewed factual sample offerings.
- `backend/tests/integration/test_catalog.py` — migration/fixture, contract, and database-role tests against the disposable local database.
- `backend/tests/test_dishes.py` — focused API success, empty, failure, and rejected-write tests with a controlled repository.
- `frontend/components/DishCard.tsx` and `frontend/app/dev/dishes/page.tsx` — card and local preview page.
- `frontend/tests/e2e/dish-cards.spec.ts` — focused browser checks if the selected test runner is added.
- `.codex/specs/01-display-stored-dish-cards.md` — this specification.

Paths listed as new do not currently exist. Fixture loading may use a small operator command if needed; document its concrete path and verified invocation during implementation.

## New dependencies

- A small open-source PostgreSQL driver for FastAPI, such as `psycopg` without optional binary/model packages, if direct SQL access is selected. Keep connection details server-side and verify its locked install and host fit before any deployment claim.
- A small open-source browser test runner such as Playwright only if used for the focused local UI test; record its lockfile and reproducible install/test command. No paid service, hosted inference, scraping, or auth SDK is needed.
- Use the existing local Supabase CLI/PostgreSQL workflow. pgvector remains the chosen future embedding store but this feature adds no vectors or vector runtime dependency.

## Rules for implementation

- Explain the catalog storage and API boundary before coding. Keep fixture import, repository query, transport, and card rendering independently testable.
- Use only a disposable local test database for migration and destructive tests; never target the hosted demo database. Preserve source URL, retrieval/verification times, and field/attribute provenance. Never promote inferred attributes into verified facts.
- Validate catalog URLs at input and output boundaries; escape all menu text. Bound query results and responses. No unrestricted URL fetch or live source request occurs at runtime.
- Keep development catalog surfaces local until the catalog gate, product flow, and shared cross-instance request limits are ready. Do not infer recommendation readiness from successful card rendering.
- Consult `frontend/AGENTS.md` and the installed Next.js guide before implementation in that subtree.

## Definition of done

- [x] A local operator can apply the migration, seed the disposable database, start both processes, and see labeled stored dish cards at `/dev/dishes`; `/health` still works independently of database availability.
- [x] Each card maps to one stored offering and restaurant, shows known facts and explicit unknowns, groups variants under one offering, and displays a safe source link and verification date. Inferred attributes are visibly uncertain; no allergy, availability, opening, match, or recommendation claim appears.
- [x] Empty, loading, malformed response, and database/API failure states are readable and recoverable. Keyboard navigation and focus work at 1280×800 and 1440×900.
- [x] Deterministic tests cover fixture round trips, foreign keys, duplicate names across restaurants, variants, missing fields, second-city configuration, unsafe text/URLs, bounded reads, rejected API/database writes, and production absence of development routes. Database tests target only the disposable local instance.
- [x] The configured backend tests, frontend type check/build, and browser tests pass with documented commands. README and environment examples match the implementation; lockfiles are current and no secrets are committed.
- [x] The progress tracker records start/completion and observed verification. Public catalog and recommendation readiness remain unclaimed until their separate gates are met.
