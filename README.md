# DishWise preview and local setup

The [public preview](https://dishwise-web.vercel.app/) has a privacy policy and an API connection check. It does not contain dishes, recommendations, or sign-in. The API health response reports only that FastAPI is serving requests. Setup C hosting and Google OAuth publication checks passed; see [hosting evidence](docs/hosting_check.md) and the [deployment procedure](docs/deployment.md). A real sign-in remains Spec 12.

## Requirements

- Node.js and npm (verified with Node 26.7.0 and npm 11.19.0)
- [uv](https://docs.astral.sh/uv/) (verified with 0.12.3; it installs pinned Python 3.12 as needed)
- A Docker-compatible container runtime for the separate disposable database check (verified with Colima on macOS)

## Install

Run from the repository root unless a step says otherwise:

```sh
npm ci
cd frontend && npm ci
cd ../backend && uv sync --locked
```

The root npm package installs the local Supabase CLI. Frontend and backend dependencies have separate lockfiles. `frontend/.env.example` shows the browser-visible API address; the checked-in default already works for the local ports below. To override it, copy that file to `frontend/.env.local` and edit the copy. `FRONTEND_ORIGIN` defaults to `http://localhost:3000` in FastAPI and may be set as a backend environment variable. Do not place credentials in a `NEXT_PUBLIC_` variable.

## Run the local page

In one terminal:

```sh
cd backend
uv run --locked uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another:

```sh
cd frontend
npm run dev
```

Open `http://localhost:3000`. It checks `http://127.0.0.1:8000/health` and links to `/privacy`. Stop the backend to see the unavailable state; restart it and use **Retry check** to recover. `GET /health` returns `{"status":"ok"}` and does not call the database. The backend permits cross-origin browser reads from `http://localhost:3000` by default. The preview does not expose the FastAPI documentation routes.

## Verify code

```sh
cd backend && uv run --locked pytest
cd ../frontend && npm run typecheck && npm run build
```

## Disposable local database

This check uses only the local Supabase CLI project in `supabase/config.toml`. It does not connect or link to the hosted Supabase project. Never use a hosted database for destructive tests. Spec 01 adds a catalog migration and a separate synthetic fixture; the basic `SELECT 1` check does not require seeding it.

Start a Docker-compatible runtime. On this macOS machine, run `colima start` if `colima status` says it is stopped. Then, from the repository root:

```sh
npm run db:start
npm run db:status
docker exec supabase_db_dish-rec psql -U postgres -d postgres -Atqc 'select 1'
npm run db:stop
```

The query must print `1`. `db:status` must show a local DB URL on `127.0.0.1:54322` and no linked project. `db:start` starts only the local PostgreSQL service; the other Supabase services remain stopped. The database check is separate from the web page: `/health` still responds after `db:stop`.

Do not run `supabase link`, `db push`, or `db reset --linked` as part of this workflow. Local database data persists across ordinary stop/start; future destructive tests must explicitly target a disposable local instance.

## Spec 01 local dish cards

This is a development preview of the six previously reviewed Carmel names and prices from two restaurants. It is not a recommendation flow or a launch catalog. Synthetic records remain in tests. The page is available only in local development; the public preview still has only the homepage, privacy page, and API health response.

Start the disposable database and verify that `npm run db:status` reports `linked_project:null` and `127.0.0.1:54322`. The following reset destroys **only that local database** and applies the checked-in migration:

```sh
npm run db:start
./node_modules/.bin/supabase db reset --local --no-seed
cd backend
uv run --locked python scripts/configure_local_reader.py
set -a
. ./.env.local
set +a
uv run --locked python scripts/load_reviewed_sample.py
```

The reader setup creates ignored `backend/.env.local` with a random read-only password and local test URL. The sample loader replaces the local catalog with only the six factual offerings in `data/samples/carmel_offerings.json`; it does not fetch websites. Josephine's coordinates and the central Carmel extent remain unknown in storage. Both the loader and integration tests change catalog tables, so run them only against the disposable local instance. Never use these commands with a hosted database.

Start the API in one terminal from `backend/`:

```sh
set -a
. ./.env.local
set +a
uv run --locked uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal from `frontend/`:

```sh
ENABLE_DEV_CATALOG=1 npm run dev
```

Open `http://localhost:3000/dev/dishes`. The page loads at most 50 stored offerings through `GET /api/dev/dishes`, shows known facts and unknowns, and groups price variants under one dish. A missing API or database shows a retryable error. No menu site or local enrichment process is contacted at request time. The route is absent from the deployed API and the production frontend returns 404.

Run the focused checks:

```sh
cd backend
set -a
. ./.env.local
set +a
uv run --locked pytest
cd ../frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The integration tests reload the synthetic catalog and require the local database. Without `backend/.env.local`, they skip while the unit tests run. After running the backend tests, rerun `uv run --locked python scripts/load_reviewed_sample.py` from `backend/` to restore the reviewed sample for viewing. Playwright runs a local Next.js server and uses mocked API responses for deterministic card, empty, error, and unsafe-link checks. The production build uses Next.js's supported webpack path because Turbopack's CSS worker failed to bind a local port in this development environment.
