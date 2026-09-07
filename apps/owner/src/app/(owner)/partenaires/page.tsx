import Image from "next/image";

import {
  ExternalLink,
  Handshake,
  ImagePlus,
  Power,
  Save,
  Trash2,
} from "lucide-react";

import {
  createPartnerAction,
  deletePartnerAction,
  togglePartnerAction,
  updatePartnerAction,
} from "@/actions/partners";

import {
  ownerFetch,
} from "@/lib/backend";


interface OwnerPartner {
  id: number;
  name: string;
  logo: string;
  description: string;
  website: string;
  page_url: string;
  effective_link: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


interface PartnersPageProps {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}


export default async function PartnersPage({
  searchParams,
}: PartnersPageProps) {
  const params = await searchParams;

  const partners =
    await ownerFetch<OwnerPartner[]>(
      "/owner/partners/",
    );

  const activeCount =
    partners.filter(
      (partner) =>
        partner.is_active,
    ).length;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Visibilité & confiance
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Partenaires
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajoutez les entreprises partenaires et leurs logos. Les partenaires actifs apparaissent automatiquement dans le carrousel infini de la boutique.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
              Total
            </span>
            <strong className="mt-1 block text-xl font-black text-slate-950">
              {partners.length}
            </strong>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-600">
              Actifs
            </span>
            <strong className="mt-1 block text-xl font-black text-emerald-700">
              {activeCount}
            </strong>
          </div>
        </div>
      </div>

      {params.success && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {params.success}
        </div>
      )}

      {params.error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {params.error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
            <ImagePlus size={19} />
          </div>

          <div>
            <h2 className="font-black text-slate-950">
              Ajouter un partenaire
            </h2>
            <p className="text-xs text-slate-400">
              Le logo est obligatoire à la création.
            </p>
          </div>
        </div>

        <form
          action={createPartnerAction}
          className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4"
        >
          <label>
            <span className="text-[11px] font-black text-slate-700">
              Nom du partenaire *
            </span>
            <input
              name="name"
              required
              maxLength={180}
              placeholder="Ex. MSF SARL"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-[11px] font-black text-slate-700">
              Logo *
            </span>
            <input
              name="logo"
              type="file"
              accept="image/*"
              required
              className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
          </label>

          <label>
            <span className="text-[11px] font-black text-slate-700">
              Site web
            </span>
            <input
              name="website"
              type="url"
              placeholder="https://..."
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-[11px] font-black text-slate-700">
              Ordre
            </span>
            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label className="md:col-span-2 xl:col-span-3">
            <span className="text-[11px] font-black text-slate-700">
              Description
            </span>
            <input
              name="description"
              maxLength={500}
              placeholder="Petite présentation du partenaire"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-[11px] font-black text-slate-700">
              Lien interne
            </span>
            <input
              name="page_url"
              placeholder="/page-partenaire"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-4 md:col-span-1">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#ff6b00]"
            />
            <span className="text-xs font-black text-slate-700">
              Afficher sur la boutique
            </span>
          </label>

          <div className="md:col-span-1 xl:col-span-3 xl:flex xl:justify-end">
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-xs font-black text-white transition hover:bg-[#e86100] xl:w-auto"
            >
              <Handshake size={16} />
              Ajouter le partenaire
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {partners.map((partner) => (
          <article
            key={partner.id}
            className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 p-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-black text-slate-950">
                    {partner.name}
                  </h2>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                      partner.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {partner.is_active
                      ? "ACTIF"
                      : "MASQUÉ"}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Ordre : {partner.display_order}
                </p>

                {partner.effective_link && (
                  <a
                    href={partner.effective_link}
                    target={
                      partner.effective_link.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-[#0b4da2]"
                  >
                    Voir la destination
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <form
              action={updatePartnerAction.bind(
                null,
                partner.id,
              )}
              className="grid gap-3 p-4 sm:grid-cols-2"
            >
              <label>
                <span className="text-[10px] font-black text-slate-600">
                  Nom
                </span>
                <input
                  name="name"
                  required
                  maxLength={180}
                  defaultValue={partner.name}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label>
                <span className="text-[10px] font-black text-slate-600">
                  Remplacer le logo
                </span>
                <input
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="mt-1 block h-10 w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[10px]"
                />
              </label>

              <label>
                <span className="text-[10px] font-black text-slate-600">
                  Site web
                </span>
                <input
                  name="website"
                  type="url"
                  defaultValue={partner.website}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label>
                <span className="text-[10px] font-black text-slate-600">
                  Lien interne
                </span>
                <input
                  name="page_url"
                  defaultValue={partner.page_url}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-[10px] font-black text-slate-600">
                  Description
                </span>
                <input
                  name="description"
                  maxLength={500}
                  defaultValue={partner.description}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label>
                <span className="text-[10px] font-black text-slate-600">
                  Ordre
                </span>
                <input
                  name="display_order"
                  type="number"
                  min="0"
                  defaultValue={partner.display_order}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={partner.is_active}
                  className="h-4 w-4 accent-[#ff6b00]"
                />
                <span className="text-[10px] font-black text-slate-600">
                  Afficher
                </span>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[11px] font-black text-white"
              >
                <Save size={14} />
                Enregistrer
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4">
              <form
                action={togglePartnerAction.bind(
                  null,
                  partner.id,
                )}
              >
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <Power size={14} />
                  {partner.is_active
                    ? "Masquer"
                    : "Afficher"}
                </button>
              </form>

              <form
                action={deletePartnerAction.bind(
                  null,
                  partner.id,
                )}
              >
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-[11px] font-black text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>

      {partners.length === 0 && (
        <div className="mt-6 rounded-[22px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Aucun partenaire pour le moment. Ajoutez le premier logo ci-dessus.
        </div>
      )}
    </>
  );
}
