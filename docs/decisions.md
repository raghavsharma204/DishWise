# Setup A decision record

Recorded 2026-09-16 by the project team from the founder's choices and stated planning defaults. These decisions implement the agreed Setup A plan. Evidence and remaining gates are separate: a decision does not establish that the launch catalog or hosting is ready.

## Product and catalog

| Decision | Accepted choice | Reason / remaining validation |
|---|---|---|
| V1 coverage | Curated restaurants in central Carmel's Midtown and Arts & Design District only. | The [City of Carmel Midtown page](https://www.carmel.in.gov/440/Midtown-Plaza) places Midtown between the Arts & Design District and City Center. The [district page](https://www.carmel.in.gov/513/Arts-Design-District) confirms the other named area. Select actual restaurants by verified address in these districts; do not imply citywide coverage. |
| Launch catalog gate | At least five reviewed restaurants and 25 distinct reviewed dish offerings before public release. | The three-restaurant Setup A audit is a feasibility sample, not launch readiness. Record any shortfall rather than fabricate entries. |
| Manual review | Structured manual entry is allowed only from reviewed public sources with permitted access and reuse. | The initial sample uses a few dish names and prices from two restaurant-hosted menus, not expressive descriptions or wholesale menu copies. Fork's third-party ordering source remains on hold. Do not use a universal crawler or unrestricted URL fetching. |
| Price variants | One offering identity with an array of explicitly sourced size/choice variants; unknown base price remains null. | Avoid presenting variants as duplicate recommendations or inventing a single price. |
| Freshness | Reverify every 30 days. Withhold unverified older offerings from recommendations; retain records and user references. | A fetch failure does not prove withdrawal. Only verified disappearance or a direct source notice establishes withdrawal. |
| Dietary scope | No dietary exclusion filters in V1, by explicit product choice. | This changes the prior product requirement. Food attributes may be displayed only with provenance, and no allergy-safety claim is made. Adding dietary filters later requires a new evidence and unknown-data policy. |
| Price behavior | Price is a ranking preference, not a hard cap. | Unknown prices stay unknown and do not become an assumed cheap or expensive value. |

## First experience

| Decision | Accepted choice | Reason / remaining validation |
|---|---|---|
| Location | Manual selector with two named presets: Midtown (39.9757552, -86.1289362) and Arts & Design District (39.9786375, -86.1259628). | These are the audited OSM positions of Fork + Ale House and Woody's respectively, selected as approximate area reference points rather than geographic district centers. Recheck them in Spec 03 before shipping. No address lookup service is needed. |
| Radius | 3 miles by default; selectable 1, 3, or 5 miles. | Search only the curated central Carmel catalog, intersected with supported Carmel coverage. A larger radius never implies catalog coverage beyond it. |
| Geolocation | Not required for V1; manual presets always work. | Denied or unavailable browser location cannot block recommendations. Outside-coverage coordinates, if accepted in a later version, show the supported-area selector. |
| Identity | Allow temporary onboarding and first results without login. Prompt for sign-in when the user wants to preserve profile or feedback. | Do not create an anonymous account or overwrite an existing returning profile. |
| Login method | Google via Supabase Auth is the target. | Dedicated accounts and the OAuth web client were configured without a card or billing account. The Supabase Free project has the Google provider enabled. Production publication and a real sign-in smoke test require a deployed app homepage, privacy policy, and final URLs; they remain gates before public auth release. [Supabase Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google), [Google branding requirements](https://support.google.com/cloud/answer/15549049?hl=en) |

## Craving behavior

Persistent profile answers remain separate from the current craving. Supported terms affect ranking only; they do not exclude a dish. Parsed criteria must be visible and editable before requesting recommendations. Unknown data cannot produce a positive match explanation.

| Input | Interpretation and user-visible behavior |
|---|---|
| “spicy and filling” | Two soft preferences: sourced/reviewed spice and filling cues. Show both as editable criteria. |
| “chicken” | Soft chicken preference, matched only to a sourced/reviewed name or attribute. |
| “surprise me” | Discovery/novelty preference among eligible stored offerings; do not claim knowledge of the user's tastes when none exists. |
| “not spicy” | Explicit negative spice preference; demote known spicy offerings, leave unknown spice neutral, and show the negation for correction. |
| Unsupported text | State that the request was not understood and ask for correction; do not silently rank as if it was understood. |
| Conflict with persistent preference | The current craving can outweigh a soft long-term preference for this request but never edits the stored profile. Show the resolved interpretation. |

## Success measures and local processing

- Recruit five pilot participants after a usable catalog and flow exist. Success target: at least three identify one recommended dish they would consider trying. This is a target, not observed performance.
- Warm-response target: p95 at or below three seconds for the recommendation API, measured separately from cold starts. Record environment, request count, catalog size, and measured results during release validation.
- This machine is a MacBook Air with Apple M2 and 16 GB memory, observed locally on 2026-09-16. Model choice and a real enrichment smoke test belong to Spec 29. No local machine is needed at request time.
- No calendar completion date was agreed. Set one before pilot recruitment; do not present an invented date as a commitment.

## Source audit outcome and gate

The three audited candidates are in [the source audit](../data/source_audit.csv). OSM metadata is available for Fork + Ale House and Woody's; a targeted Nominatim name/address lookup returned no Josephine result. [OpenStreetMap data is ODbL licensed](https://www.openstreetmap.org/copyright); attribute any later use of its data. The Woody's and Josephine menus are public and their robots rules allow access. The reviewed pages revealed no restriction on manually recording a few factual names and prices; the [U.S. Copyright Office explains that facts and short names are not protected expression](https://www.copyright.gov/help/faq/faq-general.html). This supports only the narrow factual sample in `data/samples/carmel_offerings.json`, with source links and verification dates. No expressive descriptions, full menu compilation, or images were copied. The Josephine terms page is generic guidance rather than a reuse license; if substantive site terms are later found, review them before using more data. Fork's linked third-party ordering host has not cleared access/reuse review and contributes no sample offerings. The three-restaurant audit and six-offering sample do not meet the five-restaurant/25-offering public launch gate.

### Account-level auth check and remaining public gate

On 2026-09-16, the project owner authorized a dedicated Google Cloud project (`dish-recommendation-app-508822`) and Supabase Free organization/project (`dish-rec-demo`, project reference `abehzlrtdeelorteywrb`). The Google project was created with **no linked billing account**. Its Google Auth Platform accepted an External audience and created a Web OAuth client with the Supabase callback URL. Supabase shows the organization on the Free plan, the project healthy, and Google sign-in enabled with that client. The first client secret was replaced and disabled; the active replacement was supplied to Supabase and was never written to this repository. No card, paid plan, or billing link was requested during these account-level steps.

**Setup A scope decision:** This account-level check settled whether the selected Google/Supabase path could be configured without a card. At that time Google's Audience was in Testing pending Branding links. Setup C's later outcome is recorded below. [Google branding requirements](https://support.google.com/cloud/answer/15549049?hl=en) and [Supabase's Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google) inform the remaining callback work. No OAuth secret or database password is recorded here.

### Setup C hosting and publication decision — 2026-09-17

Use two Vercel Hobby projects on provider-issued URLs for the minimal public preview: `dishwise-web` for Next.js and `dishwise-api` for FastAPI. The backend's actual 10.9 MiB deployment and public health request worked within the observed no-card Hobby path, so the Render fallback was not needed. Deploying the backend as Vercel's FastAPI framework corrected the 404 produced by the initial “Other” preset. Keep heavyweight ingestion and enrichment local. This result proves only the small health deployment; product API fit must be rechecked as dependencies are added. See [measured hosting evidence](hosting_check.md).

The project owner approved Google Branding and External publication. Google accepted the public `dishwise-web.vercel.app` homepage, privacy page, and authorized domain, and its Audience now shows **In production**. Supabase Auth Site URL was set to `https://dishwise-web.vercel.app` with the owner's approval. This establishes a public no-card publication path for the current configuration. No sign-in UI, redirect allowlist, callback handling, or session test exists yet; Spec 12 owns those and acceptance criterion 15 remains incomplete. Recheck any future verification requirement if scopes or branding change.

## Spec 01 local catalog boundary — 2026-09-17

The development card view reads the disposable local PostgreSQL catalog through FastAPI with a dedicated read-only `catalog_reader` role, RLS read policies, and an allowlisted response. Its password is generated into an ignored local environment file. The synthetic fixture includes provisional GeoJSON coverage polygons solely to exercise the configurable schema; Spec 03 still owns verification of real Carmel coverage and preset coordinates. The local `/dev/dishes` view and `/api/dev/dishes` route are unavailable on the deployed preview. This decision does not establish a public database access pattern or catalog release readiness. The frontend production build uses Next.js's supported webpack path after Turbopack's CSS worker hit a local port-bind failure.

**Local preview correction (2026-09-17):** The owner preferred the six reviewed Carmel offering names and prices over the four synthetic fixture dishes in the visible local preview. A fixed local-only loader now copies exactly the permitted factual sample from `data/samples/carmel_offerings.json`; synthetic fixtures remain for deterministic tests. Josephine has no verified coordinates in the audit, and the sample's central Carmel boundary has not been verified, so both remain null until location work. The Josephine row in `data/source_audit.csv` was corrected to align its existing values with the CSV header. Cards emphasize the known facts and group unknown details compactly. This change does not expand the reviewed sample or satisfy the public catalog gate.

## Manual walkthroughs

- **Cold start:** guest selects a preset, answers no more than five taste questions, enters a supported craving, corrects parsed criteria, and sees only stored offerings. No explanation refers to prior behavior.
- **No dietary filter:** onboarding contains no dietary question or exclusion control. A food card cannot imply allergy safety from a label, missing ingredient, or model inference.
- **Conflicting craving:** current “not spicy” demotes known spicy items for this request without changing saved spice preference; the visible criterion can be corrected.
- **Denied location permission:** the manual preset remains available and sufficient.
- **Outside coverage:** show the supported central Carmel presets; never fabricate distance or results outside the configured area.
- **Sparse catalog:** show zero to two eligible offerings as available with an honest coverage message; do not fill to three with invented dishes.

These are documented product scenarios, not executed product UI tests. Setup B provides only a local health-check page.
