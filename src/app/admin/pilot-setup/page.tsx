import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";

const sections = [
  {
    title: "A - Kunde vorbereiten",
    items: [
      "Zielbetrieb in /admin/outreach erfassen oder aktualisieren",
      'Status auf "Interessiert" oder "Demo geplant" setzen',
      "Notizen und nächste Aktion hinterlegen",
      "Telefonnummer, Website, Kontaktperson und E-Mail prüfen",
    ],
    links: [
      ["/admin/outreach", "Outreach Pipeline"],
      ["/admin/sales/call-script", "Call-Script"],
      ["/admin/sales/demo-flow", "Demo-Ablauf"],
    ],
  },
  {
    title: "B - Pilotkunde anlegen",
    items: [
      "Kunde in /admin/clients anlegen",
      "Eindeutigen Slug setzen",
      "Branche, Kontaktperson, E-Mail und Telefon eintragen",
      "Kunde aktivieren",
      "Portal aktivieren",
      "Zugangscode setzen",
      "Optional: Booking-Link hinterlegen",
      'Recovery-Modus auf "manual" lassen',
      "Auto-Antwort deaktiviert lassen",
    ],
    warning: "Auto-Antworten erst nach Live-Test und rechtlicher Prüfung aktivieren.",
    links: [["/admin/clients", "Admin Kunden"]],
  },
  {
    title: "C - Öffentlichen Erfassungslink prüfen",
    items: [
      "/p/[slug] öffnen",
      "Kundenname und Branding prüfen",
      "Anfrage-Chips testen",
      "Testanfrage absenden",
      "Success-State prüfen",
      "Datenschutz-Link prüfen",
      "Lead erscheint im Admin",
    ],
    note: "Für echte Kunden keine Fake-Daten im sichtbaren Portal lassen.",
  },
  {
    title: "D - Kundenportal prüfen",
    items: [
      "/client/login öffnen",
      "Mit Slug und Zugangscode einloggen",
      "/client/dashboard prüfen",
      "Öffentlichen Erfassungslink im Portal testen",
      "Empty State oder echte Leads prüfen",
      "Lead DNA Hinweise prüfen",
      "Pilot-Auswertung prüfen",
    ],
  },
  {
    title: "E - Demo-Daten vorbereiten oder löschen",
    items: [
      "Für Demo: Demo-Leads erstellen",
      "Für echten Kundeneinsatz: Demo-Leads löschen",
      "Keine demo_seed Leads beim echten Kunden stehen lassen",
      "Nur echte Testanfragen oder echte Leads verwenden",
    ],
    note: "Demo-Leads erstellen/löschen befindet sich auf /admin/clients/[id].",
  },
  {
    title: "F - Recovery Brain prüfen",
    items: [
      "Lead Detail öffnen",
      "AI Recovery Brain prüfen",
      "Kategorie, Dringlichkeit und Terminbedarf prüfen",
      "Antwortvorschlag kopieren",
      "Booking-Link erscheint nur, wenn Booking-Link aktiv und sinnvoll ist",
      "Lead DNA prüft Prioritätssignale",
    ],
    note: "Recovery Brain erstellt Vorschläge. Es sendet keine Nachrichten automatisch.",
  },
  {
    title: "G - Abschlussgespräch / Pilotstart",
    items: [
      "Pilot-Angebot aus /admin/sales/pilot-offer öffnen",
      "Umfang und Preis erklären",
      "Was nicht enthalten ist klar sagen",
      "Pilotstart-Datum festlegen",
      "Follow-up in /admin/outreach setzen",
      "Nächste Aktion dokumentieren",
    ],
    links: [["/admin/sales/pilot-offer", "Pilot-Angebot"]],
  },
];

const quickLinks = [
  ["/admin/clients", "Admin Kunden"],
  ["/admin/outreach", "Outreach Pipeline"],
  ["/admin/sales", "Sales Command Center"],
  ["/admin/sales/demo-flow", "Demo-Ablauf"],
  ["/admin/sales/pilot-offer", "Pilot-Angebot"],
  ["/datenschutz", "Datenschutz"],
  ["/impressum", "Impressum"],
  ["/demo", "Public Demo"],
  ["/audit", "Lead-Audit"],
];

const readinessItems = [
  "Trust Layer bereit",
  "Demo-Umgebung bereit",
  "Pilotkunde eingerichtet",
  "Portal geprüft",
  "Recovery Brain geprüft",
  "Follow-up gesetzt",
];

const dontClaim = [
  "vollautomatische Terminbuchung ist live",
  "SMS wird automatisch versendet",
  "DSG-konform zertifiziert",
  "in der Schweiz gehostet",
  "garantierter Umsatz",
];

const safeClaims = [
  "verlorene und chaotische Anfragen sichtbar machen",
  "Anfragen strukturiert erfassen",
  "Antwortvorschläge erstellen",
  "Priorisierung mit Lead DNA unterstützen",
  "Pilot-Auswertung bereitstellen",
];

export default async function PilotSetupPage() {
  await requireAdminPage();

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/sales" className="text-sm font-semibold text-emerald-200 hover:text-white">
            Zurück zum Sales Command Center
          </Link>
          <p className="premium-eyebrow-dark mt-6">Interner Pilotbetrieb</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">Pilot Setup Checklist</h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">
            Interne Schritt-für-Schritt-Anleitung für das Einrichten eines echten LeadLeak Pilotkunden.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
          <div className="grid gap-6">
            <section className="premium-card-dark p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Pilot Setup Overview</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Ziel: Einen Pilotkunden so einrichten, dass Erfassungslink, Kundenportal, Lead-Erfassung, Recovery
                Brain und Auswertung sauber funktionieren.
              </h2>
              <div className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
                Vor echtem Kundeneinsatz Demo-Daten entfernen, Unternehmensangaben prüfen und
                Datenschutz-/Impressumsplatzhalter ersetzen.
              </div>
            </section>

            <div className="grid gap-5">
              {sections.map((section) => (
                <ChecklistSection key={section.title} {...section} />
              ))}
            </div>

            <section className="premium-card p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">
                Kommunikationssicherheit
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-navy-950">
                Was vor dem ersten echten Kunden NICHT behaupten
              </h2>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <h3 className="font-semibold text-red-900">Nicht behaupten</h3>
                  <Checklist items={dontClaim} tone="red" />
                </div>
                <div className="rounded-xl border border-emerald-200 bg-swiss-mint p-5">
                  <h3 className="font-semibold text-emerald-950">Sicher sagen</h3>
                  <Checklist items={safeClaims} tone="green" />
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-5 content-start">
            <section className="premium-card p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Quick Links</p>
              <div className="mt-4 grid gap-2">
                {quickLinks.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy-950 transition hover:border-swiss-green hover:bg-swiss-mint"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="premium-card p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">
                First Pilot Readiness Score
              </p>
              <h2 className="mt-2 text-xl font-semibold text-navy-950">Operative Checkliste</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Diese Punkte werden nicht gespeichert. Sie dienen als Kontrollliste vor dem ersten echten Pilotkunden.
              </p>
              <div className="mt-5 grid gap-3">
                {readinessItems.map((item) => (
                  <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zu prüfen</p>
                    <p className="mt-1 font-semibold text-navy-950">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ChecklistSection({
  title,
  items,
  links,
  warning,
  note,
}: {
  title: string;
  items: string[];
  links?: string[][];
  warning?: string;
  note?: string;
}) {
  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Schritt</p>
          <h2 className="mt-2 text-2xl font-semibold text-navy-950">{title}</h2>
        </div>
        {links?.length ? (
          <div className="flex flex-wrap gap-2">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="premium-button-secondary px-4 py-2 text-sm">
                {label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <Checklist items={items} />
      {warning ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          {warning}
        </div>
      ) : null}
      {note ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {note}
        </div>
      ) : null}
    </section>
  );
}

function Checklist({ items, tone = "default" }: { items: string[]; tone?: "default" | "red" | "green" }) {
  const color =
    tone === "red" ? "border-red-300 bg-red-600" : tone === "green" ? "border-emerald-300 bg-swiss-green" : "border-emerald-300 bg-swiss-green";

  return (
    <ul className="mt-5 grid gap-3 text-sm leading-6">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-xl border border-slate-100 bg-white/70 p-3">
          <span className={`mt-1 h-4 w-4 shrink-0 rounded border ${color}`} />
          <span className="text-slate-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}
