import type { Metadata } from "next";

import { StoreInfoPage } from "@/components/content/store-info-page";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez l'approche SUGU KURA : une boutique moderne, simple et accessible pour commander en ligne.",
};

export default function AboutPage() {
  return (
    <StoreInfoPage
      eyebrow="SUGU KURA"
      title="Une façon plus simple de faire ses achats"
      intro="SUGU KURA a été pensé pour permettre aux clients de découvrir des produits variés, comparer les offres et commander rapidement depuis un téléphone, une tablette ou un ordinateur."
      sections={[
        {
          title: "Notre objectif",
          body: "Proposer une expérience d’achat claire, moderne et facile à utiliser, avec des informations produit lisibles, un panier simple, des promotions visibles et un suivi de commande accessible.",
        },
        {
          title: "Une boutique ouverte à plusieurs univers",
          body: "Le catalogue peut accueillir différentes familles de produits : technologie, maison, énergie, mode, accessoires et autres catégories selon les besoins de SUGU KURA.",
        },
        {
          title: "Commander sans complication",
          body: "La création d’un compte n’est pas obligatoire pour acheter. Le client peut choisir ses produits, renseigner ses coordonnées, sélectionner sa livraison ou son retrait puis confirmer sa commande.",
        },
        {
          title: "Assistance et suivi",
          body: "Le numéro de commande permet de suivre l’avancement de l’achat. Le service client reste également accessible par téléphone et WhatsApp pour accompagner le client avant et après la commande.",
        },
      ]}
    />
  );
}
