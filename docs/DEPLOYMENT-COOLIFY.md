# SUGU KURA — Déploiement Docker + Coolify

Ce document décrit la pile de production préparée pour SUGU KURA.

## Architecture

- `storefront` : Next.js public, port interne `3000`
- `owner` : console propriétaire Next.js, port interne `3001`
- `api` : Nginx devant Django, port interne `8080`
- `backend` : Django + Gunicorn, port interne `8000`
- `worker` : Celery
- `db` : PostgreSQL 18
- `redis` : Redis

Volumes persistants :

- `postgres-data` : base PostgreSQL
- `redis-data` : données Redis
- `media-data` : photos produits, publicités, profil, logo, partenaires
- `static-data` : fichiers statiques Django collectés

## Test Docker local sous Windows

Depuis la racine du projet :

```powershell
Copy-Item .env.example .env
```

Modifier au minimum dans `.env` :

- `DJANGO_SECRET_KEY`
- `DB_PASSWORD`

Puis :

```powershell
docker --version
docker compose version

docker compose -f docker-compose.yml -f docker-compose.local.yml config
docker compose -f docker-compose.yml -f docker-compose.local.yml build
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d

docker compose -f docker-compose.yml -f docker-compose.local.yml ps
```

URLs locales :

- Storefront : `http://localhost:3000`
- OWNER : `http://localhost:3001`
- API health : `http://localhost:8000/api/v1/health/`
- Django admin : `http://localhost:8000/admin/`

Logs utiles :

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f api
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f storefront
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f owner
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f worker
```

Arrêter sans supprimer les données :

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

Ne pas utiliser `down -v` si les volumes contiennent des données à conserver.

## Coolify

Créer une application depuis le dépôt GitHub et sélectionner le build pack Docker Compose.

Utiliser :

- branche : `main` après validation et fusion
- base directory : `/`
- Docker Compose location : `/docker-compose.yml`

Configurer trois domaines publics dans Coolify :

- storefront → service `storefront`, port interne `3000`
- OWNER → service `owner`, port interne `3001`
- API → service `api`, port interne `8080`

Exemple de structure :

- `https://votre-domaine.tld`
- `https://admin.votre-domaine.tld`
- `https://api.votre-domaine.tld`

## Variables de production importantes

Ne jamais enregistrer les secrets dans Git.

Dans Coolify, définir au minimum :

```text
DJANGO_SECRET_KEY=<secret long et aléatoire>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.votre-domaine.tld,api

DB_NAME=sugu_kura_db
DB_USER=sugu_kura_user
DB_PASSWORD=<mot de passe fort>

CORS_ALLOWED_ORIGINS=https://votre-domaine.tld,https://admin.votre-domaine.tld
CSRF_TRUSTED_ORIGINS=https://votre-domaine.tld,https://admin.votre-domaine.tld

DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_TRUST_PROXY_SSL_HEADER=True
DJANGO_SECURE_HSTS_SECONDS=31536000
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
DJANGO_SECURE_HSTS_PRELOAD=False

NEXT_PUBLIC_API_URL=https://api.votre-domaine.tld/api/v1
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld
NEXT_PUBLIC_STORE_PHONE=<numéro public>
NEXT_PUBLIC_STORE_WHATSAPP=<numéro WhatsApp sans espaces>
NEXT_PUBLIC_STORE_EMAIL=<email public>

WEBPUSH_VAPID_PUBLIC_KEY=<clé publique>
WEBPUSH_VAPID_PRIVATE_KEY=<clé privée>
WEBPUSH_VAPID_SUBJECT=mailto:<email technique>
```

`NEXT_PUBLIC_*` est intégré pendant le build Next.js : toute modification de ces valeurs doit être suivie d'un nouveau déploiement/build.

## Données existantes

Le Docker Compose crée une nouvelle base PostgreSQL et un nouveau volume média. Les données actuelles du PC ne sont pas automatiquement copiées.

Avant la mise en production réelle, il faut :

1. exporter la base PostgreSQL locale avec `pg_dump` ;
2. sauvegarder `backend/media/` ;
3. restaurer la base dans le PostgreSQL de production ;
4. copier les médias dans le volume `media-data` ;
5. vérifier produits, variantes, stock, commandes, publicités, partenaires, profil OWNER et images.

Ne jamais supprimer la base locale ou `backend/media/` avant que la restauration production soit vérifiée.

## Vérification finale après déploiement

- `/api/v1/health/` retourne HTTP 200 et `database: ok`
- login OWNER fonctionne
- photo profil et logo OWNER s'affichent
- création/modification produit avec image fonctionne
- publicité immédiate et programmée fonctionne
- storefront affiche catégories, produits, promotions et partenaires
- panier et checkout fonctionnent
- suivi de commande fonctionne
- notifications Web Push peuvent être activées en HTTPS
- média reste présent après un redéploiement
- base PostgreSQL reste présente après un redéploiement

## Sauvegardes obligatoires avant ouverture publique

Mettre en place une sauvegarde indépendante de :

- PostgreSQL
- volume `media-data`

Tester également une restauration. Une sauvegarde non restaurable n'est pas considérée comme validée.
