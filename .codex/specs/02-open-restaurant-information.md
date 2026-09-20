# Spec 02 — Open restaurant information

Status: Implemented locally on 2026-09-17. The feature remains local-only and is not public.

## Overview

A diner viewing a dish needs enough stored restaurant information to decide where to go. Add a keyboard accessible action on each local dish card that opens basic restaurant details and, when verified coordinates exist, a safe external location link. This supplies the restaurant action needed later on recommendation and saved-dish cards without adding either flow now.

## Depends on

- Spec 01 — Display stored dish cards: stored restaurant IDs, the read-only catalog role, local-only API and card view.
- Setups A and B for the reviewed sample and disposable local database. Setup C does not make this product feature public.

## User flow

1. On `/dev/dishes`, a guest activates **Restaurant details** on a dish card. An inline details panel opens for that card and loads the restaurant identified by the card's stored restaurant ID. The same action closes it; keyboard focus stays on the control. Use a labeled button with `aria-expanded` and `aria-controls`, and keep links reachable in normal tab order.
2. Show the stored restaurant name, address when available, website when its URL is safe, and the restaurant metadata source and retrieval date when available. Show **Address unknown**, **Website unavailable**, or **Location link unavailable** for missing or unsafe values. A location link is offered only for a complete, verified coordinate pair and points to those coordinates on OpenStreetMap. It does not imply current opening hours, inventory, or a verified visit.
3. While loading, show a short status. For an unknown restaurant ID, malformed response, timeout, or API/database failure, show a readable error in the panel with a keyboard accessible retry. Closing and reopening may refetch; no persistence or user profile is created.
4. Keep the current preview label and all other dish-card facts intact. The public preview remains the minimal site/health surface.

## Routes / API endpoints

| Method | Path | Purpose | Access |
|---|---|---|---|
| `GET` | `/api/dev/restaurants/{restaurant_id}` | Read one stored restaurant by its stable ID using allowlisted fields. | Unauthenticated local development only; absent/404 in production. |

The response contains ID, name, nullable address and cuisine tags, nullable validated website and source URLs, nullable retrieval time, and nullable location URL derived from the stored latitude/longitude pair. Do not return raw coordinates unless the UI contract needs them; the backend can construct the link. Reject empty, oversized, or malformed IDs before querying; use a parameterized exact-ID query with a single-row limit. Return 404 for a well-formed but unknown ID and 503 for database failure. No URL supplied by a caller is fetched. Only GET is enabled; no restaurant write route is added. The existing local route gate, CORS restriction, and read-only database role apply. A later public endpoint needs shared request limiting and a separate release review.

## Database changes

None. `catalog_restaurants` already has stable IDs, nullable address, cuisine tags, website/source URLs, retrieval time, and latitude/longitude. The follow-up migration requires coordinates to be both present or both null. Reuse the existing `catalog_reader` SELECT policy and grant; do not add a browser database credential, user table, migration, or write policy. If fixture coverage is insufficient, extend only the deterministic disposable-database fixture with known, missing, and unsafe-link cases that the schema permits; do not fabricate reviewed Carmel facts.

## UI / Components

- Add a reusable `RestaurantDetails` component for the inline loading, detail, unavailable, and retry states. It should accept a restaurant ID, validate the response shape, render text as text, and validate external URLs again before linking. External links use `https:` and `rel="noopener noreferrer"` with a clear destination label and visible focus.
- Update `DishCard` to expose the details action and panel. Keep one restaurant association per card even if two dishes share a restaurant. Reuse this component later from saved dishes; this spec does not implement saves.
- Keep the desktop preview readable at 1280×800 and 1440×900 without horizontal overflow. Preserve the local-only `/dev/dishes` gate.

## Recommendation / personalization changes

None. Opening details does not record an interaction, learn preferences, change eligibility, rank dishes, calculate distances, or produce explanations. Specs 21 and 22 own recording and learning from opens. V1 has no dietary filters; no allergy claim is introduced.

## Data sources

The runtime source is the existing stored PostgreSQL restaurant catalog. The coordinate link is constructed from stored coordinates and opens OpenStreetMap in the user's browser; the API does not call a map service. No live Overpass, menu, geocoding, opening-hours, or enrichment request is introduced. Keep source URL and retrieval date alongside displayed facts. Setup A's sample remains six reviewed offerings from two restaurants, with Josephine coordinates unknown.

## Files to change

- `backend/app/main.py` — register the restaurant router only under the existing local catalog gate.
- `backend/app/repositories/catalog.py` — add a bounded, parameterized restaurant lookup and reuse safe URL handling.
- `frontend/components/DishCard.tsx` — add the details control and panel.
- `frontend/lib/dishes.ts` — add restaurant-response parsing and safe-link helpers if shared with the component.
- `backend/tests/fixtures/catalog.sql` — extend synthetic cases if the current records do not cover nullable fields and valid coordinates.
- `README.md` — document the local demonstration and verified checks after implementation.
- `IMPLEMENTATION_PLAN.md` — update status only when implementation starts or completes; drafting this spec does not advance it.

## Files to create

- `backend/app/routes/restaurants.py` — local read-only endpoint and allowlisted response model.
- `backend/tests/test_restaurants.py` — endpoint success, 404, 503, malformed ID, and unsafe-link tests.
- `frontend/components/RestaurantDetails.tsx` — reusable inline details panel.
- `frontend/tests/e2e/restaurant-info.spec.ts` — dish-to-restaurant, unknown fields, loading/retry, safe destination, and keyboard checks.
- `.codex/specs/02-open-restaurant-information.md` — this specification.

## New dependencies

None. The existing FastAPI, psycopg, Next.js, and Playwright dependencies cover this feature. OpenStreetMap is an external link destination, not a paid API or runtime dependency.

## Rules for implementation

- Explain the choice of an ID-based local detail endpoint and inline panel before coding. Keep repository lookup, HTTP response, URL construction, and presentation independently testable.
- Use the stored restaurant ID from the dish record. Never infer a restaurant by matching its name. An absent coordinate pair yields no location link; do not substitute a guessed address search or a Carmel preset.
- Validate `https:` website/source links and encode bounded numeric coordinates into a fixed OpenStreetMap URL. Treat stored text as untrusted. No arbitrary redirect or URL-fetch endpoint.
- Do not claim live hours, availability, current menu facts, or location eligibility. Location presets and approximate distance are Spec 03; recommendation interactions are Specs 21–22.
- Run any database tests only against the disposable local database. Follow `frontend/AGENTS.md` and the installed Next.js guide before editing frontend code. Keep the product route local until the public catalog and shared request-limit gates are met.

## Definition of done

- [x] A local guest can open and close details from the correct dish card with keyboard and pointer, see stored restaurant facts, and follow safe website and coordinate-based location links when available.
- [x] Missing address, website, coordinates, source, or retrieval date appears as unknown/unavailable. Unknown ID, malformed response, timeout, and database/API failure show an accessible recoverable state.
- [x] Deterministic tests cover exact dish-to-restaurant association, shared restaurants, absent coordinate pair, valid destination coordinates, invalid IDs, unsafe URLs/text, GET-only access, and production absence of the development endpoint. Existing disposable database tests confirm the read-only role cannot write.
- [x] Backend tests, frontend type check/build, and focused Playwright checks pass; browser checks cover keyboard focus and desktop layouts without horizontal overflow.
- [x] README and the tracker record actual implementation and verification, lockfiles remain synchronized, and no secrets are committed. No recommendation, interaction learning, real sign-in, or public product readiness is claimed.
