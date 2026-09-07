import {
  ProductReviews,
} from "@/components/product/product-reviews";


interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}


export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const {
    slug,
  } = await params;

  return (
    <>
      {children}

      <ProductReviews
        slug={slug}
      />
    </>
  );
}
