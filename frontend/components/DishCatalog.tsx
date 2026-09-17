"use client";

import { useEffect, useState } from "react";
import DishCard from "@/components/DishCard";
import { Dish, parseDishList } from "@/lib/dishes";

type CatalogState = { kind: "loading" } | { kind: "ready"; dishes: Dish[] } | { kind: "error" };
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function DishCatalog() {
  const [state, setState] = useState<CatalogState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

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

  if (state.kind === "loading") return <p role="status">Loading stored dishes…</p>;
  if (state.kind === "error") return (
    <section role="alert" className="rounded-lg border border-rose-200 bg-white p-5">
      <p>The local catalog is unavailable. Check the API and database, then try again.</p>
      <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }}>Retry</button>
    </section>
  );
  if (state.dishes.length === 0) return <p role="status">No stored dishes are in this local catalog yet.</p>;
  const syntheticCount = state.dishes.filter((dish) => dish.is_synthetic).length;
  const sampleLabel = syntheticCount === state.dishes.length
    ? "Synthetic test fixture"
    : syntheticCount === 0 ? "Reviewed factual sample" : "Mixed local sample";
  return (
    <section aria-label="Stored offerings">
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-stone-700">
        <p className="font-semibold text-amber-950">{sampleLabel} · {state.dishes.length} stored {state.dishes.length === 1 ? "offering" : "offerings"}</p>
        <p className="mt-1">This is a small catalog preview, not recommendations or a live menu. Menu facts may have changed since the dates shown. Food attributes are not allergy guidance.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">{state.dishes.map((dish) => <DishCard dish={dish} key={dish.id} />)}</div>
    </section>
  );
}
