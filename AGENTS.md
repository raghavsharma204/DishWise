# Dish Recommendation App

## Project state

- This repository is planning-only today. Do not assume application code, dependencies, database migrations, accounts, deployments, or runnable commands exist.
- Treat [PROJECT_SPEC.md](PROJECT_SPEC.md) as the product and acceptance authority, [ARCHITECTURE.md](ARCHITECTURE.md) as the current architecture proposal, and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) as the numbered feature-spec roadmap, progress tracker, and testing guide.
- Use [brainstorm.md](brainstorm.md) for future ideas and product context, not as a source of committed V1 requirements.
- When a plan conflicts with an implementation decision, record the decision and update the relevant documentation rather than silently choosing a default.

## Intended architecture

- Build the proposed stack as separate frontend, backend, and local data-processing responsibilities: Next.js/React/TypeScript/Tailwind, FastAPI/Python, and local ingestion/enrichment scripts.
- Explain important architectural decisions before implementing them.
- Work on one numbered feature spec at a time, after the required setup steps. State its ID and feature name when starting work; update the progress tracker in IMPLEMENTATION_PLAN.md when it starts, completes, or is blocked.
- Prefer simple, readable implementations.
- Use Supabase PostgreSQL, pgvector, and authentication for persistence. Keep heavy NLP, scraping, and embedding dependencies out of the deployed request path unless a documented hosting check proves they fit.
- Keep recommendation decisions in the backend. Keep cities, coverage, sources, and catalog data configurable so adding a city does not require changing ranking logic.
- Serve recommendations from the stored catalog. Runtime requests must not depend on live Overpass, menu scraping, or an operator's local machine.

## Product and data rules

- V1 is a desktop/laptop demo focused on dish-level recommendations for configured Carmel, Indiana coverage. Do not expand into mobile, ordering, social, or a general-purpose crawler without an explicit scope decision.
- Apply hard constraints, especially dietary exclusions, before ranking. Never relax them to fill the result set.
- Keep persistent preferences separate from the current craving. Likes and dislikes are mutually exclusive and reversible; saves are independent and weaker than explicit feedback; all learning effects must be bounded and repeat-safe.
- Return only stored offerings and derive explanations from stored attributes and actual ranking factors. Show unknown prices or attributes as unknown. Never invent menu facts, availability, opening status, match percentages, probability claims, allergy safety, or prior user behavior.
- Preserve source URLs, retrieval/verification times, and whether attributes are sourced, manually reviewed, or inferred. Inferred food attributes are uncertain and cannot establish allergy safety.
- Prefer deterministic fixture-based tests. Do not make normal tests depend on live restaurant sites, Overpass, OAuth providers, hosted model inference, or production data.

## Security and operations

- Keep secrets in environment variables and out of browser bundles and Git. Validate tokens server-side, derive user identity from verified credentials, enforce ownership/RLS, and validate and bound inputs and requests.
- Never expose an unrestricted URL-fetch endpoint. Fetch only reviewed public sources whose access and reuse are permitted; respect terms and robots rules and do not bypass access controls.
- Do not log tokens, precise location histories, or unnecessary raw cravings. Keep interaction data small, bounded, deduplicated, and retention-limited.
- Run destructive database tests only against a disposable local test database. Never reset or use the public demo database for tests.
- Recheck provider limits, eligibility, and no-card requirements before deployment. Do not silently introduce paid services or plans.

## Change workflow

- Resolve the relevant open decision before implementing behavior that depends on it; unresolved questions are listed in [PROJECT_SPEC.md](PROJECT_SPEC.md).
- Develop feature by feature using vertical slices. A slice should include the relevant data contract or fixture, backend behavior, focused tests, and the smallest usable presentation needed to demonstrate it.
- Use the numbered feature specs in IMPLEMENTATION_PLAN.md as implementation units and PROJECT_SPEC.md acceptance criteria as the product requirements. Feature-spec IDs and acceptance-criterion numbers are distinct; complete the current feature across data, backend, tests, and UI before advancing.
- For each feature, follow this loop: define behavior, add deterministic fixtures, implement the backend logic, add focused tests, connect the UI, manually verify the flow, and commit the completed slice.
- Keep catalog ingestion, recommendation eligibility/ranking, API transport, and presentation independently testable.
- Add or update behavior-focused tests with each implemented feature spec. Prefer small, meaningful tests over snapshots.
- Keep documentation, dependency lockfiles, environment examples, and reproducible commands synchronized as implementation begins. Since none exist yet, discover and document the actual commands when the first project structure is created.
- Before deployment, verify the complete guest and returning-user flows, cached-catalog behavior with external sources unavailable, user isolation, desktop accessibility, and second-city configuration without ranking changes.
