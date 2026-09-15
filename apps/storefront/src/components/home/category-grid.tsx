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
        !category.parent &&
        category.is_featured_home,
    );

  if (!visible.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00] sm:text-xs">
            Explorer
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            Nos catégories
          </h2>
        </div>

        <span className="shrink-0 text-[10px] font-bold text-slate-400">
          Glissez →
        </span>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
        {visible.map(
          (category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group w-[86px] shrink-0 snap-start rounded-[14px] border border-slate-200 bg-white p-1.5 text-center shadow-sm transition duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:w-[96px] sm:p-2 md:w-[104px]"
            >
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[10px] bg-slate-50">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="104px"
                    className="object-contain p-1.5 transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl font-black text-[#0b4da2]">
                    {category.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <p className="mt-1.5 line-clamp-2 min-h-[28px] text-[10px] font-bold leading-[14px] text-slate-800 sm:text-[11px]">
                {category.name}
              </p>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
