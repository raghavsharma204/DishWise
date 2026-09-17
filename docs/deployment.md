# Minimal public preview deployment

Verified on 2026-09-17 for the Vercel Hobby `dish-wise` team. The live preview is <https://dishwise-web.vercel.app/> and the health endpoint is <https://dishwise-api.vercel.app/health>. The projects currently use authenticated CLI uploads, not Git integration. No product or database routes are deployed.

## Reproduce

Use the Vercel CLI while signed in to the approved Hobby account. The CLI version used for this check was 59.20.0 via `npm exec --yes --package=vercel -- vercel`. Keep `.vercel/` ignored. Set project roots to `backend/` and `frontend/`; use the FastAPI framework preset for `dishwise-api` and Next.js for `dishwise-web`. An initial API deployment with Vercel's “Other” preset returned 404; changing it to FastAPI and redeploying fixed routing.

1. From `backend/`, deploy `dishwise-api` with the FastAPI preset. `backend/index.py` exports the app. Check `/health` and confirm the API docs paths return 404.
2. Set production `NEXT_PUBLIC_API_BASE_URL=https://dishwise-api.vercel.app` on `dishwise-web`, then deploy from `frontend/`. This is a public origin, not a secret.
3. Set production `FRONTEND_ORIGIN=https://dishwise-web.vercel.app` on `dishwise-api` and redeploy it. Use the exact origin without a path or trailing slash. Do not use wildcard CORS.
4. Smoke check the public homepage, privacy page, browser health state, API response, and CORS. The specific results are in [hosting_check.md](hosting_check.md). Redeploy after each environment change because Vercel variables are captured at deployment.

The public privacy and homepage URLs were saved in Google Auth Platform Branding and the External Audience was published. Supabase Auth Site URL is `https://dishwise-web.vercel.app`; no additional redirect URL or frontend callback route has been added. Configure and test those together in Spec 12. Do not claim working sign-in from the current preview.

Provider-managed environments hold configuration. Do not place OAuth client secrets, Supabase service-role credentials, tokens, or dashboard exports in Git or `NEXT_PUBLIC_` variables. `frontend/.env.example` and root `.env.example` document local origins. The current health route does not require Supabase credentials.

To recover from a faulty preview deployment, use the Vercel dashboard to roll back the affected project to its previous deployment and repeat the health/browser smoke checks. There is no database state to roll back in Setup C. Recheck current provider limits and free/no-card eligibility before any later public product release.
