import Link from "next/link";

import type {
  CategoryMini,
} from "@/types/api";

interface SubcategoryStripProps {
  subcategories: CategoryMini[];
}

export function SubcategoryStrip({
  subcategories,
}: SubcategoryStripProps) {
  if (!subcategories.length) {
    return null;
  }

  return (
    <section className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-900 sm:text-base">
          Sous-catégories
        </h2>

        <span className="text-[10px] font-bold text-slate-400">
          Glissez →
        </span>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-0 sm:px-0">
        {subcategories.map(
          (subcategory) => (
            <Link
              key={subcategory.id}
              href={`/categories/${subcategory.slug}`}
              className="shrink-0 snap-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#0b4da2] shadow-sm transition hover:border-orange-300 hover:text-[#ff6b00]"
            >
              {subcategory.name}
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
