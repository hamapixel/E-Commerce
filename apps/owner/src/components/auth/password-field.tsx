"use client";

import {
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useState,
} from "react";


export function PasswordField() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  return (
    <label className="block text-sm font-bold">
      Mot de passe

      <div className="relative mt-2">
        <input
          name="password"
          type={
            visible
              ? "text"
              : "password"
          }
          required
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-[#ff6b00]"
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (value) => !value,
            )
          }
          aria-label={
            visible
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
          aria-pressed={
            visible
          }
          title={
            visible
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0b4da2] focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          {visible
            ? (
              <EyeOff
                size={18}
              />
            )
            : (
              <Eye
                size={18}
              />
            )}
        </button>
      </div>
    </label>
  );
}
