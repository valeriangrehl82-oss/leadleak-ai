export const metadata = {
  title: "Datenschutzerklärung | LeadLeak AI",
  description: "Arbeitsversion der Datenschutzerklärung für LeadLeak AI.",
};

const sections = [
  {
    title: "1. Verantwortliche Stelle",
    body: [
      "[Name / Firma]",
      "[Adresse]",
      "[PLZ Ort]",
      "[E-Mail]",
      "[Telefon optional]",
    ],
  },
  {
    title: "2. Welche Daten wir bearbeiten",
    body: [
      "Wir bearbeiten Kontaktdaten aus Lead-Audit-Anfragen, Unternehmensdaten von Pilotkunden sowie Endkundendaten aus öffentlichen Anfrageformularen unter /p/[slug]. Dazu können Name, Telefonnummer, E-Mail, Anfrageart, Nachricht, Lead-Status, Bearbeitungsinformationen, geschätzte Anfragewerte, Lead DNA Priorisierungssignale, AI Recovery Brain Antwortvorschläge sowie technische Nutzungs- und Protokolldaten gehören, soweit dies für Betrieb, Sicherheit und Nachbearbeitung erforderlich ist.",
    ],
  },
  {
    title: "3. Zwecke der Bearbeitung",
    body: [
      "Die Daten werden zur Anfrage-Erfassung, Benachrichtigung des Betriebs, strukturierten Rückmeldung, Pilot-Auswertung, Bereitstellung des Kundenportals, Admin-Verwaltung, Verbesserung des Rückmeldeprozesses sowie für Sicherheit und technischen Betrieb verwendet.",
    ],
  },
  {
    title: "4. Lead DNA und AI Recovery Brain",
    body: [
      "Lead DNA und AI Recovery Brain dienen als interne Priorisierungshilfen und Antwortvorschläge. Sie treffen keine automatisierten Entscheidungen über Kundinnen oder Kunden.",
    ],
  },
  {
    title: "5. Eingesetzte Dienstleister",
    body: [
      "Für den technischen Betrieb können Dienstleister wie Vercel für Hosting, Supabase für die Datenbank und Resend für E-Mail-Benachrichtigungen eingesetzt werden. Twilio ist optional technisch vorbereitet und wird nur relevant, wenn entsprechende Funktionen später konfiguriert werden.",
    ],
  },
  {
    title: "6. Datenübermittlung ins Ausland",
    body: [
      "Je nach eingesetzten Dienstleistern kann eine Bearbeitung oder Übermittlung von Daten ins Ausland erfolgen. Dabei sollen geeignete vertragliche und technische Massnahmen berücksichtigt werden.",
    ],
  },
  {
    title: "7. Speicherdauer",
    body: [
      "Personendaten werden nur so lange gespeichert, wie sie für Pilotbetrieb, Nachbearbeitung, Support oder gesetzliche Pflichten erforderlich sind.",
    ],
  },
  {
    title: "8. Weitergabe",
    body: ["Keine Weitergabe zu Werbezwecken."],
  },
  {
    title: "9. Rechte betroffener Personen",
    body: [
      "Betroffene Personen können, soweit anwendbar, Auskunft, Berichtigung, Löschung sowie Einschränkung oder Widerspruch gegen bestimmte Bearbeitungen verlangen.",
    ],
  },
  {
    title: "10. Kontakt",
    body: ["Für Datenschutzanliegen: [E-Mail]."],
  },
  {
    title: "11. Schlussnote",
    body: ["Diese Seite ersetzt keine Rechtsberatung."],
  },
];

export default function DatenschutzPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Trust Layer</p>
          <h1 className="premium-title-dark mt-3 text-4xl sm:text-5xl">Datenschutzerklärung</h1>
          <div className="premium-glass mt-6 rounded-xl p-5 text-sm leading-6 text-slate-100">
            Diese Datenschutzerklärung ist eine Arbeitsversion und muss vor produktivem Einsatz mit den effektiven
            Unternehmensdaten ergänzt und rechtlich geprüft werden.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
