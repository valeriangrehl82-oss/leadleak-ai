import Link from "next/link";
import { PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Preise</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Pilotfaehige Pakete ohne technische Huerden.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Klare monatliche Preise, einmalige Einrichtung und Fokus auf messbare Lead-Rettung fuer lokale Betriebe.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PricingCards />
        <div className="mt-10 rounded-lg bg-navy-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Kostenlosen Lead-Audit buchen</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Wir schaetzen gemeinsam, wie viele Anfragen aktuell unbemerkt verloren gehen.
              </p>
            </div>
            <Link
              href="/audit"
              className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Lead-Audit buchen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
