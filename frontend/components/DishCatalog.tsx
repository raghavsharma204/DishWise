"use client";

import { useCallback, useEffect, useState } from "react";
import DishCard from "@/components/DishCard";
import LocationSelector from "@/components/LocationSelector";
import { Dish, parseDishList } from "@/lib/dishes";
import { GuestLocation, parseDistanceResponse } from "@/lib/locations";

type CatalogState = { kind: "loading" } | { kind: "ready"; dishes: Dish[] } | { kind: "error" };
type DistanceState =
  | { kind: "idle" }
  | { kind: "loading"; label: string }
  | { kind: "ready"; label: string; values: Record<string, number | null> }
  | { kind: "error"; label: string };
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function DishCatalog() {
  const [state, setState] = useState<CatalogState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<{ value: GuestLocation; label: string } | null>(null);
  const [distanceAttempt, setDistanceAttempt] = useState(0);
  const [distanceState, setDistanceState] = useState<DistanceState>({ kind: "idle" });

  const handleLocation = useCallback((value: GuestLocation, label: string) => {
    setSelection({ value, label });
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch(`${apiBaseUrl}/api/dev/dishes`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return parseDishList(await response.json());
      })
      .then((dishes) => { if (active && !controller.signal.aborted) setState({ kind: "ready", dishes }); })
      .catch(() => { if (active) setState({ kind: "error" }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [attempt]);

  useEffect(() => {
    if (!selection) {
      setDistanceState({ kind: "idle" });
      return;
    }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    setDistanceState({ kind: "loading", label: selection.label });
    fetch(`${apiBaseUrl}/api/dev/locations/${encodeURIComponent(selection.value.preset_id)}/distances`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Distance request failed");
        return parseDistanceResponse(await response.json());
      })
      .then((data) => {
        if (!active || controller.signal.aborted || data.preset.id !== selection.value.preset_id) return;
        setDistanceState({
          kind: "ready",
          label: data.preset.label,
          values: Object.fromEntries(data.distances.map((item) => [item.restaurant_id, item.distance_miles])),
        });
      })
      .catch(() => { if (active) setDistanceState({ kind: "error", label: selection.label }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [distanceAttempt, selection]);

  if (state.kind === "loading") return <p role="status">Loading stored dishes…</p>;
  if (state.kind === "error") return (
    <section role="alert" className="rounded-lg border border-rose-200 bg-white p-5">
      <p>The local catalog is unavailable. Check the API and database, then try again.</p>
      <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }}>Retry</button>
    </section>
  );
  const syntheticCount = state.dishes.filter((dish) => dish.is_synthetic).length;
  const sampleLabel = syntheticCount === state.dishes.length
    ? "Synthetic test fixture"
    : syntheticCount === 0 ? "Reviewed factual sample" : "Mixed local sample";
  return (
    <section aria-label="Stored offerings">
      <LocationSelector onSelect={handleLocation} />
      {distanceState.kind === "loading" && <p role="status" className="mb-5 text-sm text-stone-600">Calculating approximate distances from {distanceState.label}…</p>}
      {distanceState.kind === "error" && (
        <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-white p-4 text-sm">
          <p>Approximate distances from {distanceState.label} are unavailable. Stored dishes remain visible.</p>
          <button type="button" className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setDistanceAttempt((value) => value + 1)}>Retry distances</button>
        </div>
      )}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-stone-700">
        <p className="font-semibold text-amber-950">{sampleLabel} · {state.dishes.length} stored {state.dishes.length === 1 ? "offering" : "offerings"}</p>
        <p className="mt-1">This is a small catalog preview, not recommendations or a live menu. Menu facts may have changed since the dates shown. Food attributes are not allergy guidance.</p>
      </div>
      {state.dishes.length === 0 ? <p role="status">No stored dishes are in this local catalog yet.</p> : (
        <div className="grid gap-5 lg:grid-cols-2">{state.dishes.map((dish) => (
          <DishCard
            dish={dish}
            key={dish.id}
            distance={distanceState.kind === "ready" ? { presetLabel: distanceState.label, miles: distanceState.values[dish.restaurant.id] ?? null } : undefined}
          />
        ))}</div>
      )}
    </section>
  );
}
