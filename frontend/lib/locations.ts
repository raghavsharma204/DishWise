export type LocationOption = { id: string; label: string };
export type LocationOptions = {
  city_id: string;
  coverage_id: string;
  default_radius_miles: 3;
  approximate: true;
  items: LocationOption[];
};
export type GuestLocation = {
  city_id: string;
  coverage_id: string;
  preset_id: string;
  radius_miles: 3;
};
export type DistanceResponse = {
  city_id: string;
  coverage_id: string;
  preset: LocationOption;
  approximate: true;
  distances: { restaurant_id: string; distance_miles: number | null }[];
};

const idPattern = /^[a-z0-9][a-z0-9-]{0,99}$/;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isId = (value: unknown): value is string => typeof value === "string" && idPattern.test(value);
const isOption = (value: unknown): value is LocationOption =>
  isRecord(value) && isId(value.id) && typeof value.label === "string" && value.label.length > 0 && value.label.length <= 100;

export function parseLocationOptions(value: unknown): LocationOptions {
  if (!isRecord(value)
    || !isId(value.city_id)
    || !isId(value.coverage_id)
    || value.default_radius_miles !== 3
    || value.approximate !== true
    || !Array.isArray(value.items)
    || value.items.length === 0
    || value.items.length > 20
    || !value.items.every(isOption)
    || new Set(value.items.map((item) => item.id)).size !== value.items.length) {
    throw new Error("Invalid location options response");
  }
  return value as LocationOptions;
}

export function parseDistanceResponse(value: unknown): DistanceResponse {
  if (!isRecord(value)
    || !isId(value.city_id)
    || !isId(value.coverage_id)
    || !isOption(value.preset)
    || value.approximate !== true
    || !Array.isArray(value.distances)
    || value.distances.length > 50
    || !value.distances.every((item) =>
      isRecord(item)
      && typeof item.restaurant_id === "string"
      && item.restaurant_id.length > 0
      && item.restaurant_id.length <= 100
      && (item.distance_miles === null
        || (typeof item.distance_miles === "number" && Number.isFinite(item.distance_miles) && item.distance_miles >= 0)))
    || new Set(value.distances.map((item) => item.restaurant_id)).size !== value.distances.length) {
    throw new Error("Invalid distance response");
  }
  return value as DistanceResponse;
}
