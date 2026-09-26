import {
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  OwnerProfileForms,
} from "@/components/profile/profile-forms";
import {
  ownerFetch,
} from "@/lib/backend";
import type {
  OwnerUser,
} from "@/types/owner";


export default async function OwnerProfilePage() {
  const user =
    await ownerFetch<OwnerUser>(
      "/owner/auth/profile/",
    );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Mon compte
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Profil propriétaire
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Gérez vos informations personnelles, votre photo, le logo de la boutique et la sécurité de votre compte OWNER.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          <ShieldCheck
            size={20}
            className="shrink-0"
          />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider">
              Compte sécurisé
            </p>
            <p className="mt-0.5 text-xs font-bold">
              Rôle : {user.role}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0b4da2] shadow-sm">
            <UserRound size={21} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              {user.display_name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <OwnerProfileForms
          user={user}
        />
      </div>
    </div>
  );
}
