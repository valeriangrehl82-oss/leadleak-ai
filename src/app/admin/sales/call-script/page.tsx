import { BulletList, SalesCard, SalesShell, ScriptBox } from "../components";

const opening =
  "Grüezi Herr/Frau [Name], ich mache es kurz: Ich baue ein System für Schweizer Servicebetriebe, das verpasste oder chaotische Anfragen sichtbar macht und beim Nachfassen hilft. Darf ich Ihnen eine kurze Frage stellen?";

const problemQuestion =
  "Wie handhaben Sie aktuell verpasste Anrufe oder Rückrufwünsche, wenn gerade niemand Zeit hat?";

const bridge =
  "Genau dafür ist LeadLeak AI gedacht: nicht als Telefonanlage, sondern als Recovery-Cockpit für verlorene oder unstrukturierte Anfragen. Ich kann Ihnen das in 7 Minuten zeigen.";

const demoClose = "Hätten Sie diese oder nächste Woche 10 Minuten Zeit für eine kurze Demo?";

const interested =
  "Perfekt. Ich zeige Ihnen, wie eine Anfrage erfasst, priorisiert und mit Antwortvorschlag im Cockpit sichtbar wird.";

const notInterested =
  "Alles gut. Darf ich Ihnen trotzdem den kurzen Demo-Link schicken, damit Sie sehen, worum es geht?";

export default function CallScriptPage() {
  return (
    <SalesShell
      title="Telefon-Script für erste Pilotkunden"
      subtitle="Praktischer Gesprächsleitfaden für Schweizer Garagen und lokale Servicebetriebe."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <SalesCard title="1. Ziel des Anrufs">
          <p>Nicht sofort verkaufen. Erst Problem validieren und Demo-Termin sichern.</p>
        </SalesCard>

        <SalesCard title="2. Opening">
          <ScriptBox text={opening} />
        </SalesCard>

        <SalesCard title="3. Problemfrage">
          <ScriptBox text={problemQuestion} />
        </SalesCard>

        <SalesCard title="4. Vertiefungsfragen">
          <BulletList
            items={[
              "Passiert es manchmal, dass Rückrufe im Tagesgeschäft untergehen?",
              "Wer dokumentiert bei Ihnen solche Anfragen?",
              "Wie sehen Sie später, welche Anfrage noch offen ist?",
              "Gibt es Anfragen, bei denen Kunden dann einfach zur nächsten Garage gehen?",
            ]}
          />
        </SalesCard>

        <SalesCard title="5. Bridge to Demo">
          <ScriptBox text={bridge} />
        </SalesCard>

        <SalesCard title="6. Demo Close">
          <ScriptBox text={demoClose} />
        </SalesCard>

        <SalesCard title="7. Wenn Interesse besteht">
          <ScriptBox text={interested} />
        </SalesCard>

        <SalesCard title="8. Wenn kein Interesse besteht">
          <ScriptBox text={notInterested} />
        </SalesCard>
      </div>
    </SalesShell>
  );
}
