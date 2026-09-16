import type { Metadata } from "next";

import { StoreInfoPage } from "@/components/content/store-info-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur les commandes, livraisons, paiements et retours SUGU KURA.",
};

export default function FaqPage() {
  return (
    <StoreInfoPage
      eyebrow="Aide client"
      title="Questions fréquentes"
      intro="Les réponses essentielles pour commander facilement sur SUGU KURA, suivre votre achat et contacter notre équipe si nécessaire."
      sections={[
        {
          title: "Dois-je créer un compte pour commander ?",
          body: "Non. Vous pouvez sélectionner vos produits, renseigner vos coordonnées et valider votre commande sans créer de compte.",
        },
        {
          title: "Comment suivre ma commande ?",
          body: "Utilisez la rubrique « Ma commande » ou « Suivre ma commande ». Le numéro de commande et le téléphone utilisé lors de l’achat permettent de retrouver le suivi.",
        },
        {
          title: "Comment sont calculés les frais de livraison ?",
          body: "Le tarif est déterminé selon la ville et le quartier configurés par SUGU KURA. Le montant est affiché avant la validation de la commande.",
        },
        {
          title: "Puis-je choisir le retrait ?",
          body: "Oui. Lorsque l’option retrait est disponible, aucun frais de livraison n’est ajouté à la commande.",
        },
        {
          title: "Comment demander de l’aide ?",
          body: "La page Contact permet de joindre directement SUGU KURA par téléphone ou WhatsApp pour une question sur un produit, une commande ou une livraison.",
        },
      ]}
    />
  );
}
