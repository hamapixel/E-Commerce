import type { Metadata } from "next";

import { StoreInfoPage } from "@/components/content/store-info-page";

export const metadata: Metadata = {
  title: "Conditions générales",
  description:
    "Conditions générales d'utilisation et de commande de la boutique SUGU KURA.",
};

export default function TermsPage() {
  return (
    <StoreInfoPage
      eyebrow="Informations importantes"
      title="Conditions générales"
      intro="Ces conditions présentent les règles principales d’utilisation de la boutique et du parcours de commande SUGU KURA."
      sections={[
        {
          title: "Produits et informations affichées",
          body: "SUGU KURA s’efforce de présenter les produits, prix, disponibilités et caractéristiques de manière claire. Certaines informations peuvent évoluer en fonction du stock, des promotions ou des mises à jour du catalogue.",
        },
        {
          title: "Commande",
          body: "Une commande est créée après validation du parcours d’achat. Le client doit fournir des coordonnées exactes afin de permettre la confirmation, le suivi et la livraison ou le retrait.",
        },
        {
          title: "Prix et livraison",
          body: "Le prix des articles et les éventuels frais de livraison sont affichés avant confirmation. Les frais de livraison dépendent notamment de la ville et du quartier configurés dans la boutique.",
        },
        {
          title: "Paiement",
          body: "Les moyens de paiement disponibles sont ceux présentés au moment de la commande. Lorsqu’un paiement à la livraison ou au retrait est proposé, aucun paiement en ligne n’est prélevé au moment de la création de la commande.",
        },
        {
          title: "Annulation, modification et retour",
          body: "Toute demande liée à une annulation, modification ou retour doit être communiquée au service client. La solution applicable dépend de l’état de la commande, du produit et des conditions commerciales en vigueur.",
        },
        {
          title: "Disponibilité du service",
          body: "La boutique peut être temporairement indisponible pour maintenance, mise à jour ou incident technique. SUGU KURA peut également faire évoluer les fonctionnalités du site afin d’améliorer le service.",
        },
      ]}
      note="Avant le lancement commercial définitif, ces conditions doivent être relues et adaptées aux informations légales réelles de l’entreprise, à ses pratiques commerciales et aux règles applicables dans les pays servis."
    />
  );
}
