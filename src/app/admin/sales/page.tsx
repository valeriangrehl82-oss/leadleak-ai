import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";

const salesLinks = [
  {
    href: "/sales-script",
    title: "5-Minuten Demo-Leitfaden",
    description: "Live-Struktur für ein kurzes Gespräch mit Schweizer Garagen.",
  },
  {
    href: "/call-checklist",
    title: "Call-Checkliste",
    description: "Vorbereitung, Kernfragen und nächste Aktionen für echte Telefonate.",
  },
  {
    href: "/pilot-offer",
    title: "Pilot-Angebot",
    description: "Einseitiges Angebot für den 14-Tage-Pilot, geeignet zum Zeigen oder Drucken.",
  },
  {
    href: "/objections",
    title: "Einwände",
    description: "Kurze, sachliche Antworten für typische Rückfragen im Verkaufsgespräch.",
  },
];

export default async function AdminSalesPage() {
  await requireAdminPage();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Admin</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Sales-Unterlagen</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Interne Gesprächsseiten für Pilotverkauf, Einwandbehandlung und Abschlussgespräche.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {salesLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]"
            >
              <h2 className="text-xl font-semibold text-navy-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-5 text-sm font-semibold text-swiss-green">Öffnen</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
