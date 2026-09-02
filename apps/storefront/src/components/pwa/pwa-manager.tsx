"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  X,
} from "lucide-react";


interface InstallChoice {
  outcome:
    | "accepted"
    | "dismissed";

  platform:
    string;
}


interface BeforeInstallPromptEvent
  extends Event {
  prompt:
    () => Promise<void>;

  userChoice:
    Promise<InstallChoice>;
}


interface NavigatorWithStandalone
  extends Navigator {
  standalone?:
    boolean;
}


const DISMISS_KEY =
  "sugu-kura-pwa-install-dismissed";


function isStandaloneMode() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const standaloneNavigator =
    navigator as NavigatorWithStandalone;

  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches
    ||
    standaloneNavigator
      .standalone === true
  );
}


function isIosDevice() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  return /iphone|ipad|ipod/i.test(
    navigator.userAgent,
  );
}


export function PwaManager() {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] = useState<
    BeforeInstallPromptEvent
    | null
  >(null);

  const [
    showBanner,
    setShowBanner,
  ] = useState(
    false,
  );

  const [
    showIosHelp,
    setShowIosHelp,
  ] = useState(
    false,
  );


  useEffect(
    () => {
      /*
       * En développement, on évite volontairement
       * d'installer un Service Worker pour ne pas
       * conserver des fichiers obsolètes pendant
       * le travail avec next dev.
       *
       * Pour tester la vraie PWA :
       * npm run build
       * npm run start
       */
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        return;
      }

      if (
        "serviceWorker"
        in navigator
      ) {
        const register =
          async () => {
            try {
              const registration =
                await navigator
                  .serviceWorker
                  .register(
                    "/sw.js",
                    {
                      scope:
                        "/",
                    },
                  );

              void registration.update();
            }
            catch (
              error
            ) {
              console.error(
                "SUGU KURA PWA : "
                + "échec de l'enregistrement "
                + "du Service Worker.",
                error,
              );
            }
          };

        if (
          document.readyState ===
          "complete"
        ) {
          void register();
        }
        else {
          window.addEventListener(
            "load",
            register,
            {
              once:
                true,
            },
          );
        }
      }

      if (
        isStandaloneMode()
      ) {
        return;
      }

      if (
        window.localStorage.getItem(
          DISMISS_KEY,
        ) ===
        "1"
      ) {
        return;
      }

      const handleInstallPrompt =
        (
          event:
            Event,
        ) => {
          event.preventDefault();

          setDeferredPrompt(
            event as BeforeInstallPromptEvent,
          );

          setShowIosHelp(
            false,
          );

          setShowBanner(
            true,
          );
        };

      const handleInstalled =
        () => {
          setDeferredPrompt(
            null,
          );

          setShowBanner(
            false,
          );

          window.localStorage.removeItem(
            DISMISS_KEY,
          );
        };

      window.addEventListener(
        "beforeinstallprompt",
        handleInstallPrompt,
      );

      window.addEventListener(
        "appinstalled",
        handleInstalled,
      );

      if (
        isIosDevice()
      ) {
        /*
         * React 19 / eslint-plugin-react-hooks :
         * on évite un setState synchrone directement
         * dans le corps de l'effet.
         *
         * Le callback différé s'exécute après
         * l'installation des abonnements.
         */
        window.setTimeout(
          () => {
            setShowIosHelp(
              true,
            );

            setShowBanner(
              true,
            );
          },
          0,
        );
      }

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleInstallPrompt,
        );

        window.removeEventListener(
          "appinstalled",
          handleInstalled,
        );
      };
    },
    [],
  );


  async function handleInstall() {
    if (
      deferredPrompt
    ) {
      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt
          .userChoice;

      setDeferredPrompt(
        null,
      );

      if (
        choice.outcome ===
        "accepted"
      ) {
        setShowBanner(
          false,
        );
      }

      return;
    }

    if (
      showIosHelp
    ) {
      return;
    }
  }


  function handleDismiss() {
    window.localStorage.setItem(
      DISMISS_KEY,
      "1",
    );

    setShowBanner(
      false,
    );
  }


  if (
    !showBanner
    ||
    isStandaloneMode()
  ) {
    return null;
  }


  return (
    <div className="fixed bottom-20 left-3 right-3 z-[90] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/40 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00] text-white">
          <Download
            size={20}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">
            Installer SUGU KURA
          </p>

          {showIosHelp
            &&
            !deferredPrompt
            ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sur iPhone :
                ouvrez Partager puis
                « Sur l&apos;écran
                d&apos;accueil ».
              </p>
            )
            : (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ajoutez la boutique à
                votre écran d&apos;accueil
                pour l&apos;ouvrir comme
                une application.
              </p>
            )
          }

          {deferredPrompt && (
            <button
              type="button"
              onClick={
                handleInstall
              }
              className="mt-3 min-h-10 rounded-xl bg-[#0b4da2] px-4 text-xs font-black text-white"
            >
              Installer maintenant
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={
            handleDismiss
          }
          aria-label="Fermer la proposition d'installation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X
            size={17}
          />
        </button>
      </div>
    </div>
  );
}
