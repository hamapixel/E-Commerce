"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Trash2,
} from "lucide-react";

import Swal from "sweetalert2";

import {
  deleteCategoryAction,
} from "@/actions/catalogue";


interface CategoryDeleteButtonProps {
  categoryId: number;
  categoryName: string;
}


export function CategoryDeleteButton({
  categoryId,
  categoryName,
}: CategoryDeleteButtonProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function handleDelete() {
    const result =
      await Swal.fire({
        icon: "warning",
        title: "Supprimer cette catégorie ?",
        text:
          `${categoryName} sera supprimée uniquement si elle n'est utilisée par aucun produit ni sous-catégorie.`,
        showCancelButton: true,
        confirmButtonText:
          "Oui, supprimer",
        cancelButtonText:
          "Annuler",
        confirmButtonColor:
          "#dc2626",
        cancelButtonColor:
          "#0b4da2",
        reverseButtons: true,
      });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      await deleteCategoryAction(
        categoryId,
      );

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          "Catégorie supprimée",
        showConfirmButton:
          false,
        timer: 1500,
        timerProgressBar:
          true,
      });

      router.refresh();
    }
    catch (error) {
      setLoading(false);

      await Swal.fire({
        icon: "error",
        title:
          "Suppression impossible",
        text:
          error instanceof Error
            ? error.message
            : (
                "Cette catégorie est encore utilisée. Désactivez-la plutôt."
              ),
        confirmButtonText:
          "Fermer",
        confirmButtonColor:
          "#0b4da2",
      });
    }
  }


  return (
    <button
      type="button"
      onClick={
        () =>
          void handleDelete()
      }
      disabled={
        loading
      }
      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    >
      <Trash2
        size={15}
      />

      {loading
        ? "Suppression..."
        : "Supprimer"}
    </button>
  );
}
