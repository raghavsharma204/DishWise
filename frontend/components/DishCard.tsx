import { Dish, Price, Provenance, safeSourceUrl } from "@/lib/dishes";

function formatPrice(price: Price): string {
  const amount = Number(price.amount);
  if (!Number.isFinite(amount) || amount < 0) return "Price unknown";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency }).format(amount);
  } catch {
    return "Price unknown";
  }
}

function provenanceText(provenance: Provenance): string {
  if (provenance === "inferred") return "inferred, uncertain";
  if (provenance === "manually_reviewed") return "manually reviewed";
  return "sourced";
}

export default function DishCard({ dish }: { dish: Dish }) {
  const sourceUrl = safeSourceUrl(dish.source_url);
  const verified = dish.verified_at && !Number.isNaN(Date.parse(dish.verified_at))
    ? new Date(dish.verified_at).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby={`dish-${dish.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`}>
      <p className="text-sm font-medium text-slate-600">{dish.restaurant.name}</p>
      <h2 id={`dish-${dish.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`} className="mt-1 text-2xl font-semibold text-slate-900">{dish.name}</h2>
      <p className="mt-3 text-lg font-medium text-slate-900">{dish.price ? formatPrice(dish.price) : "Price unknown"}</p>
      {dish.price && dish.price_provenance && <p className="text-sm text-slate-600">Price: {provenanceText(dish.price_provenance)}</p>}
      {dish.variants.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-slate-800">Options</h3>
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {dish.variants.map((variant) => <li key={variant.label}>{variant.label}: {formatPrice(variant.price)} ({provenanceText(variant.provenance)})</li>)}
          </ul>
        </div>
      )}
      <p className="mt-4 text-slate-700">{dish.description ?? "Description unknown"}</p>
      {dish.description_provenance && <p className="text-sm text-slate-600">Description: {provenanceText(dish.description_provenance)}</p>}
      <div className="mt-4">
        <h3 className="font-medium text-slate-800">Attributes</h3>
        {dish.attributes.length ? (
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {dish.attributes.map((attribute) => (
              <li key={`${attribute.kind}:${attribute.value}`}>
                {attribute.kind}: {attribute.value} ({provenanceText(attribute.provenance)})
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-600">Attributes unknown</p>}
      </div>
      <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <p>Catalog status: {dish.status}; review: {dish.review_status}. This does not confirm current availability.</p>
        <p>Last menu verification: {verified ?? "unknown"}</p>
        {sourceUrl ? (
          <a className="mt-2 inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={sourceUrl} target="_blank" rel="noopener noreferrer">Menu source</a>
        ) : <p>Menu source unavailable</p>}
      </div>
    </article>
  );
}
