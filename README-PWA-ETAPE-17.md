# SUGU KURA — Étape 17 : PWA

Ce pack transforme le storefront public en Progressive Web App installable.
Il ne modifie pas le backend Django et ne mélange pas l'étape 18 Sécurité.

## Ce qui est ajouté

- `manifest.webmanifest` via `src/app/manifest.ts`
- Service Worker `/sw.js`
- installation Android / Chrome / Edge
- aide d'installation iPhone / iPad
- icônes 192, 512, Apple Touch et maskable
- mode `standalone`
- page hors connexion `/hors-ligne`
- cache uniquement des ressources statiques
- aucune mise en cache des API Django, stocks, prix ou commandes
- aucune mise en cache des pages checkout / commande / panier
- proposition d'installation discrète
- support écran d'accueil

## Important pendant le développement

Le Service Worker est volontairement désactivé sous :

`npm run dev`

Cela évite les problèmes de cache pendant le développement.

Pour tester la vraie PWA localement :

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura\apps\storefront"

npm run lint
npm run build
npm run start
```

Puis ouvrir :

`http://localhost:3000`

Localhost est autorisé pour tester les Service Workers.

## Routes à contrôler

- `http://localhost:3000/manifest.webmanifest`
- `http://localhost:3000/hors-ligne`
- `http://localhost:3000/robots.txt`
- `http://localhost:3000/sitemap.xml`

## Chrome / Edge

1. Ouvrir le storefront.
2. Attendre quelques secondes.
3. La proposition « Installer SUGU KURA » peut apparaître.
4. Sinon utiliser le menu du navigateur → Installer l'application.

## iPhone / iPad

Safari ne fournit pas le même bouton automatique.

Utiliser :

Partager → Sur l'écran d'accueil

## Production

Une vraie PWA nécessite HTTPS en production.
`localhost` est la seule exception de développement.

Quand le domaine de production sera prêt, conserver :

`NEXT_PUBLIC_SITE_URL=https://votre-domaine...`

dans `.env.local` ou dans les variables d'environnement de production.
