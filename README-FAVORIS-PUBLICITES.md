# SUGU KURA — Favoris + gestion complète des publicités

Ce pack termine deux éléments visibles qui existaient déjà dans l'interface :

1. le cœur Favoris du storefront ;
2. la création / modification / suppression des publicités dans la console OWNER.

Il ne crée aucune nouvelle étape dans la roadmap.

## 1. Favoris

Ajouts :

- cœur fonctionnel dans le header ;
- compteur de favoris ;
- cœur sur chaque carte produit ;
- bouton Favoris sur la fiche produit ;
- page `/favoris` ;
- suppression individuelle ;
- suppression de tous les favoris ;
- conservation dans le navigateur avec Zustand + localStorage ;
- pas de compte client obligatoire ;
- hydratation différée pour éviter les erreurs SSR/React.

## 2. Publicités OWNER

La page `/publicites` permet maintenant :

- créer une publicité ;
- uploader image desktop ;
- uploader image mobile ;
- ajouter le logo annonceur ;
- choisir l'emplacement ;
- programmer date de début / fin ;
- définir priorité et ordre ;
- cibler des catégories ;
- lier une promotion ;
- choisir destination produit / catégorie / marque / WhatsApp / site / lien ;
- afficher ancien prix / prix promo ;
- activer / désactiver ;
- modifier ;
- supprimer ;
- voir un aperçu ;
- voir impressions / clics / CTR ;
- tester le lien.

Le moteur public existant continue de diffuser uniquement les publicités actives dans leur période de validité.

## Installation

Extraire ce ZIP dans :

`C:\Users\HP USER\Desktop\sugu_kura`

et accepter les remplacements.

Aucune migration n'est nécessaire : le modèle Advertisement existant est réutilisé.

## Validation backend

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura"
.\.venv\Scripts\Activate.ps1
cd ".\backend"

python manage.py check
python manage.py test owner_console promotions
```

## Validation OWNER

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura\apps\owner"

npm run lint
npm run build
```

## Validation storefront

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura\apps\storefront"

npm run lint
npm run build
```

## Test manuel publicité

1. Backend sur 8000.
2. OWNER sur 3001.
3. Ouvrir `/publicites`.
4. Ouvrir « Nouvelle publicité ».
5. Pour un test visible tout de suite :
   - emplacement `A — Grande bannière accueil`;
   - début = maintenant ;
   - fin = demain ou plus tard ;
   - Active cochée ;
   - destination personnalisée `/`.
6. Enregistrer.
7. Ouvrir le storefront sur 3000.
8. Actualiser l'accueil.

## Test manuel favoris

1. Ouvrir le storefront.
2. Cliquer le cœur d'un produit.
3. Le cœur du header affiche un compteur.
4. Ouvrir `/favoris`.
5. Fermer et rouvrir le navigateur : le favori reste enregistré.
