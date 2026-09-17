# Dish Recommendation App

## Project state

- Setups A–C and local Spec 01 are complete. Setup B provides local frontend, backend health, and disposable database workflows; Setup C deployed only a public preview and health endpoint and published the Google External OAuth app. Spec 01 adds a local synthetic catalog schema and card view; no recommendation flow or real sign-in is implemented yet. The launch catalog remains unverified. Inspect the tracker and recorded evidence before claiming feature or deployment readiness.
- Treat [PROJECT_SPEC.md](PROJECT_SPEC.md) as the product and acceptance authority, [ARCHITECTURE.md](ARCHITECTURE.md) as the current architecture proposal, and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) as the numbered feature-spec roadmap, progress tracker, and testing guide.
- Use [brainstorm.md](brainstorm.md) for future ideas and product context, not as a source of committed V1 requirements.
- When a plan conflicts with an implementation decision, record the decision and update the relevant documentation rather than silently choosing a default.

## Intended architecture

- Build the proposed stack as separate frontend, backend, and local data-processing responsibilities: Next.js/React/TypeScript/Tailwind, FastAPI/Python, and local ingestion/enrichment scripts.
- Explain important architectural decisions before implementing them.
- Use the 31 single-feature specs in IMPLEMENTATION_PLAN.md. Setup A is completed product/data feasibility, Setup B is local application setup, and Setup C is free-hosting/public OAuth prerequisite verification. Work on one ready spec at a time according to its explicit dependencies; row order is not a mandatory dependency chain. State its ID and name and update the tracker when starting, completing, or blocking work.
- Prefer simple, readable implementations.
- Use Supabase PostgreSQL, pgvector, and authentication for persistence. Keep heavy NLP, scraping, and embedding dependencies out of the deployed request path unless a documented hosting check proves they fit.
- Keep recommendation decisions in the backend. Keep cities, coverage, sources, and catalog data configurable so adding a city does not require changing ranking logic.
- Serve recommendations from the stored catalog. Runtime requests must not depend on live Overpass, menu scraping, or an operator's local machine.

## Product and data rules

- V1 is a desktop/laptop demo for curated Midtown and Arts & Design District coverage in Carmel, Indiana. Preserve manual presets, default 3-mile radius with 1/3/5-mile choices, guest-first access, Google/Supabase auth, soft price/craving preferences, 30-day menu freshness, and variants under one offering identity as recorded in docs/decisions.md. Do not expand into mobile, ordering, social, or a general-purpose crawler without an explicit scope decision.
- Apply supported hard constraints before ranking and never relax them to fill the result set. V1 has no dietary filters; do not imply allergy safety from food attributes.
- Keep persistent preferences separate from the current craving. Likes and dislikes are mutually exclusive and reversible; saves are independent and weaker than explicit feedback; all learning effects must be bounded and repeat-safe.
- Separate recording from learning: Spec 15 records feedback and Spec 16 personalizes from it; Spec 17 records saves and Spec 19 personalizes from them; Spec 21 records interactions and Spec 22 personalizes from opens. Earlier features must not claim learning that is not implemented. Keep Like/Dislike/switch/clear, save/unsave, and sign-in/sign-out together as their respective state lifecycles.
- Return only stored offerings and derive explanations from stored attributes and actual ranking factors. Show unknown prices or attributes as unknown. Never invent menu facts, availability, opening status, match percentages, probability claims, allergy safety, or prior user behavior.
- Preserve source URLs, retrieval/verification times, and whether attributes are sourced, manually reviewed, or inferred. Inferred food attributes are uncertain and cannot establish allergy safety.
- Prefer deterministic fixture-based tests. Do not make normal tests depend on live restaurant sites, Overpass, OAuth providers, hosted model inference, or production data.

## Security and operations

- Keep secrets in environment variables and out of browser bundles and Git. Validate tokens server-side, derive user identity from verified credentials, enforce ownership/RLS, and validate and bound inputs and requests.
- Include security and accessibility in the feature they protect, not a final cleanup feature. Shared request limits across instances are required before exposing public data/request endpoints; in-memory-only counters are insufficient. Incomplete intermediate product views remain local; hosting checks expose only their intended minimal site/health surface.
- Never expose an unrestricted URL-fetch endpoint. Fetch only reviewed public sources whose access and reuse are permitted; respect terms and robots rules and do not bypass access controls.
- Do not log tokens, precise location histories, or unnecessary raw cravings. Keep interaction data small, bounded, deduplicated, and retention-limited.
- Run destructive database tests only against a disposable local test database. Never reset or use the public demo database for tests.
- Recheck provider limits, eligibility, and no-card requirements before deployment. Do not silently introduce paid services or plans.

## Change workflow

- Resolve the relevant open decision before implementing behavior that depends on it; unresolved questions are listed in [PROJECT_SPEC.md](PROJECT_SPEC.md).
- Each spec delivers one observable behavior with its own likely files, acceptance criteria, tests, and demonstration. Include only the data contract/fixture, backend, UI or operator command needed for that behavior. Do not split work solely into technical layers or bundle independent behaviors into one spec.
- Use numbered feature specs as implementation units and PROJECT_SPEC.md acceptance criteria as product requirements; these numbering systems are distinct. Complete the current behavior across its necessary layers without implementing its later consumers. Dependencies permit imports without authentication and saves without feedback learning; do not manufacture a long dependency chain.
- The roadmap's previous-ID migration guide resolves old references in decision records or feature drafts. Before using a historical spec, reconcile its ID/scope with the new roadmap. Do not reset Setup A or silently renumber the 31 approved IDs when execution order changes.
- For each feature, follow this loop: define behavior, add deterministic fixtures, implement the backend logic, add focused tests, connect the UI, manually verify the flow, and commit the completed slice.
- Keep catalog ingestion, recommendation eligibility/ranking, API transport, and presentation independently testable.
- Add or update behavior-focused tests with each implemented feature spec. Prefer small, meaningful tests over snapshots.
- Keep documentation, dependency lockfiles, environment examples, and reproducible commands synchronized as implementation proceeds. The local Setup B commands are recorded in README.md; verify later commands when their feature structure is created.
- Treat release verification as a checklist, not a numbered product feature. Before public product release, verify complete guest/returning flows, stored-catalog behavior with sources/operator machine offline, user isolation, desktop accessibility, second-city configuration without ranking changes, public OAuth, and the five-restaurant/25-offering catalog gate. Record measured latency and pilot evidence separately from targets; unmet required criteria remain incomplete.
