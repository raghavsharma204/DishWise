"use client";

import { useCallback, useEffect, useState } from "react";
import { loadGuestLocation, saveGuestLocation } from "@/lib/guest-session";
import { GuestLocation, LocationOptions, parseLocationOptions } from "@/lib/locations";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; options: LocationOptions };

export default function LocationSelector({ onSelect }: { onSelect: (selection: GuestLocation, label: string) => void }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [persistent, setPersistent] = useState(true);

  const select = useCallback((options: LocationOptions, presetId: string) => {
    const option = options.items.find((item) => item.id === presetId);
    if (!option) return;
    const selection: GuestLocation = {
      city_id: options.city_id,
      coverage_id: options.coverage_id,
      preset_id: option.id,
      radius_miles: options.default_radius_miles,
    };
    setSelectedId(option.id);
    setPersistent(saveGuestLocation(selection));
    onSelect(selection, option.label);
  }, [onSelect]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch(`${apiBaseUrl}/api/dev/locations`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Location request failed");
        return parseLocationOptions(await response.json());
      })
      .then((options) => {
        if (!active || controller.signal.aborted) return;
        setState({ kind: "ready", options });
        const restored = loadGuestLocation(options);
        setPersistent(restored.persistent);
        if (restored.selection) {
          const option = options.items.find((item) => item.id === restored.selection?.preset_id);
          if (option) {
            setSelectedId(option.id);
            onSelect(restored.selection, option.label);
          }
        }
      })
      .catch(() => { if (active) setState({ kind: "error" }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [attempt, onSelect]);

  if (state.kind === "loading") return <p role="status" className="mb-6">Loading location choices…</p>;
  if (state.kind === "error") return (
    <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-white p-5">
      <p>Location choices are unavailable. Stored dishes remain visible.</p>
      <button type="button" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }}>Retry locations</button>
    </div>
  );
  return (
    <fieldset className="mb-6 rounded-2xl border border-stone-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-stone-900">Choose an approximate starting area</legend>
      <p className="mt-1 text-sm text-stone-600">Manual Carmel presets only. No device location is requested. Default search radius: 3 miles.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {state.options.items.map((option) => (
          <label key={option.id} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber-900 ${selectedId === option.id ? "border-amber-700 bg-amber-50 text-amber-950" : "border-stone-300 text-stone-700"}`}>
            <input className="mr-2 accent-amber-800" type="radio" name="location-preset" value={option.id} checked={selectedId === option.id} onChange={() => select(state.options, option.id)} />
            {option.label}
          </label>
        ))}
      </div>
      {!persistent && <p role="status" className="mt-3 text-sm text-amber-900">This choice will last for this page only because session storage is unavailable.</p>}
    </fieldset>
  );
}
