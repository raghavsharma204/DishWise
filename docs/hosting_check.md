# Setup C hosting and public OAuth check

Status: Public preview and OAuth publication verified on 2026-09-17. Sign-in, catalog, and product release remain unverified.

## Provider and account checks

| Check | Primary source and observed result |
|---|---|
| Hosting eligibility | [Vercel Hobby](https://vercel.com/docs/plans/hobby) was selected for the `dish-wise` team using GitHub login. Signup, project creation, and deployment requested no card or paid plan. Hobby usage allowances still apply. |
| API runtime | [Vercel FastAPI](https://vercel.com/docs/frameworks/backend/fastapi) and [Python runtime](https://vercel.com/docs/functions/runtimes/python) support the deployed app. The FastAPI guide describes a 500 MB bundle ceiling; a [June 2026 announcement](https://vercel.com/changelog/vercel-functions-can-now-be-up-to-5-gb-in-package-size) describes larger Fluid compute packages. The actual deployment is 11,451,716 bytes (10.9 MiB), below either figure. |
| Project layout | Two Vercel projects deploy the repository's separate `backend/` and `frontend/` roots, consistent with [monorepo guidance](https://vercel.com/docs/monorepos). Deployment uses authenticated CLI upload; Git integration is not configured. |
| Database/auth plan | The `dish-rec-demo` project was Healthy in a Supabase Free organization. [Free plan limits](https://supabase.com/pricing) and [inactivity pausing](https://supabase.com/docs/guides/platform/free-project-pausing) were reviewed. Setup C did not run a migration or connect health to the database. |
| Google publication | [Branding](https://support.google.com/cloud/answer/15549049?hl=en) accepted DishWise, the public homepage and privacy URLs, and `dishwise-web.vercel.app` as an authorized domain. The External Audience changed from Testing to **In production** without a billing prompt. This is the observed result for the current configuration; [verification requirements](https://support.google.com/cloud/answer/13464321?hl=en) may change with future scopes or branding. No real sign-in was attempted. |
| Fallback | [Render Free](https://render.com/docs/free) was reviewed. It was not needed because the Vercel API deployed successfully. |

Sources and account screens were checked on 2026-09-17. Recheck limits, eligibility, and no-card status before public product release.

## Live preview evidence

- Frontend: <https://dishwise-web.vercel.app/>; privacy: <https://dishwise-web.vercel.app/privacy>. Both returned HTTP 200. The public browser rendered the homepage, showed “The API is responding,” followed the privacy link, and had no horizontal overflow at 1280×800 or 1440×900. The privacy page names Raghav Sharma using the public GitHub profile; that profile had no public email, so it links to repository issues for contact.
- API: <https://dishwise-api.vercel.app/health> returned HTTP 200 with `{"status":"ok"}`. `/docs` returned 404. The app also disables `/redoc` and `/openapi.json`; a focused backend test covers these routes. No catalog or sign-in endpoint is deployed.
- The browser's production API origin is `https://dishwise-api.vercel.app`. The API's `FRONTEND_ORIGIN` is exactly `https://dishwise-web.vercel.app`. A health request with that Origin returned `Access-Control-Allow-Origin: https://dishwise-web.vercel.app`; a request with another Origin had no allow-origin header.
- The production backend deployment `dpl_2i7wk2CWZNj8NrB2wprxo83WYdEZ` uses one Python 3.12 function with 11,451,716 deployed bytes, 2 GB memory, and a 300-second function limit. Its pre-build upload was 23,733 bytes. The final frontend deployment was `dpl_DjAn5rEViSUGmgeMgYLcGd4C1Tym`.
- The first observed API health request after a fresh redeploy took 0.247421 s total (0.247281 s to first byte); a subsequent request took 0.169486 s total (0.169338 s to first byte), measured from this Mac with `curl`. The first measurement is a **post-deploy first request**, not a proven cold start; a true cold-start latency measurement remains for release verification.
- Local `npm run typecheck`, `npm run build`, and `uv run --locked pytest` passed on 2026-09-17 (3 backend tests). Local browser checks observed healthy, stopped-backend, timeout, and retry recovery states. The hosted API was not intentionally stopped to reproduce failure; those UI states were verified locally with the same code. Keyboard navigation and visible focus were reviewed locally.
- Supabase Auth Site URL was saved as `https://dishwise-web.vercel.app` and reloaded with Save disabled, confirming persistence. Redirect URLs remain empty because the callback route and real session flow belong to Spec 12. Google's existing web client's Supabase callback is account-level setup only.

Google production publication establishes the public no-card prerequisite. It does not prove that Supabase callback handling, session persistence, or user isolation work. Those remain Spec 12 and release checks. The five-restaurant/25-offering catalog gate remains unmet.
