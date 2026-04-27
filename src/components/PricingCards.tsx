import { pricingPlans } from "@/lib/mockData";

export function PricingCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {pricingPlans.map((plan) => (
        <article
          key={plan.name}
          className={`relative rounded-lg border bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.08)] ${
            plan.recommended ? "border-swiss-green ring-2 ring-swiss-green/15" : "border-slate-200"
          }`}
        >
          {plan.recommended ? (
            <div className="absolute right-5 top-5 rounded-full border border-emerald-200 bg-swiss-mint px-3 py-1 text-xs font-semibold text-emerald-800">
              Empfohlen
            </div>
          ) : null}
          <h3 className="text-xl font-semibold tracking-tight text-navy-950">{plan.name}</h3>
          <p className="mt-4 text-3xl font-bold tracking-tight text-navy-950">{plan.price}</p>
          <p className="mt-2 text-sm font-semibold text-swiss-green">{plan.setupFee}</p>
          <p className="mt-5 min-h-20 text-sm leading-6 text-slate-600">{plan.description}</p>
          <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-swiss-green" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
