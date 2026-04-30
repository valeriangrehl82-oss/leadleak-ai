import { BulletList, InternalLinkCard } from "./components";

const commandLinks = [
  {
    href: "/admin/sales/call-script",
    title: "Call-Script",
    description: "Telefonleitfaden für erste Gespräche mit Garagen und Servicebetrieben.",
  },
  {
    href: "/admin/sales/demo-flow",
    title: "Demo-Ablauf",
    description: "7-Minuten Struktur vom Problem bis zum Pilotabschluss.",
  },
  {
    href: "/admin/sales/pilot-offer",
    title: "Pilot-Angebot",
    description: "Interne Angebotsseite mit klaren Grenzen und nächstem Schritt.",
  },
  {
    href: "/admin/sales/email-templates",
    title: "E-Mail-Vorlagen",
    description: "Kurze Vorlagen für Nachfassen, Demo und Pilotvorschlag.",
  },
  {
    href: "/admin/sales/objections",
    title: "Einwandbehandlung",
    description: "Antworten, Kurzversionen und nächste Fragen für Verkaufsgespräche.",
  },
  {
    href: "/admin/outreach",
    title: "Outreach Pipeline",
    description: "Zielbetriebe, Anrufe, Demos und Pilotchancen strukturiert verfolgen.",
  },
  {
    href: "/admin/pilot-setup",
    title: "Pilot Setup Checklist",
    description: "Interne Schritt-für-Schritt-Anleitung für den ersten echten Pilotkunden.",
  },
  {
    href: "/admin/clients",
    title: "Admin Kunden",
    description: "Pilotkunden anlegen, Links öffnen und Leads auswerten.",
  },
  {
    href: "/demo",
    title: "Demo Dashboard",
    description: "Öffentliche Demo für Sichtbarkeit, Struktur und Anfragepotenzial.",
  },
  {
    href: "/audit",
    title: "Lead-Audit Seite",
    description: "Öffentliche Einstiegsseite für Audit-Anfragen.",
  },
];

const checklist = [
  "30 Zielbetriebe recherchieren",
  "20 Anrufe führen",
  "5 Demos vereinbaren",
  "1 zahlenden Pilotkunden gewinnen",
  "Feedback dokumentieren",
  "Produkt danach nachschärfen",
];

export default function AdminSalesPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Interne Vertriebsunterlagen</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">Sales Command Center</h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">
            Interne Unterlagen für LeadLeak AI Pilotgespräche.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {commandLinks.map((item) => (
              <InternalLinkCard key={item.href} {...item} />
            ))}
          </div>

          <div className="grid gap-5">
            <section className="premium-card-dark p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Positionierung</p>
              <h2 className="mt-3 text-2xl font-semibold">
                LeadLeak AI hilft Schweizer Servicebetrieben, verlorene und chaotische Anfragen sichtbar zu machen, zu
                priorisieren und schneller nachzufassen.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Keine Umsatzgarantie, keine vollautomatische Terminbuchung. Der Fokus liegt auf Pilotphase,
                strukturierter Rückmeldung und nachvollziehbarer Lead-Auswertung.
              </p>
            </section>

            <section className="premium-card p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Launch Fokus</p>
              <h2 className="mt-3 text-2xl font-semibold text-navy-950">Erste Pilotkunden gewinnen</h2>
              <div className="mt-5 text-sm leading-7 text-slate-700">
                <BulletList items={checklist} />
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
