"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

import {
  savePushSubscriptionAction,
  sendTestPushAction,
  unsubscribePushAction,
} from "@/actions/notifications";


interface PushManagerProps {
  publicKey: string;
}


function urlBase64ToArrayBuffer(
  base64String: string,
): ArrayBuffer {
  const padding =
    "=".repeat(
      (
        4 -
        (
          base64String.length %
          4
        )
      ) %
        4,
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+",
      )
      .replace(
        /_/g,
        "/",
      );

  const rawData =
    window.atob(
      base64,
    );

  const outputArray =
    new Uint8Array(
      rawData.length,
    );

  for (
    let index = 0;
    index < rawData.length;
    index += 1
  ) {
    outputArray[index] =
      rawData.charCodeAt(
        index,
      );
  }

  return outputArray.buffer;
}


export default function PushManager({
  publicKey,
}: PushManagerProps) {
  const router =
    useRouter();

  const [
    supported,
    setSupported,
  ] = useState<
    boolean | null
  >(
    null,
  );

  const [
    enabled,
    setEnabled,
  ] = useState(
    false,
  );

  const [
    permission,
    setPermission,
  ] = useState<
    NotificationPermission
  >(
    "default",
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false,
  );

  const [
    message,
    setMessage,
  ] = useState(
    "",
  );


  useEffect(
    () => {
      let cancelled =
        false;

      async function initializePushState() {
        /*
         * On laisse d'abord React terminer
         * le cycle courant avant de mettre
         * à jour l'état depuis l'Effect.
         */
        await Promise.resolve();

        const isSupported =
          (
            "serviceWorker"
            in navigator
          )
          &&
          (
            "PushManager"
            in window
          )
          &&
          (
            "Notification"
            in window
          );

        if (cancelled) {
          return;
        }

        if (!isSupported) {
          setSupported(
            false,
          );

          return;
        }

        setSupported(
          true,
        );

        setPermission(
          Notification.permission,
        );

        try {
          const registration =
            await (
              navigator
              .serviceWorker
              .getRegistration()
            );

          if (cancelled) {
            return;
          }

          if (!registration) {
            setEnabled(
              false,
            );

            return;
          }

          const subscription =
            await (
              registration
              .pushManager
              .getSubscription()
            );

          if (cancelled) {
            return;
          }

          setEnabled(
            Boolean(
              subscription,
            ),
          );
        } catch {
          if (!cancelled) {
            setEnabled(
              false,
            );
          }
        }
      }

      void initializePushState();

      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  async function enablePush() {
    const isSupported =
      (
        "serviceWorker"
        in navigator
      )
      &&
      (
        "PushManager"
        in window
      )
      &&
      (
        "Notification"
        in window
      );

    if (!isSupported) {
      setSupported(
        false,
      );

      setMessage(
        "Ce navigateur ne supporte pas Web Push.",
      );

      return;
    }

    setLoading(
      true,
    );

    setMessage(
      "",
    );

    try {
      const registration =
        await (
          navigator
          .serviceWorker
          .register(
            "/push-sw.js",
            {
              scope: "/",
            },
          )
        );

      await (
        navigator
        .serviceWorker
        .ready
      );

      const result =
        await (
          Notification
          .requestPermission()
        );

      setPermission(
        result,
      );

      if (
        result !==
        "granted"
      ) {
        setMessage(
          "Autorisation de notification refusée.",
        );

        return;
      }

      let subscription =
        await (
          registration
          .pushManager
          .getSubscription()
        );

      if (!subscription) {
        subscription =
          await (
            registration
            .pushManager
            .subscribe({
              userVisibleOnly:
                true,

              applicationServerKey:
                urlBase64ToArrayBuffer(
                  publicKey,
                ),
            })
          );
      }

      const json =
        subscription.toJSON();

      const p256dh =
        json.keys?.p256dh;

      const auth =
        json.keys?.auth;

      if (
        !p256dh ||
        !auth
      ) {
        throw new Error(
          "Le navigateur n'a pas retourné les clés Push.",
        );
      }

      await (
        savePushSubscriptionAction({
          endpoint:
            subscription.endpoint,

          p256dh,

          auth,

          user_agent:
            navigator.userAgent,
        })
      );

      setEnabled(
        true,
      );

      setMessage(
        "Notifications activées avec succès.",
      );

      router.refresh();
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'activer les notifications.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  async function disablePush() {
    setLoading(
      true,
    );

    setMessage(
      "",
    );

    try {
      const registration =
        await (
          navigator
          .serviceWorker
          .getRegistration()
        );

      if (!registration) {
        setEnabled(
          false,
        );

        setMessage(
          "Notifications désactivées.",
        );

        return;
      }

      const subscription =
        await (
          registration
          .pushManager
          .getSubscription()
        );

      if (!subscription) {
        setEnabled(
          false,
        );

        setMessage(
          "Notifications désactivées.",
        );

        return;
      }

      const endpoint =
        subscription.endpoint;

      await (
        unsubscribePushAction(
          endpoint,
        )
      );

      await (
        subscription
        .unsubscribe()
      );

      setEnabled(
        false,
      );

      setMessage(
        "Notifications désactivées.",
      );

      router.refresh();
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de désactiver les notifications.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  async function testPush() {
    if (!enabled) {
      setMessage(
        "Active d'abord les notifications sur cet appareil.",
      );

      return;
    }

    setLoading(
      true,
    );

    setMessage(
      "",
    );

    try {
      const response =
        await (
          sendTestPushAction()
        );

      setMessage(
        response.detail,
      );

      router.refresh();
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Échec de la notification test.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  if (
    supported ===
    null
  ) {
    return (
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
          </div>

          <div>
            <strong className="text-slate-950">
              Vérification des notifications
            </strong>

            <p className="mt-1 text-xs text-slate-500">
              Vérification de la compatibilité
              de cet appareil.
            </p>
          </div>
        </div>
      </section>
    );
  }


  if (!supported) {
    return (
      <div className="rounded-[22px] border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3">
          <BellOff
            className="text-red-600"
          />

          <div>
            <strong className="text-red-800">
              Notifications indisponibles
            </strong>

            <p className="mt-1 text-xs text-red-600">
              Ce navigateur ne supporte pas
              le système Web Push utilisé.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              enabled
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-[#ff6b00]"
            }`}
          >
            {enabled ? (
              <CheckCircle2
                size={23}
              />
            ) : (
              <Bell
                size={23}
              />
            )}
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              Notifications sur cet appareil
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              Recevez les nouvelles commandes,
              paiements confirmés, stocks faibles
              et ruptures.
            </p>

            <p className="mt-2 text-xs font-bold text-slate-400">
              Permission navigateur :{" "}
              {permission}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            enabled
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {enabled
            ? "Activées"
            : "Désactivées"}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!enabled ? (
          <button
            type="button"
            onClick={
              enablePush
            }
            disabled={
              loading
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 py-2 text-xs font-black text-white transition hover:bg-[#e85f00] disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Bell
                size={16}
              />
            )}

            Activer les notifications
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={
                testPush
              }
              disabled={
                loading
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b4da2] px-4 py-2 text-xs font-black text-white transition hover:bg-[#083d82] disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={16}
                />
              )}

              Envoyer un test
            </button>

            <button
              type="button"
              onClick={
                disablePush
              }
              disabled={
                loading
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <BellOff
                size={16}
              />

              Désactiver
            </button>
          </>
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-600">
          {message}
        </div>
      )}
    </section>
  );
}