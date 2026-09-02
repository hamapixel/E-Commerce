# SUGU KURA — Étape 18 : Sécurité

Ce pack reste strictement dans l'étape 18.

## Corrigé / renforcé

- token OWNER expirant côté serveur après 12 heures ;
- cookie OWNER HttpOnly, SameSite=Strict, Secure en production ;
- anti-brute-force login OWNER ;
- anti-brute-force Django Admin ;
- réponse login générique ;
- validation Django réelle du mot de passe lors de `create_owner` ;
- longueur minimale de mot de passe : 12 caractères ;
- throttle des créations de checkout et de commande ;
- correction transactionnelle du checkout expiré lors de la commande ;
- interdiction de convertir un stock simple réservé vers une première variante ;
- protection de l'historique lors de la suppression d'une variante ;
- recréation du stock simple après suppression sûre de la dernière variante ;
- headers de sécurité Next.js ;
- OWNER en `noindex` et `no-store` ;
- réglages HTTPS/HSTS prêts pour le déploiement.

## Installation

Extraire le ZIP à :

`C:\Users\HP USER\Desktop\sugu_kura`

et accepter les remplacements.

Le fichier `backend\.env.example` est un modèle.
Ne remplacez PAS votre `.env` actuel par ce fichier.

## Validation backend

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura"
.\.venv\Scripts\Activate.ps1
cd ".\backend"

python manage.py check
python manage.py test accounts owner_console checkout orders inventory catalog
```

## Validation console OWNER

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

Après ces tests, vérifier manuellement :
- login / logout OWNER ;
- dashboard, stock, catalogue, commandes ;
- storefront ;
- PWA ;
- création d'un checkout normal.

Ne cochez l'étape 18 qu'après validation complète.
