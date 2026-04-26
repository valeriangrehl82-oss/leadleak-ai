import { pricingPlans } from "@/lib/mockData";

export function PricingCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {pricingPlans.map((plan) => (
        <article
          key={plan.name}
          className={`relative rounded-lg border bg-white p-6 shadow-soft ${
            plan.recommended ? "border-swiss-green ring-2 ring-swiss-green/20" : "border-swiss-line"
          }`}
        >
          {plan.recommended ? (
            <div className="absolute right-5 top-5 rounded-full bg-swiss-mint px-3 py-1 text-xs font-semibold text-emerald-800">
              Empfohlen
            </div>
          ) : null}
          <h3 className="text-xl font-semibold text-navy-950">{plan.name}</h3>
          <p className="mt-3 text-3xl font-bold tracking-tight text-navy-950">{plan.price}</p>
          <p className="mt-2 font-semibold text-swiss-green">{plan.setupFee}</p>
          <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600">{plan.description}</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-swiss-green" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
