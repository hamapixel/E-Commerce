import {
  ProductPromotionPanel,
} from "@/components/catalogue/product-promotion-panel";


interface ProductEditLayoutProps {
  children: React.ReactNode;

  params: Promise<{
    id: string;
  }>;
}


export default async function ProductEditLayout({
  children,
  params,
}: ProductEditLayoutProps) {
  const {
    id,
  } = await params;

  const productId = Number(id);

  return (
    <>
      {Number.isFinite(productId) && productId > 0 && (
        <ProductPromotionPanel
          productId={productId}
        />
      )}

      {children}
    </>
  );
}
