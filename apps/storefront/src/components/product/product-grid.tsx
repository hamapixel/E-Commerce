import type {
  Product,
} from "@/types/api";

import {
  ProductCard,
} from "./product-card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({
  products,
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

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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