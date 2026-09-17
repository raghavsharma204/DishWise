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
  const headingId = `dish-${dish.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_24px_-18px_rgba(41,37,36,0.5)]" aria-labelledby={headingId}>
      <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">{dish.restaurant.name}</p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={headingId} className="text-2xl font-semibold leading-tight text-stone-900">{dish.name}</h2>
          <div className="shrink-0 text-right">
            <p className="text-xl font-semibold text-stone-900">
              {dish.price ? formatPrice(dish.price) : dish.variants.length ? "See options" : "Price unknown"}
            </p>
            {dish.price && dish.price_provenance && <p className="mt-1 text-xs text-stone-500">{provenanceText(dish.price_provenance)}</p>}
            {!dish.price && dish.variants.length > 0 && <p className="mt-1 text-xs text-stone-500">Base price unknown</p>}
          </div>
        </div>

        {dish.variants.length > 0 && (
          <div className="mt-5 rounded-xl bg-amber-50/70 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Menu options</h3>
            <ul className="mt-2 space-y-2">
              {dish.variants.map((variant) => (
                <li className="flex flex-wrap justify-between gap-x-3 text-sm text-stone-800" key={variant.label}>
                  <span>{variant.label}: {formatPrice(variant.price)}</span>
                  <span className="text-stone-500">{provenanceText(variant.provenance)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {dish.description && (
          <p className="mt-5 text-sm leading-6 text-stone-700">
            {dish.description} {dish.description_provenance && <span className="text-stone-500">({provenanceText(dish.description_provenance)})</span>}
          </p>
        )}
        {dish.attributes.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Recorded attributes</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {dish.attributes.map((attribute) => (
                <li className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700" key={`${attribute.kind}:${attribute.value}`}>
                  {attribute.kind}: {attribute.value} ({provenanceText(attribute.provenance)})
                </li>
              ))}
            </ul>
          </div>
        )}
        {(!dish.description || dish.attributes.length === 0) && (
          <p className="mt-5 text-xs leading-5 text-stone-500">
            {[!dish.description && "Description", dish.attributes.length === 0 && "Food attributes"].filter(Boolean).join(" and ")} not recorded.
          </p>
        )}

        <div className="mt-auto pt-6">
          {(dish.status === "withdrawn" || dish.review_status === "pending") && (
            <p className="mb-3 text-xs font-medium text-amber-900">
              {dish.status === "withdrawn" ? "Marked withdrawn in this catalog" : "Review pending"}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4 text-xs text-stone-500">
            <span>Menu checked: {verified ?? "unknown"}</span>
            {sourceUrl ? (
              <a className="font-semibold text-amber-900 underline underline-offset-4 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900" href={sourceUrl} target="_blank" rel="noopener noreferrer">View menu source ↗</a>
            ) : <span>Menu source unavailable</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
