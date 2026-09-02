import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-[#061f43] pb-24 text-white lg:pb-0">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-2xl font-black">
            <span className="text-[#ff7a18]">
              SUGU
            </span>{" "}
            KURA
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">
            Votre boutique moderne pour découvrir
            les meilleures offres, technologies et
            équipements.
          </p>
        </div>

        <div>
          <h3 className="font-bold">
            Boutique
          </h3>

          <div className="mt-4 space-y-3 text-sm text-blue-100/80">
            <Link
              href="/#products"
              className="block"
            >
              Produits
            </Link>

            <Link
              href="/#categories"
              className="block"
            >
              Catégories
            </Link>

            <Link
              href="/#partners"
              className="block"
            >
              Partenaires
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold">
            Assistance
          </h3>

          <p className="mt-4 text-sm text-blue-100/80">
            Service client SUGU KURA
          </p>
        </div>

        <div>
          <h3 className="font-bold">
            Paiement & livraison
          </h3>

          <p className="mt-4 text-sm leading-6 text-blue-100/80">
            Les options définitives seront configurées
            pendant le checkout.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-blue-100/60">
        © 2026 SUGU KURA. Tous droits réservés.
      </div>
    </footer>
  );
}