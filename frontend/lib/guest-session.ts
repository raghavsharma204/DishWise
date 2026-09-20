import { GuestLocation, LocationOptions } from "@/lib/locations";

const storageKey = "dishwise:guest-location:v1";

function isValid(value: unknown, options: LocationOptions): value is GuestLocation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return record.city_id === options.city_id
    && record.coverage_id === options.coverage_id
    && record.radius_miles === options.default_radius_miles
    && typeof record.preset_id === "string"
    && options.items.some((item) => item.id === record.preset_id);
}

export function loadGuestLocation(options: LocationOptions): { selection: GuestLocation | null; persistent: boolean } {
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(storageKey);
  } catch {
    return { selection: null, persistent: false };
  }
  if (!raw) return { selection: null, persistent: true };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      return { selection: null, persistent: false };
    }
    return { selection: null, persistent: true };
  }
  if (isValid(value, options)) return { selection: value, persistent: true };
  try {
    window.sessionStorage.removeItem(storageKey);
    return { selection: null, persistent: true };
  } catch {
    return { selection: null, persistent: false };
  }
}

export function saveGuestLocation(selection: GuestLocation): boolean {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(selection));
    return true;
  } catch {
    return false;
  }
}
