import Link from "next/link";
import { BulletList, SalesCard, SalesShell } from "../components";

const demoSteps = [
  {
    time: "Minute 0-1",
    title: "Problem einordnen",
    text: "Viele Betriebe verlieren keine Kunden wegen schlechter Arbeit, sondern weil Anfragen im Alltag nicht sauber nachgefasst werden.",
  },
  {
    time: "Minute 1-2",
    title: "Öffentliche Anfrage erfassen",
    text: "Öffne /p/[slug] und zeige, wie eine Anfrage sauber mit Name, Telefon, Anfrageart und Nachricht erfasst wird.",
  },
  {
    time: "Minute 2-3",
    title: "Admin-Kundenseite zeigen",
    text: "Zeige, dass der Lead strukturiert beim Betrieb erscheint und nicht als lose Notiz endet.",
  },
  {
    time: "Minute 3-4",
    title: "Lead Detail öffnen",
    text: "Zeige AI Recovery Brain, fehlende Angaben, empfohlene Aktion und Antwortvorschlag.",
  },
  {
    time: "Minute 4-5",
    title: "Lead DNA erklären",
    text: "Zeige Auftragswert, Dringlichkeit, Konkurrenzdruck, Nachfassbedarf und Anfragequalität als Priorisierungshilfe.",
  },
  {
    time: "Minute 5-6",
    title: "Kundenportal zeigen",
    text: "Öffne das Revenue Rescue Cockpit und zeige Auswertung, Prioritäten, Link und Lead-Tabelle.",
  },
  {
    time: "Minute 6-7",
    title: "Pilot anbieten",
    text: "Wir testen das klein, sichtbar und ohne lange Bindung.",
  },
];

const checklist = [
  "Demo client exists",
  "Demo leads exist",
  "Client portal access works",
  "Lead detail opens",
  "AI Recovery Brain has suggestion",
  "Lead DNA visible",
  "Datenschutz/Impressum placeholders reviewed before real rollout",
];

export default function DemoFlowPage() {
  return (
    <SalesShell title="7-Minuten Demo-Ablauf" subtitle="Klarer Ablauf für eine kurze, überzeugende Live-Demo.">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          {demoSteps.map((step) => (
            <section key={step.time} className="premium-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">{step.time}</p>
                  <h2 className="mt-2 text-xl font-semibold text-navy-950">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{step.text}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-5 content-start">
          <SalesCard title="Demo-Checkliste">
            <BulletList items={checklist} />
          </SalesCard>

          <section className="premium-card-dark p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Schnellzugriff</p>
            <div className="mt-4 grid gap-3">
              {[
                ["/admin/clients", "Admin Kunden"],
                ["/client/login", "Kundenportal Login"],
                ["/demo", "Demo Dashboard"],
                ["/admin/sales/pilot-offer", "Pilot-Angebot"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SalesShell>
  );
}
