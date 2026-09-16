import type {
  ReactNode,
} from "react";

import {
  CategorySearchEnhancer,
} from "@/components/catalogue/category-search-enhancer";

export default function CategoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <CategorySearchEnhancer />
      {children}
    </>
  );
}
