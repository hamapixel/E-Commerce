import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  loginAction,
} from "@/actions/owner";


interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}


export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const {
    error,
  } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
          <LockKeyhole
            size={27}
          />
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          SUGU KURA
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Console propriétaire
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Accédez aux commandes,
          paiements, stocks et
          performances de votre boutique.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <form
          action={
            loginAction
          }
          className="mt-7 space-y-4"
        >
          <label className="block text-sm font-bold">
            Utilisateur

            <input
              name="username"
              required
              autoComplete="username"
              placeholder="TRAORE"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#ff6b00]"
            />
          </label>

          <label className="block text-sm font-bold">
            Mot de passe

            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#ff6b00]"
            />
          </label>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#ff6b00] font-black text-white transition hover:bg-[#e85f00]"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 flex gap-2 rounded-xl bg-emerald-50 p-3">
          <ShieldCheck
            size={18}
            className="shrink-0 text-emerald-600"
          />

          <p className="text-[11px] leading-5 text-emerald-800">
            Cette interface est réservée
            exclusivement au propriétaire
            SUGU KURA.
          </p>
        </div>
      </section>
    </main>
  );
}