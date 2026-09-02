from orders.models import Order
from django.db.models import Count

valid = [
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SHIPPED",
    "DELIVERED",
]

qs = (
    Order.objects
    .annotate(n=Count("items"))
    .filter(
        status__in=valid,
        n__gte=2,
    )
)

print("COMMANDES VALIDES AVEC 2+ PRODUITS =", qs.count())

for order in qs:
    print()
    print(
        "COMMANDE:",
        order.order_number,
        "- STATUT:",
        order.status,
        "- ITEMS:",
        order.n,
    )

    for item in order.items.select_related("product").all():
        stock = sum(
            inventory.quantity_available
            for inventory
            in item.product.inventory_items.all()
        )

        print(
            "ID:",
            item.product.id,
            "- PRODUIT:",
            item.product.name,
            "- STATUT:",
            item.product.status,
            "- STOCK:",
            stock,
            "- SLUG:",
            item.product.slug,
        )
