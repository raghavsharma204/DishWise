"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type HealthState = "checking" | "healthy" | "unavailable";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [health, setHealth] = useState<HealthState>("checking");
  const [attempt, setAttempt] = useState(0);

  const checkHealth = useCallback(async (signal: AbortSignal) => {
    setHealth("checking");
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("Health request failed");
      const body: unknown = await response.json();
      if (
        typeof body !== "object" ||
        body === null ||
        !("status" in body) ||
        body.status !== "ok"
      ) {
        throw new Error("Invalid health response");
      }
      if (!signal.aborted) setHealth("healthy");
    } catch {
      if (!signal.aborted) setHealth("unavailable");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setHealth("unavailable");
      controller.abort();
    }, 3000);
    void checkHealth(controller.signal).finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, checkHealth]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Project preview</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">DishWise</h1>
        <p className="mt-4 text-lg text-slate-600">
          DishWise is being built to suggest dishes from a reviewed restaurant catalog in central Carmel, Indiana. Recommendations and sign-in are not available yet.
        </p>
        <p className="mt-4 text-slate-600">
          This preview checks whether the application API is responding. It does not check the catalog or sign-in service.
        </p>
        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-7 shadow-sm" aria-labelledby="api-heading">
          <h2 id="api-heading" className="text-xl font-semibold">API connection</h2>
          <p role="status" aria-live="polite" className="mt-3 text-slate-700">
            {health === "checking" && "Checking the API…"}
            {health === "healthy" && "The API is responding."}
            {health === "unavailable" && "The API is unavailable. Please try again later."}
          </p>
          <button
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50"
            type="button"
            disabled={health === "checking"}
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry check
          </button>
        </section>
        <footer className="mt-10 text-sm text-slate-600">
          <Link className="underline underline-offset-4 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" href="/privacy">
            Privacy policy
          </Link>
        </footer>
      </div>
    </main>
  );
}
