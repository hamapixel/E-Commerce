"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  PushActionResponse,
  PushSubscriptionPayload,
} from "@/types/notification";


export async function savePushSubscriptionAction(
  payload:
    PushSubscriptionPayload,
) {
  const response =
    await ownerFetch<
      PushActionResponse
    >(
      (
        "/owner/notifications/"
        + "subscribe/"
      ),
      {
        method: "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  revalidatePath(
    "/notifications",
  );

  return response;
}


export async function unsubscribePushAction(
  endpoint: string,
) {
  const response =
    await ownerFetch<
      PushActionResponse
    >(
      (
        "/owner/notifications/"
        + "unsubscribe/"
      ),
      {
        method: "POST",

        body:
          JSON.stringify({
            endpoint,
          }),
      },
    );

  revalidatePath(
    "/notifications",
  );

  return response;
}


export async function sendTestPushAction() {
  const response =
    await ownerFetch<
      PushActionResponse
    >(
      (
        "/owner/notifications/"
        + "test/"
      ),
      {
        method: "POST",

        body:
          JSON.stringify({}),
      },
    );

  revalidatePath(
    "/notifications",
  );

  return response;
}