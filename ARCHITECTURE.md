# MVP Architecture Proposal

Status: Proposed product architecture with Setups A–C and local Spec 01 complete and decisions in `docs/decisions.md`. The minimal frontend and FastAPI health endpoint are publicly deployed on Vercel Hobby; the catalog card view with the six reviewed sample offerings is local only. Google External OAuth publication succeeded without a card, while real sign-in remains unverified. The sample is below the public launch catalog gate.

Launch region: Carmel, Indiana. This proposal follows PROJECT_SPEC.md and preserves the ability to add cities through data and configuration.

## Recommendation

Use **Option 1: Next.js and a lightweight FastAPI backend on Vercel, with Supabase for data and authentication**. Run menu collection and embedding generation locally before uploading the catalog.

This satisfies the chosen stack while keeping the publicly deployed application small. The central decision is to separate preparing dish data from serving recommendations.

## Two options

| Decision | Option 1 — Vercel + Supabase | Option 2 — Vercel + Render + Supabase |
|---|---|---|
| Frontend | Next.js on Vercel | Same |
| Backend | FastAPI on Vercel Functions | FastAPI web service on Render |
| Database and authentication | Supabase | Same |
| Menu processing and embeddings | Local Python batch scripts | Same |
| Hosting model | Backend runs on demand | Backend runs as a conventional server while awake |
| Main advantage | Fewer providers; suited to short API requests | Conventional Python server is easier to relate to local development |
| Main limitation | Function limits; keep dependencies small | Free server sleeps and can take about a minute to wake |
| Estimated monthly service cost | $0 within free limits | $0 within free limits |

## Frontend

Use Next.js, React, TypeScript, and Tailwind for four small areas: onboarding, recommendations, saved dishes, and preference editing.

React manages interactive controls; Next.js organizes pages and builds the application; TypeScript catches many mistakes before execution; Tailwind handles styling.

The browser collects the craving and location, displays results, and sends feedback to FastAPI. Keep recommendation decisions in the backend so the same rules can eventually serve a mobile interface. V1 targets desktop and laptop screens only.

For location, use **Midtown and Arts & Design District presets** with approximate reference points. The default radius is 3 miles, with 1- and 5-mile choices, applied only to the curated central Carmel catalog and configured coverage. Browser geolocation and address search are unnecessary for V1. Confirm exact preset coordinates in Spec 03. Label area-based distances approximate and link to restaurant locations externally.

## Backend

FastAPI is the application's decision-making layer. Its API is a set of addresses the frontend calls to request recommendations, save preferences, and record feedback.

A recommendation request would:

1. Interpret supported craving terms, including negation such as “not spicy.”
2. Load the user's preferences and eligible nearby dishes.
3. Apply supported hard constraints, including configured coverage. V1 has no dietary filter.
4. Score the remaining dishes using taste, craving, price, distance, and novelty.
5. Return 3–5 dishes with explanations based on their strongest scoring factors.

For example, “spicy chicken” becomes structured criteria for protein and spice. Users should see those interpreted criteria and be able to correct them. A small rules-based parser is adequate for the initial supported vocabulary; it should acknowledge requests it cannot interpret.

Likes and dislikes update bounded preference weights. Saves and clicks contribute less. Store those changes immediately so they affect the next session. This is already a learning recommender; training a machine-learning model is not necessary.

### Option 1: FastAPI on Vercel

Deploy FastAPI as a separate Vercel project alongside the Next.js project, both from one repository. Vercel runs the backend on demand as a *serverless function*: you supply request-handling code without managing a continuously running server.

FastAPI is officially supported, but function limits still apply. Keep model downloads, scraping, and large ML dependencies outside this deployment. [Vercel FastAPI documentation](https://vercel.com/docs/frameworks/backend/fastapi)

### Option 2: FastAPI on Render

Deploy the same FastAPI application to Render as a conventional Python web service. This gives you a familiar server process and more conventional runtime behavior.

However, Render's free service sleeps after 15 idle minutes and takes about a minute to restart. That is a noticeable drawback when someone opens a portfolio demo. [Render free-service documentation](https://render.com/docs/free)

Neither option needs microservices, a job queue, Redis, or a separate recommendation service.

## Database

Use one Supabase PostgreSQL database. PostgreSQL stores related records reliably; Supabase manages the database infrastructure.

Start with these logical tables:

| Data | Purpose |
|---|---|
| Cities and restaurants | Coverage, coordinates, restaurant details and sources |
| Dishes | Restaurant-specific offerings, prices, attributes, provenance and embeddings |
| Profiles | Onboarding answers and learned taste weights |
| Dish feedback | One current Like/Dislike state per user and dish |
| Saved dishes | Independent saved status |
| Recommendation sets and events | Recently shown results and bounded interaction history |

Keep hard constraints separate from learned preferences so feedback cannot silently change eligibility. V1 has no dietary restriction input; a later dietary feature needs its own evidence policy.

**pgvector** adds support for embeddings: lists of numbers representing similarity between dish descriptions. They belong in the same database; a separate vector database is unnecessary.

Generate dish embeddings locally. At request time, compare stored embeddings against liked dishes or an aggregate of them. This allows dish similarity without running an embedding model in the deployed backend. Parsing an arbitrary craving into an embedding would require online inference; the initial rules-based parser avoids that dependency.

For a small catalog, straightforward comparisons are sufficient. Specialized vector indexes and sophisticated geographic indexing can wait until measurements show a need.

## External APIs and data sources

Use this preparation workflow:

**Overpass restaurant import → selected public menus → extraction and manual review → local enrichment → Supabase**

Overpass supplies restaurant metadata where available; menus supply actual dish offerings. Neither source guarantees complete coverage.

Run the workflow manually when preparing or refreshing the demo. Start with selected areas within Carmel and menus that can be reliably extracted. Respect site terms and robots rules, and preserve source URLs, timestamps, and whether attributes were sourced or inferred.

The deployed app reads the stored catalog. This makes recommendations independent of restaurant websites being reachable and avoids relying on shared Overpass servers for every user request. Overpass explicitly discourages using its public instances as an application's live backend. [Overpass usage guidance](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)

A general-purpose menu crawler is unnecessary for V1. A small, reviewed catalog is enough to test whether personalization is useful.

## Authentication

Use Supabase Auth with **one social login provider**. OAuth means the provider handles sign-in and Supabase establishes the app session; the application does not collect that provider's password.

Google sign-in is the selected target. A dedicated Google project without billing and a Supabase Free project have an OAuth web client and enabled Google provider. Setup C published the External Google app after the public homepage, privacy page, and authorized domain were accepted. Supabase's Site URL now points to the public preview. A real sign-in and callback remain for Spec 12. This is separate from Google Maps. [Google integration](https://supabase.com/docs/guides/auth/social-login/auth-google), [Google branding requirements](https://support.google.com/cloud/answer/15549049?hl=en)

Allow the first recommendations using temporary onboarding answers. Ask users to sign in when they want to preserve their profile or feedback, then save those answers to their account without overwriting an existing returning profile. No anonymous account merging is needed. Guest-first timing is an accepted product decision.

Avoid email/password and magic-link authentication initially: public email delivery adds another service to configure, and Supabase's default email service only sends to preauthorized team addresses. [Supabase email restrictions](https://supabase.com/docs/guides/auth/auth-smtp)

## Deployment

Keep frontend, backend, and local data-processing scripts in one repository. They have different runtime responsibilities but can be versioned together. Use one production database and provider-issued URLs.

For the simplest database access path, FastAPI can use Supabase's data API with the signed-in user's token. That lets database **row-level security**, meaning rules controlling which rows each user can access, enforce ownership. Privileged catalog imports use a separate local credential.

The public recommendation flow must work while the local processing machine is offline. Runtime data is stored in Supabase, not on the backend host's local filesystem.

## Major security concerns

- **Identity and ownership:** Validate authentication tokens, derive the user ID from the verified token, and restrict each user to their own profile, feedback, and saves.
- **Secrets:** Keep privileged Supabase credentials and OAuth secrets out of browser code and Git. Public Supabase keys are only appropriate with correctly configured access policies.
- **Untrusted content:** Display menu text as text, validate external links, and restrict the importer to reviewed public sources. Never expose an unrestricted “fetch this URL” endpoint.
- **Abuse and privacy:** Limit request size and frequency, bound interaction retention, and avoid logging tokens or precise location histories.
- **Food information:** Treat inferred ingredients as uncertain and make no allergy-safety claims. Dietary filters are outside V1; a later feature would require an explicit evidence and unknown-data policy.

Because the frontend and API have separate URLs, configure **CORS**, the browser's cross-origin access rules, to allow the intended frontend. CORS complements authentication; it does not replace it.

## Estimated operating costs

For a small, noncommercial demo with hundreds to a few thousand dishes and light traffic:

| Component | Option 1 | Option 2 |
|---|---:|---:|
| Vercel frontend | $0 | $0 |
| FastAPI hosting | $0 on Vercel | $0 on Render |
| Supabase database and authentication | $0 | $0 |
| Overpass and permitted menu collection | $0 API fees | $0 API fees |
| Local embedding generation | $0 service fees | $0 service fees |
| Custom domain | Not needed | Not needed |
| **Expected monthly service bill** | **$0** | **$0** |

These estimates assume existing computer/internet access and staying within free allowances. Local processing still consumes time and electricity.

As checked for the architecture proposal on September 14, 2026, Supabase includes a 500 MB database and 5 GB egress on Free, and pauses inactive free projects after a week. Keep images and raw menu archives out of the database and limit event growth. [Supabase pricing](https://supabase.com/pricing)

Vercel Hobby is for personal, noncommercial use and may suspend features when allowances are exhausted. Render likewise imposes free quotas; its documentation describes suspension instead of bandwidth overage billing when no payment method is attached. Actual no-card account eligibility still needs checking during signup. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Render free limits](https://render.com/docs/free)

Provider pricing, eligibility, and limits must be rechecked before deployment. Do not introduce paid plans or credit-card-required services for core functionality.

## Recommended decision and remaining checks

Choose **Option 1**. Setup C confirmed a small FastAPI health deployment on Vercel Hobby. Recheck function size, limits, and latency as product dependencies are added; keeping data preparation local avoids heavy Python request dependencies.

Choose Option 2 if conventional Python hosting becomes materially easier for the dependencies and its wake-up delay is acceptable.

The first product uncertainty is obtaining enough reviewed central Carmel offerings. The current factual sample has six offerings from two restaurants; the launch target is five restaurants and 25 reviewed offerings, with a 30-day reverification policy. Real sign-in, later API hosting fit, and ranking weights remain open checks in `PROJECT_SPEC.md` and `docs/decisions.md`.
