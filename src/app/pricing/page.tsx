import Link from "next/link";
import { PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="animate-fade-slide mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Preise</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">
            Pilotfähige Pakete ohne technische Hürden.
          </h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">
            Klare monatliche Preise, einmalige Einrichtung und Fokus auf messbare verpasste Anfragen für lokale
            Betriebe.
          </p>
        </div>
      </section>
      <section className="animate-fade-slide animate-delay-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PricingCards />
        <div className="premium-card-dark mt-10 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Kostenlosen Lead-Audit buchen</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Wir schätzen gemeinsam, wie viele Anfragen aktuell unbemerkt verloren gehen.
              </p>
            </div>
            <Link
              href="/audit"
              className="ui-lift rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Lead-Audit buchen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
