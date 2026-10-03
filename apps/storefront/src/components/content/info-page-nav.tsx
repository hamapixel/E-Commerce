import Link from "next/link";

import {
  ArrowRight,
  CircleHelp,
  FileText,
  Info,
  LockKeyhole,
  MessageCircle,
  Truck,
} from "lucide-react";


const links = [
  {
    href: "/contact",
    title: "Nous contacter",
    description: "Téléphone, WhatsApp et assistance client.",
    icon: MessageCircle,
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "Les réponses aux questions les plus fréquentes.",
    icon: CircleHelp,
  },
  {
    href: "/livraison-retours",
    title: "Livraison et retours",
    description: "Livraison, retrait et demandes de retour.",
    icon: Truck,
  },
  {
    href: "/a-propos",
    title: "À propos",
    description: "Découvrez l'approche et les services SUGU KURA.",
    icon: Info,
  },
  {
    href: "/conditions-generales",
    title: "Conditions générales",
    description: "Les règles principales d'utilisation et de commande.",
    icon: FileText,
  },
  {
    href: "/confidentialite",
    title: "Confidentialité & cookies",
    description: "Comment les informations sont utilisées et protégées.",
    icon: LockKeyhole,
  },
];


export function InfoPageNav() {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b00]">
          Informations utiles
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
          Accédez rapidement à nos pages d&apos;aide
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[118px] items-start gap-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2] transition group-hover:bg-[#0b4da2] group-hover:text-white">
                <Icon size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-slate-950">
                    {item.title}
                  </h3>

                  <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#ff6b00]"
                  />
                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
