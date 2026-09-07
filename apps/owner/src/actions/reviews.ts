"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ownerFetch,
} from "@/lib/backend";


export async function setReviewPublishedAction(
  reviewId: number,
  published: boolean,
) {
  await ownerFetch(
    `/owner/reviews/${reviewId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_approved: published,
      }),
    },
  );

  revalidatePath(
    "/avis",
  );
}


export async function deleteReviewAction(
  reviewId: number,
) {
  await ownerFetch(
    `/owner/reviews/${reviewId}/`,
    {
      method: "DELETE",
    },
  );

  revalidatePath(
    "/avis",
  );
}
