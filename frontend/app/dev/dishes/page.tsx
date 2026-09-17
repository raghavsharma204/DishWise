import { notFound } from "next/navigation";
import DishCatalog from "@/components/DishCatalog";

export default function DevDishesPage() {
  if (process.env.NODE_ENV !== "development" || process.env.ENABLE_DEV_CATALOG !== "1" || process.env.VERCEL) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-600">Local development catalog</p>
        <h1 className="mt-2 text-4xl font-semibold">Stored dish cards</h1>
        <p className="mb-8 mt-4 max-w-3xl text-slate-700">Synthetic fixture data for checking stored catalog display. These are not recommendations, live menus, or proof of current availability. Food attributes are not allergy guidance.</p>
        <DishCatalog />
      </div>
    </main>
  );
}
