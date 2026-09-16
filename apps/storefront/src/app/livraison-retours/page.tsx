import type { Metadata } from "next";

import { StoreInfoPage } from "@/components/content/store-info-page";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description:
    "Informations sur la livraison, le retrait et les demandes de retour SUGU KURA.",
};

export default function DeliveryReturnsPage() {
  return (
    <StoreInfoPage
      eyebrow="Commande & livraison"
      title="Livraison et retours"
      intro="SUGU KURA affiche les frais de livraison avant validation afin que le client sache clairement combien il paiera et où sa commande sera livrée."
      sections={[
        {
          title: "Livraison par ville et quartier",
          body: "Lors du checkout, choisissez votre ville puis votre quartier. Le tarif correspondant est automatiquement affiché et recalculé par le serveur avant validation.",
          items: [
            "Le client ne peut pas modifier manuellement le tarif de livraison.",
            "Le délai affiché est indicatif lorsqu’il est renseigné par SUGU KURA.",
            "Une adresse ou un repère utile peut être demandé pour faciliter la livraison.",
          ],
        },
        {
          title: "Retrait",
          body: "Lorsque vous choisissez le retrait, aucun frais de livraison n’est ajouté. Les modalités pratiques de retrait peuvent être confirmées avec le service client.",
        },
        {
          title: "Retour ou problème avec un produit",
          body: "En cas de produit reçu endommagé, incorrect ou présentant un problème, contactez rapidement SUGU KURA avec votre numéro de commande et, si possible, des photos du produit concerné.",
        },
        {
          title: "Décision après vérification",
          body: "Les possibilités de remplacement, échange ou autre solution dépendent du produit, de son état et des circonstances de la demande. Le service client vous indiquera la solution applicable après vérification.",
        },
      ]}
      note="Avant le lancement public, les délais, zones couvertes et règles commerciales de retour devront correspondre exactement aux pratiques réelles de SUGU KURA."
    />
  );
}
