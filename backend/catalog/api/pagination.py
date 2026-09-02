from rest_framework.pagination import PageNumberPagination


class ProductPagination(PageNumberPagination):
    """
    Pagination publique du catalogue SUGU KURA.

    Par défaut :
    24 produits.

    Maximum :
    100 produits par requête.
    """

    page_size = 24

    page_size_query_param = "page_size"

    max_page_size = 100