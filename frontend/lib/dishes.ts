export type Provenance = "sourced" | "manually_reviewed" | "inferred";
export type Price = { amount: string; currency: string };
export type Dish = {
  id: string;
  restaurant: { id: string; name: string };
  name: string;
  description: string | null;
  description_provenance: Provenance | null;
  price: Price | null;
  price_provenance: Provenance | null;
  variants: { label: string; price: Price; provenance: Provenance }[];
  attributes: { kind: string; value: string; provenance: Provenance }[];
  source_url: string | null;
  verified_at: string | null;
  review_status: "pending" | "reviewed";
  status: "active" | "withdrawn";
  is_synthetic: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPrice = (value: unknown): value is Price =>
  isRecord(value) && typeof value.amount === "string" && typeof value.currency === "string";

const isProvenance = (value: unknown): value is Provenance =>
  value === "sourced" || value === "manually_reviewed" || value === "inferred";

export function isDish(value: unknown): value is Dish {
  if (!isRecord(value) || !isRecord(value.restaurant)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.restaurant.id === "string" &&
    typeof value.restaurant.name === "string" &&
    typeof value.name === "string" &&
    (value.description === null || typeof value.description === "string") &&
    (value.description_provenance === null || isProvenance(value.description_provenance)) &&
    (value.price === null || isPrice(value.price)) &&
    (value.price_provenance === null || isProvenance(value.price_provenance)) &&
    Array.isArray(value.variants) &&
    value.variants.every((variant) =>
      isRecord(variant) && typeof variant.label === "string" && isPrice(variant.price) && isProvenance(variant.provenance)
    ) &&
    Array.isArray(value.attributes) &&
    value.attributes.every((attribute) =>
      isRecord(attribute) && typeof attribute.kind === "string" && typeof attribute.value === "string" && isProvenance(attribute.provenance)
    ) &&
    (value.source_url === null || typeof value.source_url === "string") &&
    (value.verified_at === null || typeof value.verified_at === "string") &&
    (value.review_status === "pending" || value.review_status === "reviewed") &&
    (value.status === "active" || value.status === "withdrawn") &&
    typeof value.is_synthetic === "boolean"
  );
}

export function parseDishList(value: unknown): Dish[] {
  if (!isRecord(value) || !Array.isArray(value.items) || value.items.length > 50 || !value.items.every(isDish)) {
    throw new Error("Invalid catalog response");
  }
  return value.items;
}

export function safeSourceUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export type RestaurantDetails = {
  id: string;
  name: string;
  address: string | null;
  cuisine_tags: string[];
  website_url: string | null;
  source_url: string | null;
  retrieved_at: string | null;
  location_url: string | null;
};

export function parseRestaurantDetails(value: unknown): RestaurantDetails {
  if (!isRecord(value)
    || typeof value.id !== "string"
    || typeof value.name !== "string"
    || (value.address !== null && typeof value.address !== "string")
    || !Array.isArray(value.cuisine_tags)
    || !value.cuisine_tags.every((tag) => typeof tag === "string")
    || (value.website_url !== null && typeof value.website_url !== "string")
    || (value.source_url !== null && typeof value.source_url !== "string")
    || (value.retrieved_at !== null && typeof value.retrieved_at !== "string")
    || (value.location_url !== null && typeof value.location_url !== "string")) {
    throw new Error("Invalid restaurant response");
  }
  return {
    id: value.id,
    name: value.name,
    address: value.address,
    cuisine_tags: value.cuisine_tags,
    website_url: safeSourceUrl(value.website_url),
    source_url: safeSourceUrl(value.source_url),
    retrieved_at: value.retrieved_at,
    location_url: safeSourceUrl(value.location_url),
  };
}
