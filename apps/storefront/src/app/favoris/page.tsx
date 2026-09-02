import {
  FavoritesPageClient,
} from "@/components/favorites/favorites-page-client";


export default function FavoritesPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Ma sélection
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
          Mes favoris
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Les produits que vous souhaitez
          retrouver rapidement.
        </p>
      </div>

      <FavoritesPageClient />
    </div>
  );
}
