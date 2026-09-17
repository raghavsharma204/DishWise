import { notFound } from "next/navigation";
import DishCatalog from "@/components/DishCatalog";

export default function DevDishesPage() {
  if (process.env.NODE_ENV !== "development" || process.env.ENABLE_DEV_CATALOG !== "1" || process.env.VERCEL) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] px-6 py-10 text-stone-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Local development catalog</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Stored dish cards</h1>
        <p className="mb-8 mt-4 max-w-3xl text-stone-700">A preview of how stored menu facts appear on dish cards.</p>
        <DishCatalog />
      </div>
    </main>
  );
}
