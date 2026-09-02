from django import forms
from django.core.exceptions import ValidationError

from .models import InventoryItem


class InventoryItemAdminForm(forms.ModelForm):
    """
    Formulaire d'administration du stock.

    On ne modifie jamais directement
    quantity_on_hand ou quantity_reserved.

    L'administrateur saisit un ajustement :

        10   -> ajoute 10
        50   -> ajoute 50
        -3   -> retire 3

    Le véritable mouvement sera ensuite effectué
    par inventory.services afin de conserver
    l'historique.
    """

    stock_adjustment = forms.IntegerField(
        required=False,
        initial=0,
        label="Ajouter / retirer du stock",
        help_text=(
            "Exemples : 10 pour ajouter 10 pièces, "
            "-3 pour retirer 3 pièces. "
            "Laissez 0 si vous ne voulez pas modifier le stock."
        ),
    )

    movement_reference = forms.CharField(
        required=False,
        max_length=120,
        label="Référence du mouvement",
        help_text=(
            "Exemple : APPRO-001, FACTURE-025, INVENTAIRE-2026."
        ),
    )

    movement_note = forms.CharField(
        required=False,
        label="Note",
        widget=forms.Textarea(
            attrs={
                "rows": 3,
                "placeholder": (
                    "Exemple : Réception fournisseur Samsung."
                ),
            }
        ),
    )

    class Meta:
        model = InventoryItem

        fields = (
            "product",
            "variant",
            "low_stock_threshold",
        )

    def clean_stock_adjustment(self):
        adjustment = (
            self.cleaned_data.get(
                "stock_adjustment"
            )
            or 0
        )

        if adjustment == 0:
            return 0

        if adjustment < 0:
            quantity_to_remove = abs(
                adjustment
            )

            if not self.instance.pk:
                raise ValidationError(
                    "Impossible de retirer du stock "
                    "pendant la création d'une nouvelle fiche."
                )

            available = (
                self.instance.quantity_available
            )

            if quantity_to_remove > available:
                raise ValidationError(
                    (
                        "Stock disponible insuffisant. "
                        f"Disponible : {available}."
                    )
                )

        return adjustment