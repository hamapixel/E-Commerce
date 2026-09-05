from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category


CATALOG_STRUCTURE = [
    {
        "name": "Téléphones & Smartphones",
        "slug": "telephones-smartphones",
        "description": "Smartphones, téléphones simples et appareils reconditionnés.",
        "children": [
            "Smartphones",
            "Téléphones simples",
            "Téléphones reconditionnés",
        ],
    },
    {
        "name": "Accessoires Téléphone",
        "slug": "accessoires-telephone",
        "description": "Coques, chargeurs, câbles, protections et accessoires mobiles.",
        "children": [
            "Coques & protections",
            "Verres trempés",
            "Chargeurs téléphone",
            "Câbles USB",
            "Power banks",
            "Supports téléphone",
            "Adaptateurs téléphone",
        ],
    },
    {
        "name": "Ordinateurs & PC",
        "slug": "ordinateurs-pc",
        "description": "Ordinateurs portables, PC de bureau, mini PC, tablettes et écrans.",
        "children": [
            "Ordinateurs portables",
            "PC de bureau",
            "Mini PC",
            "Tablettes",
            "Écrans & moniteurs",
        ],
    },
    {
        "name": "Accessoires PC",
        "slug": "accessoires-pc",
        "description": "Périphériques, chargeurs, hubs, supports et accessoires informatiques.",
        "children": [
            "Souris",
            "Claviers",
            "Webcams",
            "Hubs USB",
            "Sacoches PC",
            "Chargeurs PC",
            "Supports PC",
            "Refroidisseurs PC",
            "Adaptateurs PC",
        ],
    },
    {
        "name": "Gaming & Jeux",
        "slug": "gaming-jeux",
        "description": "Consoles, manettes, accessoires gaming et jeux vidéo.",
        "children": [
            "Consoles",
            "Manettes",
            "Casques gaming",
            "Claviers gaming",
            "Souris gaming",
            "Tapis gaming",
            "Accessoires consoles",
            "Jeux vidéo",
        ],
    },
    {
        "name": "Audio & Son",
        "slug": "audio-son",
        "description": "Écouteurs, casques, enceintes, microphones et équipements audio.",
        "children": [
            "Écouteurs Bluetooth",
            "Casques audio",
            "Enceintes Bluetooth",
            "Microphones",
            "Barres de son",
        ],
    },
    {
        "name": "TV & Multimédia",
        "slug": "tv-multimedia",
        "description": "Téléviseurs, TV Box, décodeurs, télécommandes et connectique multimédia.",
        "children": [
            "Téléviseurs",
            "Android TV Box",
            "Décodeurs",
            "Télécommandes",
            "Câbles HDMI",
        ],
    },
    {
        "name": "Caméras & Sécurité",
        "slug": "cameras-securite",
        "description": "Vidéosurveillance, alarmes, interphones et accessoires de sécurité.",
        "children": [
            "Caméras Wi-Fi",
            "Caméras CCTV",
            "DVR & NVR",
            "Alarmes",
            "Interphones",
            "Accessoires caméra",
        ],
    },
    {
        "name": "Réseau & Internet",
        "slug": "reseau-internet",
        "description": "Routeurs, modems, répéteurs, switches et accessoires réseau.",
        "children": [
            "Routeurs Wi-Fi",
            "Modems",
            "Répéteurs Wi-Fi",
            "Switches réseau",
            "Câbles RJ45",
            "Adaptateurs Wi-Fi",
        ],
    },
    {
        "name": "Électricité & Éclairage",
        "slug": "electricite-eclairage",
        "description": "Ampoules, projecteurs, prises, rallonges et équipements électriques.",
        "children": [
            "Ampoules LED",
            "Projecteurs",
            "Prises",
            "Multiprises",
            "Rallonges",
            "Interrupteurs",
        ],
    },
    {
        "name": "Solaire & Énergie",
        "slug": "solaire-energie",
        "description": "Panneaux, batteries, onduleurs, convertisseurs et régulateurs solaires.",
        "children": [
            "Panneaux solaires",
            "Batteries lithium",
            "Batteries gel",
            "Onduleurs",
            "Convertisseurs",
            "Régulateurs solaires",
        ],
    },
    {
        "name": "Maison & Électroménager",
        "slug": "maison-electromenager",
        "description": "Équipements pour la maison et petit électroménager.",
        "children": [
            "Ventilateurs",
            "Humidificateurs",
            "Réfrigérateurs",
            "Mixeurs",
            "Bouilloires",
            "Petits électroménagers",
        ],
    },
    {
        "name": "Montres & Objets Connectés",
        "slug": "montres-objets-connectes",
        "description": "Smartwatches, bracelets et accessoires connectés.",
        "children": [
            "Smartwatches",
            "Bracelets connectés",
            "Accessoires smartwatch",
        ],
    },
    {
        "name": "Batteries & Alimentation",
        "slug": "batteries-alimentation",
        "description": "Piles, batteries, chargeurs et solutions d'alimentation.",
        "children": [
            "Piles",
            "Batteries",
            "Chargeurs universels",
            "Adaptateurs secteur",
            "Onduleurs UPS",
        ],
    },
    {
        "name": "Câbles & Connectique",
        "slug": "cables-connectique",
        "description": "Câbles et adaptateurs pour téléphone, PC, audio, vidéo et réseau.",
        "children": [
            "USB-C",
            "Lightning",
            "Micro-USB",
            "HDMI",
            "VGA",
            "Audio AUX",
            "RJ45",
            "Adaptateurs",
        ],
    },
]


class Command(BaseCommand):
    help = (
        "Crée automatiquement les catégories et sous-catégories "
        "recommandées pour SUGU KURA sans supprimer les catégories existantes."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        created_roots = 0
        created_children = 0
        reused = 0

        for root_order, item in enumerate(
            CATALOG_STRUCTURE,
            start=1,
        ):
            root = Category.objects.filter(
                slug=item["slug"],
            ).first()

            if root is None:
                root = Category.objects.filter(
                    name__iexact=item["name"],
                    parent__isnull=True,
                ).first()

            if root is None:
                root = Category.objects.create(
                    name=item["name"],
                    slug=item["slug"],
                    description=item["description"],
                    parent=None,
                    display_order=root_order,
                    is_active=True,
                    is_featured_home=True,
                )
                created_roots += 1
            else:
                reused += 1

            for child_order, child_name in enumerate(
                item["children"],
                start=1,
            ):
                child = Category.objects.filter(
                    name__iexact=child_name,
                    parent=root,
                ).first()

                if child is None:
                    Category.objects.create(
                        name=child_name,
                        parent=root,
                        display_order=child_order,
                        is_active=True,
                    )
                    created_children += 1
                else:
                    reused += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Catégories SUGU KURA prêtes : "
                f"{created_roots} principales créées, "
                f"{created_children} sous-catégories créées, "
                f"{reused} catégories existantes conservées."
            )
        )
