const statuses = [
  ["Neu", "Anfrage ist eingegangen, aber noch nicht bearbeitet."],
  ["Kontaktiert", "Es wurde eine Rückmeldung oder Kontaktaufnahme versucht."],
  ["Qualifiziert", "Die Anfrage ist relevant und soll weiterbearbeitet werden."],
  ["Gewonnen", "Aus der Anfrage wurde ein Auftrag oder konkreter nächster Schritt."],
  ["Verloren", "Die Anfrage wird nicht weiterverfolgt."],
];

export function StatusWorkflowInfo({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <aside
      className={
        dark
          ? "rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-slate-300"
          : "rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600"
      }
    >
      <p className={dark ? "font-semibold text-white" : "font-semibold text-navy-950"}>Status verstehen</p>
      <div className="mt-3 grid gap-2">
        {statuses.map(([label, text]) => (
          <p key={label}>
            <span className={dark ? "font-semibold text-emerald-200" : "font-semibold text-navy-950"}>{label}:</span>{" "}
            {text}
          </p>
        ))}
      </div>
    </aside>
  );
}
