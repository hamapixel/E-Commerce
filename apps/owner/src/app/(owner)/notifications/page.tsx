import {
  BellRing,
} from "lucide-react";

import PushManager from "@/components/notifications/push-manager";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatDate,
} from "@/lib/format";

import type {
  NotificationHistoryItem,
  PushPublicKey,
} from "@/types/notification";


export default async function NotificationsPage() {
  const [
    keyData,
    history,
  ] = await Promise.all([
    ownerFetch<
      PushPublicKey
    >(
      "/owner/notifications/public-key/",
    ),

    ownerFetch<
      NotificationHistoryItem[]
    >(
      "/owner/notifications/history/",
    ),
  ]);

  return (
    <>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          SUGU KURA
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Gérez les alertes importantes
          reçues sur vos appareils.
        </p>
      </div>

      <div className="mt-7">
        <PushManager
          publicKey={
            keyData.public_key
          }
        />
      </div>

      <section className="mt-7 rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <BellRing
            size={20}
            className="text-[#0b4da2]"
          />

          <div>
            <h2 className="font-black text-slate-950">
              Historique
            </h2>

            <p className="text-xs text-slate-400">
              50 dernières notifications.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucune notification pour le moment.
          </div>
        ) : (
          <div>
            {history.map(
              (
                notification,
              ) => (
                <article
                  key={
                    notification.id
                  }
                  className="border-b border-slate-100 p-5 last:border-b-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-slate-950">
                          {
                            notification.title
                          }
                        </strong>

                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-[#0b4da2]">
                          {
                            notification.kind_label
                          }
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {
                          notification.body
                        }
                      </p>

                      <p className="mt-2 text-[10px] text-slate-400">
                        {formatDate(
                          notification.created_at,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          notification.status ===
                          "SENT"
                            ? "bg-emerald-50 text-emerald-600"
                            : notification.status ===
                              "FAILED"
                            ? "bg-red-50 text-red-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {
                          notification.status_label
                        }
                      </span>

                      <p className="mt-2 text-[10px] text-slate-400">
                        Envoyées :{" "}
                        {
                          notification.sent_count
                        }
                        {" • "}
                        Échecs :{" "}
                        {
                          notification.failed_count
                        }
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}