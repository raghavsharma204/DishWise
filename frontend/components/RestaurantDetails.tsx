"use client";

import { useEffect, useId, useState } from "react";
import { parseRestaurantDetails, RestaurantDetails as RestaurantDetailsData } from "@/lib/dishes";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type State = { kind: "closed" } | { kind: "loading" } | { kind: "ready"; details: RestaurantDetailsData } | { kind: "error" };

function displayDate(value: string | null): string {
  if (!value || Number.isNaN(Date.parse(value))) return "unknown";
  return new Date(value).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" });
}

export default function RestaurantDetails({ restaurantId }: { restaurantId: string }) {
  const [state, setState] = useState<State>({ kind: "closed" });
  const [attempt, setAttempt] = useState(0);
  const panelId = useId();

  useEffect(() => {
    if (state.kind !== "loading") return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch(`${apiBaseUrl}/api/dev/restaurants/${encodeURIComponent(restaurantId)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Restaurant request failed");
        return parseRestaurantDetails(await response.json());
      })
      .then((details) => setState({ kind: "ready", details }))
      .catch(() => setState({ kind: "error" }))
      .finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [attempt, restaurantId, state.kind]);

  const open = state.kind !== "closed";
  const toggle = () => setState((current) => current.kind === "closed" ? { kind: "loading" } : { kind: "closed" });

  return (
    <div className="mt-5 border-t border-stone-200 pt-4">
      <button
        type="button"
        className="rounded-md text-sm font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        {open ? "Hide restaurant details" : "Restaurant details"}
      </button>
      {open && (
        <div id={panelId} className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4" aria-live="polite">
          {state.kind === "loading" && <p role="status">Loading restaurant details…</p>}
          {state.kind === "error" && (
            <div role="alert">
              <p>Restaurant details are unavailable.</p>
              <button type="button" className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }}>Retry</button>
            </div>
          )}
          {state.kind === "ready" && (
            <div>
              <h3 className="font-semibold text-stone-900">{state.details.name}</h3>
              <dl className="mt-3 space-y-2 text-sm text-stone-700">
                <div><dt className="font-medium">Address</dt><dd>{state.details.address ?? "Address unknown"}</dd></div>
                <div><dt className="font-medium">Cuisine</dt><dd>{state.details.cuisine_tags.length ? state.details.cuisine_tags.join(", ") : "Cuisine unknown"}</dd></div>
                <div><dt className="font-medium">Restaurant data checked</dt><dd>{displayDate(state.details.retrieved_at)}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {state.details.website_url ? <a className="font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={state.details.website_url} target="_blank" rel="noopener noreferrer">Restaurant website ↗</a> : <span>Website unavailable</span>}
                {state.details.location_url ? <a className="font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={state.details.location_url} target="_blank" rel="noopener noreferrer">Open location ↗</a> : <span>Location link unavailable</span>}
                {state.details.source_url ? <a className="font-semibold text-amber-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={state.details.source_url} target="_blank" rel="noopener noreferrer">View restaurant source ↗</a> : <span>Restaurant source unavailable</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
