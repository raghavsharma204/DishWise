# Dish Recommendation App — Project Specification

Status: V1 scope with Setup A complete and decisions recorded in `docs/decisions.md`. Setup B adds a local frontend, FastAPI health check, and disposable database workflow; no product feature is implemented. A six-offering factual sample exists, and dedicated Google/Supabase account-level OAuth setup succeeded without a card. Public hosting, OAuth publication, and sign-in remain unverified.

## Problem statement

Students and young adults who regularly eat out struggle to decide which specific dish to eat and where to get it. Their existing workflow involves browsing maps, reviews, social media, and menus, with little help connecting individual tastes to particular dishes.

The app will recommend 3–5 dishes at nearby Carmel, Indiana restaurants using a user's current craving, evolving taste profile, distance, and price. Short explanations will help users understand each recommendation. The initial product is a publicly accessible desktop web portfolio/demo, built and operated without paid services or credit-card requirements for core functionality.

## Target users

- Students and young adults who regularly eat at restaurants in Carmel, Indiana.
- People who are unsure what to eat or want to discover something beyond their familiar choices.
- Returning users whose explicit feedback can improve recommendations across sessions.

Carmel, Indiana is the launch city, not a promise of comprehensive restaurant coverage. V1 curates restaurants in central Carmel's Midtown and Arts & Design District, with a release gate of at least five reviewed restaurants and 25 distinct reviewed dish offerings. Cities and geographic coverage must be represented as data/configuration so additional cities do not require changes to the recommendation algorithm.

## User stories

1. As a new user, I can answer 3–5 quick preference questions and enter a craving so I receive useful first recommendations without a lengthy questionnaire.
2. As a diner, I can provide or select a location and describe what I want in ordinary language so I can find relevant nearby dishes.
3. As an undecided diner, I can enter “surprise me” and receive eligible dishes that balance my preferences with discovery.
4. As a user, I can see each dish's restaurant, available price, basic food attributes, and explanation so I can decide whether to try it.
5. As a user, I can like or dislike a dish and have subsequent recommendations reflect that feedback.
6. As a returning user, I can recover my preferences and feedback across sessions through Supabase authentication.
7. As a user, I can save, revisit, and unsave dishes so promising options remain easy to find.
8. As a user, I can open restaurant information and its location so I know where to get a recommended dish.
9. As a user, I can request another set of recommendations when the current options do not appeal to me.

## MVP features

### Onboarding and identity

- Supabase authentication targeted to Google OAuth. Dedicated account-level setup succeeded without a card; public publication and sign-in remain release gates after a public app homepage, privacy policy, and final URLs exist. Guests can see first results before signing in; sign-in preserves preferences and feedback.
- At most five quick questions covering cuisine preferences, spice tolerance, price sensitivity, and adventurousness. V1 has no dietary exclusion question or filter.
- Store the onboarding profile in the database and allow basic preference edits.
- Persist identity, profile, feedback, saves, and relevant recommendation interactions across sessions after sign-in. First results are available to guests using temporary answers.

### Craving and location input

- Accept natural-language cravings, including “something spicy and filling,” “I want chicken,” and “surprise me.”
- Use a bounded vocabulary, rules, and/or lightweight open-source NLP to extract supported preferences. Do not require a hosted generative model.
- Display interpreted criteria so users can correct misunderstandings. Unsupported requests should prompt refinement rather than imply full understanding.
- Support manual selection of Midtown or Arts & Design District as approximate starting areas. V1 does not require browser geolocation.
- Limit recommendations to the curated central Carmel catalog and configured coverage. Use a 3-mile default radius with 1- and 5-mile options; a larger radius does not imply wider catalog coverage.
- Distinguish persistent preferences from the current request: a single craving must not overwrite the user's long-term profile.

### Recommendations and explanations

- Return 3–5 distinct eligible dish offerings when sufficient data exists.
- Filter supported hard constraints, including location coverage, before ranking; never relax them to fill the result list. V1 has no dietary exclusions.
- Rank with transparent weighted features: craving match, cuisine, spice, price, distance, novelty, and dish similarity.
- Use stored dish embeddings for similarity where useful; feature scoring remains a valid fallback when embeddings are unavailable.
- Derive explanations from actual ranking factors and available dish data. Do not show percentage matches or probability claims.
- Each result shows dish name, restaurant, price when known, basic available attributes, explanation, and restaurant/location link.
- Represent missing price or attributes as unknown. Do not fabricate menu facts, availability, or opening status.
- “Another set” deprioritizes already shown dishes when alternatives exist. If the catalog is exhausted, explain this instead of implying every result is new.

### Feedback and saved dishes

- Like and Dislike are mutually exclusive, reversible feedback states for a dish offering. Save is an independent toggle.
- Persist feedback and adjust subsequent ranking; changes should not require model retraining.
- Give explicit feedback more influence than saves or clicks. Repeated clicks must not accumulate unlimited preference weight.
- Inferred taste updates cannot create or change hard constraints. V1 does not collect dietary restrictions.
- Record only a small defined event set: recommendation impressions, dish/restaurant opens, likes, dislikes, saves/unsaves, and requests for another set.
- Provide a simple saved-dishes view. A user-facing recommendation history page is not required.
- Learning rules, weights, and the effect of dislikes on similar dishes require tuning; do not claim real-world recommendation quality before evaluation.

## Required data

### Catalog

- City/coverage record: identifier, name, and configured geographic extent.
- Restaurant: stable internal ID, OSM source ID, city, name, coordinates, available address, cuisine tags, website/menu URL, source, and last retrieval time.
- Dish offering: stable ID tied to a restaurant, menu name, available description, nullable price and currency, source URL, last verification time, and sourced price variants kept under one offering identity.
- Dish attributes: available cuisine, ingredients, spice, creaminess, other flavor/texture tags, and dietary information. Preserve whether each attribute is explicitly sourced, manually reviewed, or inferred; allow unknown values.
- Embedding: vector, model identifier/version, and generation time so vectors can be regenerated consistently.
- Ingestion metadata: source access decision, extraction/review status, and failures; retain only source content needed for the demo.

### User and recommendation records

- Supabase user identity; explicit onboarding preferences and derived taste weights.
- Current feedback states and saved dish IDs associated with each user.
- Bounded interaction records and recommendation sets sufficient to update preferences and avoid immediate repetition.
- Avoid retaining precise location history when the active location is sufficient.

### Acquisition and enrichment

- Use OpenStreetMap/Overpass for restaurant discovery and available location, cuisine, and website/menu references. Menu URL completeness is unverified and must be audited.
- Import and cache a bounded Carmel catalog into PostgreSQL. Recommendation requests query the database rather than public Overpass servers.
- Extract names, descriptions, and prices only from selected public menu sources whose access and reuse are permitted under the applicable site terms and robots rules. Do not bypass access controls.
- Use a small supported set of menu formats initially. Failed or unsupported extraction can be reviewed and entered manually from permitted sources.
- Run extraction, local NLP enrichment, and Sentence Transformers embedding generation as operator-run batch work on existing local hardware. Hosted recommendation requests must not depend on that machine being online.
- NLP-derived ingredients and dietary labels are uncertain. Do not interpret inferred labels or missing ingredients as verified allergy safety. Dietary filters are outside V1; adding them later requires a separate evidence and unknown-data policy.
- Preserve source attribution and last-checked information. Data freshness is bounded by imports; live menus, inventory, and exact current prices are not promised.

## Technical constraints

- Frontend: Next.js, React, TypeScript, and Tailwind CSS.
- Backend: FastAPI and Python.
- Persistence: Supabase free-tier PostgreSQL, pgvector, and authentication.
- NLP/embeddings: free open-source/local tools such as Sentence Transformers; no OpenAI, paid inference, Google Maps, or Yelp dependency.
- Desktop/laptop web only. Mobile responsiveness and native apps are explicitly deferred; keep API and business logic independent from desktop presentation.
- Separate catalog ingestion, ranking, and presentation so cities and data sources can be added without rewriting the recommender.
- Keep expensive model dependencies out of the deployed API unless a free-hosting feasibility check proves they fit. Online craving parsing may use rules while dish embeddings are precomputed.
- Stay within free quotas and use no credit-card-required service for core features. “Free” means no new service or hardware purchases; local preprocessing assumes access to suitable existing hardware.
- Basic safeguards: authenticated access to private user records, ownership checks/RLS, server-side token validation, input validation, bounded requests, environment variables for secrets, and no privileged credentials in browser bundles.

## Deployment requirements

- One publicly accessible deployment on provider-issued URL(s), for portfolio/demo use.
- Vercel Hobby is the preferred frontend host. FastAPI hosting is provisional: evaluate a lightweight Vercel Python deployment first, or another verified free/no-card host if needed.
- Supabase hosts the database and authentication on its free tier.
- No custom domain, separate staging environment, advanced analytics, monitoring platform, or enterprise availability target.
- Cold starts, free-tier quotas, and manual recovery from service pausing are acceptable demo limitations; failures should produce useful messages.
- The deployed recommendation flow must work from the stored catalog without live scraping, Overpass calls, or a local model server.
- Verify current provider eligibility, quotas, and no-card signup before deployment. Do not silently upgrade to paid plans.

## Non-goals and V1 scope challenges

- Ordering, delivery, reservations, reviews, complex ratings, social features, friends/follows, food diaries, and imported order history.
- Mobile layouts, native apps, weather/time/mood integrations, and location tracking history.
- A full taste graph, collaborative filtering, continuous model training, or a conversational LLM assistant.
- Match percentages and calibrated probability estimates.
- Comprehensive Carmel coverage, automatic ingestion from arbitrary websites, OCR for every menu format, continuous scraping, and an ingestion administration UI.
- Dietary exclusion filters, live stock/open-now guarantees, verified nutrition, and allergy-safety guarantees.
- A visual map is not necessary for V1; basic restaurant details and an external location link satisfy the stated action.

Persistent identity, saves, and feedback remain in scope because they support the user's explicit requirement to learn across sessions. The catalog is curated and batch-imported rather than built by a general-purpose menu crawler. This preserves the core personalization experiment while keeping the free hosting requirement practical. The accepted central Carmel area and release minimum are recorded in `docs/decisions.md`.

## Acceptance criteria

1. A new user completes at most five onboarding question screens and submits a supported craving and Carmel location to obtain recommendations.
2. Where at least five eligible offerings exist, a request returns 3–5 distinct offerings. With fewer than three, show the available eligible results and a clear coverage/constraint message; never invent dishes.
3. Every result resolves to a stored restaurant and menu source and includes the required card fields. Unknown prices and attributes remain visibly unknown.
4. Controlled examples for spicy/filling, chicken, and surprise-me input produce the intended structured criteria. Unsupported text has an explicit refinement path.
5. V1 presents no dietary exclusion controls or allergy-safety claims. Missing and inferred food attributes remain visibly uncertain; supported location constraints are applied before scoring.
6. With other inputs fixed in a controlled catalog, a like increases the relevant preference contribution and a dislike decreases it on the next request. Saves/clicks have weaker bounded effects and cannot override hard constraints.
7. After signing out and signing back into the same account, onboarding preferences, feedback, and saved dishes are restored. Users cannot read or change another user's private records.
8. Like/Dislike changes do not create contradictory active feedback; save/unsave and repeated requests are idempotent where applicable.
9. Requesting another set changes at least one result when eligible unseen alternatives exist; exhaustion is explained when it does not.
10. Explanations agree with stored attributes and ranking factors. A cold-start explanation does not invent prior likes.
11. Users can reopen their saved dishes and access basic restaurant information and location links.
12. Outside-coverage locations and denied geolocation have useful fallback states. Distance calculations and filtering behave correctly on known test coordinates.
13. With Overpass and menu sources unavailable, the deployed application still recommends from the imported catalog. Missing embeddings do not break the feature-scoring baseline.
14. Core flows are usable at representative laptop/desktop viewport sizes (proposed: 1280×800 and 1440×900), including keyboard access and readable loading/error states.
15. A public demo can complete onboarding, recommendation, feedback, and return-session flows using only verified free/no-card services. Secrets and private user data are protected as specified.
16. Adding a second city fixture through configuration and catalog data requires no change to ranking logic; public launch coverage remains Carmel, Indiana.

These criteria establish functional behavior. The release target is five reviewed restaurants and 25 offerings; the pilot target is at least three of five participants identifying a dish they would consider trying. The warm recommendation API target is p95 at or below three seconds, with cold starts reported separately. These are targets, not observed results.

## Unresolved questions

1. Can additional reviewed central Carmel sources meet the five-restaurant/25-offering public release gate? The current permitted factual sample has six offerings from two restaurants; Fork's third-party menu remains on hold.
2. Can the external Google OAuth app be published for the public demo with a compliant no-cost homepage/domain and privacy policy, without billing? Account-level configuration succeeded without a card, but production publication and sign-in are untested. If they fail, record a new provider or scope decision before public auth release.
3. What existing hardware is available for local enrichment, and which embedding model fits it?
4. Does lightweight FastAPI fit the selected host's current free limits? Confirm with a deployment feasibility check before committing hosting configuration.
5. Confirm exact preset coordinates and configured central Carmel coverage in Spec 03 against reviewed geographic evidence. Manual presets and 1/3/5-mile radii are accepted.
6. Dietary filters are deferred from V1. What evidence and unknown-data policy would a later dietary-filter feature require?
7. Price is a ranking preference only in V1; whether a future hard cap is useful remains a later decision.
8. What initial weights apply to likes, dislikes, saves, clicks, novelty, and distance? Are dislikes treated as persistent exclusion of the exact offering or only a ranking penalty?
9. Recheck reviewed offerings every 30 days and withhold older ones until verified. The exact operator schedule and source-specific exceptions will be confirmed during ingestion work.
10. The five-person pilot and p95 warm-response target are accepted. A calendar completion date remains unset until pilot recruitment.

## Feasibility references

Checked during specification drafting on September 13, 2026. Provider terms and limits must be rechecked before implementation/deployment.

- [Overpass public-instance guidance](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html) discourages treating shared instances as an application's live backend. This motivates bounded imports and serving recommendations from PostgreSQL.
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python) supports FastAPI but has deployment bundle limits. [Function limits](https://vercel.com/docs/functions/limitations) and [Hobby plan rules](https://vercel.com/docs/plans/hobby) make runtime/model feasibility a required check rather than an assumed guarantee.
- [Supabase pricing](https://supabase.com/pricing) and [free-project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) describe free-tier constraints and inactivity pausing; uninterrupted demo availability is not guaranteed.
- [Supabase email delivery documentation](https://supabase.com/docs/guides/auth/auth-smtp) states that its default SMTP restricts delivery to authorized team addresses. Public email-based signup cannot assume that default service will work; choose an appropriate no-cost auth flow or verify a free email setup.
