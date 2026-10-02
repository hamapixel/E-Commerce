import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  FolderTree,
  LayoutGrid,
  Package,
  PackagePlus,
  Tags,
} from "lucide-react";


interface CatalogueLayoutProps {
  children: ReactNode;
}


const catalogueLinks = [
  {
    href: "/catalogue",
    label: "Catalogue",
    icon: LayoutGrid,
  },
  {
    href: "/catalogue/produits",
    label: "Produits",
    icon: Package,
  },
  {
    href: "/catalogue/categories",
    label: "Catégories",
    icon: FolderTree,
  },
  {
    href: "/catalogue/marques",
    label: "Marques",
    icon: Tags,
  },
];


export default function CatalogueLayout({
  children,
}: CatalogueLayoutProps) {
  return (
    <>
      <div className="mb-6 overflow-x-auto pb-1">
        <nav className="flex min-w-max items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {catalogueLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-black text-slate-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-[#0b4da2]"
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/catalogue/produits/nouveau"
            className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-3 text-xs font-black text-white transition hover:bg-[#e65f00]"
          >
            <PackagePlus size={15} />
            Nouveau produit
          </Link>
        </nav>
      </div>

      {children}
    </>
  );
}
