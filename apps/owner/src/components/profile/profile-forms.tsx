"use client";

import {
  KeyRound,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  changeOwnerPasswordAction,
  updateOwnerProfileAction,
  type ProfileActionState,
} from "@/actions/profile";
import {
  ownerMediaUrl,
} from "@/lib/media";
import type {
  OwnerUser,
} from "@/types/owner";


const initialState: ProfileActionState = {
  status: "idle",
  message: "",
};


function Feedback({
  state,
}: {
  state: ProfileActionState;
}) {
  if (
    state.status === "idle"
    || !state.message
  ) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </div>
  );
}


export function OwnerProfileForms({
  user,
}: {
  user: OwnerUser;
}) {
  const [
    profileState,
    profileAction,
    profilePending,
  ] = useActionState(
    updateOwnerProfileAction,
    initialState,
  );

  const [
    passwordState,
    passwordAction,
    passwordPending,
  ] = useActionState(
    changeOwnerPasswordAction,
    initialState,
  );

  const passwordFormRef =
    useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (
      passwordState.status
      === "success"
    ) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState]);

  const profilePhoto =
    ownerMediaUrl(
      user.profile_photo_url,
    );

  const storeLogo =
    ownerMediaUrl(
      user.store_logo_url,
    );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0b4da2]">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              Informations du propriétaire
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Modifiez votre nom, vos coordonnées, votre photo et le logo affiché dans la console OWNER.
            </p>
          </div>
        </div>

        <form
          action={profileAction}
          className="mt-6 space-y-6"
          encType="multipart/form-data"
        >
          <Feedback state={profileState} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white bg-cover bg-center text-[#0b4da2]"
                  style={
                    profilePhoto
                      ? {
                          backgroundImage:
                            `url(${profilePhoto})`,
                        }
                      : undefined
                  }
                >
                  {!profilePhoto && (
                    <UserRound size={30} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">
                    Photo de profil
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    JPG, PNG ou WebP. Maximum 5 Mo.
                  </p>
                </div>
              </div>

              <input
                name="profile_photo"
                type="file"
                accept="image/*"
                className="mt-4 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs"
              />

              {profilePhoto && (
                <label className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input
                    name="remove_profile_photo"
                    type="checkbox"
                  />
                  Supprimer la photo actuelle
                </label>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white bg-contain bg-center bg-no-repeat text-[#ff6b00]"
                  style={
                    storeLogo
                      ? {
                          backgroundImage:
                            `url(${storeLogo})`,
                        }
                      : undefined
                  }
                >
                  {!storeLogo && (
                    <Store size={30} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">
                    Logo SUGU KURA
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Utilisé dans votre espace de gestion OWNER.
                  </p>
                </div>
              </div>

              <input
                name="store_logo"
                type="file"
                accept="image/*"
                className="mt-4 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs"
              />

              {storeLogo && (
                <label className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input
                    name="remove_store_logo"
                    type="checkbox"
                  />
                  Supprimer le logo actuel
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-xs font-black text-slate-600">
                Prénom
              </span>
              <input
                name="first_name"
                defaultValue={user.first_name}
                autoComplete="given-name"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label>
              <span className="text-xs font-black text-slate-600">
                Nom
              </span>
              <input
                name="last_name"
                defaultValue={user.last_name}
                autoComplete="family-name"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label>
              <span className="text-xs font-black text-slate-600">
                Nom d’utilisateur
              </span>
              <input
                name="username"
                required
                defaultValue={user.username}
                autoComplete="username"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
              <span className="mt-1 block text-[10px] text-slate-400">
                Si vous le changez, utilisez le nouveau nom lors de votre prochaine connexion.
              </span>
            </label>

            <label>
              <span className="text-xs font-black text-slate-600">
                E-mail
              </span>
              <input
                name="email"
                type="email"
                required
                defaultValue={user.email}
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label>
              <span className="text-xs font-black text-slate-600">
                Téléphone
              </span>
              <input
                name="phone"
                type="tel"
                defaultValue={user.phone ?? ""}
                autoComplete="tel"
                placeholder="+223..."
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label>
              <span className="text-xs font-black text-slate-600">
                WhatsApp
              </span>
              <input
                name="whatsapp"
                type="tel"
                defaultValue={user.whatsapp ?? ""}
                placeholder="+223..."
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={profilePending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/15 transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save size={17} />
            {profilePending
              ? "Enregistrement..."
              : "Enregistrer le profil"}
          </button>
        </form>
      </section>

      <section className="h-fit rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <KeyRound size={22} />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              Sécurité du compte
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Changez votre mot de passe sans quitter la console.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0"
          />
          <p className="text-xs leading-5">
            Après le changement, l’ancien jeton de connexion est supprimé et une nouvelle session sécurisée est créée.
          </p>
        </div>

        <form
          ref={passwordFormRef}
          action={passwordAction}
          className="mt-5 space-y-4"
        >
          <Feedback state={passwordState} />

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Mot de passe actuel
            </span>
            <input
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#0b4da2] focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Nouveau mot de passe
            </span>
            <input
              name="new_password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#0b4da2] focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Confirmer le nouveau mot de passe
            </span>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#0b4da2] focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <p className="text-[11px] leading-5 text-slate-400">
            Minimum 12 caractères. Évitez un mot de passe courant ou uniquement numérique.
          </p>

          <button
            type="submit"
            disabled={passwordPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b4da2] px-5 text-sm font-black text-white transition hover:bg-[#083b7f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={17} />
            {passwordPending
              ? "Modification..."
              : "Changer le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
