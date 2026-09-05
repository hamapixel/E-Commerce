import Image from "next/image";
import Link from "next/link";

import type {
  Category,
} from "@/types/api";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({
  categories,
}: CategoryGridProps) {
  const visible =
    categories.filter(
      (category) =>
        !category.parent,
    );

  if (!visible.length) {
    return null;
  }

  return (
    <section
      id="categories"
      className="mt-10"
    >
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Explorer
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Nos catégories
          </h2>
        </div>

        <span className="shrink-0 text-[10px] font-bold text-slate-400 sm:hidden">
          Glissez →
        </span>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
        {visible.map(
          (category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group w-[108px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-2 text-center shadow-sm transition active:scale-[0.98] sm:w-auto sm:shrink hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-slate-50">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 108px, 150px"
                    className="object-contain p-2 transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-black text-[#0b4da2]">
                    {category.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <p className="mt-2 line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-slate-800 sm:text-xs">
                {category.name}
              </p>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
