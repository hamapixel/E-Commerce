# SUGU KURA

SUGU KURA est une plateforme e-commerce professionnelle
destinée à une boutique unique.

Ce projet n'est pas un SaaS multi-boutiques.

Il possède deux grandes interfaces :

1. storefront public destiné aux clients ;
2. administration privée destinée au propriétaire
   et aux utilisateurs autorisés.

Une API backend constitue la source de vérité.

---

# Technologies

## Backend

- Python 3.14
- Django 5.2
- Django REST Framework
- PostgreSQL 18
- Redis
- Celery

## Frontend public

- Next.js 16
- TypeScript
- Tailwind CSS
- App Router
- Server Components
- TanStack Query lorsque nécessaire
- Zustand

## Administration

L'administration sera également développée avec une
interface web moderne séparée.

---

# Architecture

```text
sugu_kura/
├── apps/
│   ├── storefront/
│   └── admin/
├── backend/
├── docs/
├── scripts/
├── .editorconfig
├── .gitignore
└── README.md