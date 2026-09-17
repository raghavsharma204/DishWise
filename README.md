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

This check uses only the local Supabase CLI project in `supabase/config.toml`. It does not connect or link to the hosted Supabase project. Never use a hosted database for destructive tests. No application schema or seed is present yet.

Start a Docker-compatible runtime. On this macOS machine, run `colima start` if `colima status` says it is stopped. Then, from the repository root:

```sh
npm run db:start
npm run db:status
docker exec supabase_db_dish-rec psql -U postgres -d postgres -Atqc 'select 1'
npm run db:stop
```

The query must print `1`. `db:status` must show a local DB URL on `127.0.0.1:54322` and no linked project. `db:start` starts only the local PostgreSQL service; the other Supabase services remain stopped. The database check is separate from the web page: `/health` still responds after `db:stop`.

Do not run `supabase link`, `db push`, or `db reset --linked` as part of this workflow. Local database data persists across ordinary stop/start; future destructive tests must explicitly target a disposable local instance.
