import type {
  Product,
} from "@/types/api";

import {
  ProductCard,
} from "./product-card";

interface ProductGridProps {
  products: Product[];
  variant?: "grid" | "carousel";
}

export function ProductGrid({
  products,
  variant = "grid",
}: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <p className="font-bold text-slate-700">
          Aucun produit disponible pour le moment.
        </p>
      </div>
    );
  }

  if (variant === "carousel") {
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
        {products.map(
          (product) => (
            <div
              key={product.id}
              className="w-[158px] shrink-0 snap-start sm:w-[180px] md:w-[190px]"
            >
              <ProductCard
                product={product}
              />
            </div>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {products.map(
        (product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ),
      )}
    </div>
  );
}
