import { PrintButton } from "@/components/PrintButton";
import { BulletList, SalesCard, SalesShell } from "../components";

export default function SalesPilotOfferPage() {
  return (
    <SalesShell
      title="14-Tage Pilot-Angebot"
      subtitle="Fokussierte Pilotphase zur strukturierten Erfassung und Auswertung von Anfragen."
    >
      <div className="mb-5 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SalesCard title="Pilot Ziel">
          <BulletList
            items={[
              "Anfragen sichtbar machen",
              "Rückmeldeprozess prüfen",
              "Priorisierung testen",
              "Auswertung für Abschlussgespräch erstellen",
            ]}
          />
        </SalesCard>

        <SalesCard title="Pilot enthält">
          <BulletList
            items={[
              "öffentlicher Erfassungslink",
              "Admin-Verwaltung",
              "Kundenportal",
              "Lead DNA Highlights",
              "AI Recovery Brain Antwortvorschläge",
              "Revenue Rescue Cockpit",
              "Pilot-Auswertung",
            ]}
          />
        </SalesCard>

        <SalesCard title="Pilot enthält NICHT">
          <BulletList
            items={[
              "keine Umsatzgarantie",
              "keine vollautomatische Terminbuchung",
              "keine automatische SMS ohne separate Freigabe",
              "keine Rechtsberatung",
            ]}
          />
        </SalesCard>

        <section className="premium-card-dark p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Preisanker</p>
          <h2 className="mt-3 text-3xl font-bold">Pilot-Setup ab CHF 490</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Monatliche Weiterführung je nach Paket ab CHF 390.
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-100">
            Wenn nach der Pilotphase kein klarer Nutzen sichtbar wird, wird nicht weitergeführt.
          </div>
        </section>
      </div>
    </SalesShell>
  );
}
