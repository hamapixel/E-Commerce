# SUGU KURA — Étape 16 : SEO complet

Ce pack ajoute uniquement l'étape 16 SEO. Il ne mélange pas l'étape 17 PWA.

## Fichiers principaux

- `apps/storefront/src/lib/seo.ts`
- `apps/storefront/src/app/layout.tsx`
- `apps/storefront/src/app/page.tsx`
- `apps/storefront/src/app/produits/[slug]/page.tsx`
- `apps/storefront/src/app/categories/[slug]/page.tsx`
- `apps/storefront/src/app/marques/[slug]/page.tsx`
- `apps/storefront/src/app/sitemap.ts`
- `apps/storefront/src/app/robots.ts`
- layouts `noindex` pour checkout / commande / panier
- `backend/catalog/api/serializers.py`

## Ce que le SEO couvre

- métadonnées globales ;
- titres et descriptions dynamiques ;
- champs SEO administrés pour produits, catégories et marques ;
- URL canonical ;
- Open Graph pour WhatsApp / Facebook ;
- Twitter cards ;
- JSON-LD Product ;
- JSON-LD BreadcrumbList ;
- JSON-LD CollectionPage / Brand ;
- `robots.txt` ;
- `sitemap.xml` dynamique ;
- exclusion de l'indexation des pages de checkout, commande et panier.

## Installation

Extraire le ZIP à la racine :

`C:\Users\HP USER\Desktop\sugu_kura`

et accepter le remplacement des fichiers.

## URL du site

Ajoutez dans :

`C:\Users\HP USER\Desktop\sugu_kura\apps\storefront\.env.local`

en développement :

`NEXT_PUBLIC_SITE_URL=http://localhost:3000`

En production, remplacez cette valeur par le vrai domaine HTTPS.

## Tests backend

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura"
.\.venv\Scripts\Activate.ps1
cd ".\backend"

python manage.py check
python manage.py test catalog
```

## Tests storefront

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura\apps\storefront"

npm run lint
npm run build
```

Après démarrage du storefront, vérifier :

- `http://localhost:3000/robots.txt`
- `http://localhost:3000/sitemap.xml`
- une page produit ;
- une catégorie ;
- une marque.

Ne validez l'étape 16 qu'après `check`, tests Django, `lint` et `build`.
