import type { Metadata } from "next";

import { StoreInfoPage } from "@/components/content/store-info-page";

export const metadata: Metadata = {
  title: "Confidentialité et cookies",
  description:
    "Informations sur les données personnelles, le stockage local et les cookies utilisés par SUGU KURA.",
};

export default function PrivacyPage() {
  return (
    <StoreInfoPage
      eyebrow="Vie privée"
      title="Confidentialité et cookies"
      intro="SUGU KURA utilise les informations nécessaires au fonctionnement de la boutique, à la gestion des commandes et à l’assistance client."
      sections={[
        {
          title: "Données fournies lors d’une commande",
          body: "Selon les informations saisies par le client, SUGU KURA peut traiter notamment le nom, le numéro de téléphone, le contact WhatsApp, l’adresse e-mail, l’adresse de livraison et les informations liées à la commande.",
        },
        {
          title: "Pourquoi ces informations sont utilisées",
          body: "Ces données servent principalement à préparer la commande, contacter le client, organiser la livraison ou le retrait, assurer le suivi et répondre aux demandes d’assistance.",
        },
        {
          title: "Stockage dans le navigateur",
          body: "Certaines fonctions pratiques peuvent utiliser le stockage local du navigateur, par exemple pour conserver le panier, les favoris ou les dernières commandes consultées sur l’appareil. Ces informations restent liées au navigateur utilisé tant qu’elles ne sont pas effacées.",
        },
        {
          title: "Cookies techniques",
          body: "Des cookies ou mécanismes similaires peuvent être utilisés lorsqu’ils sont nécessaires au fonctionnement technique, à la sécurité ou à une future session de connexion. Une connexion client n’est pas obligatoire dans la version actuelle de la boutique.",
        },
        {
          title: "Mesure d’audience et publicité",
          body: "Si SUGU KURA active plus tard des outils de mesure d’audience, de publicité ou de suivi marketing nécessitant un consentement, la politique et le mécanisme de consentement devront être mis à jour avant leur activation.",
        },
        {
          title: "Questions sur vos données",
          body: "Pour toute question concernant vos informations personnelles ou une commande, utilisez les moyens disponibles sur la page Contact de SUGU KURA.",
        },
      ]}
      note="Cette page décrit le fonctionnement prévu de la boutique. Avant la mise en production définitive, nous vérifierons les outils réellement activés afin que l’information affichée corresponde exactement au site déployé."
    />
  );
}
