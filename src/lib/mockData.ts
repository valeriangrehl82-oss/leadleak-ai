import type { BusinessType, Lead, PricingPlan } from "./types";

export const kpis = [
  { label: "Verpasste Anrufe", value: "34", detail: "im Pilot sichtbar gemacht" },
  { label: "Leads erfasst", value: "18", detail: "mit Anliegen und nächster Aktion" },
  { label: "Gewonnene Anfragen", value: "4", detail: "im Demo-Zeitraum markiert" },
  { label: "Geschätztes Potenzial", value: "CHF 14’800", detail: "potenzieller Pipeline-Wert" },
];

export const garageLeads: Lead[] = [
  {
    id: "garage-1",
    name: "Marco Keller",
    phone: "+41 79 234 18 44",
    branche: "Garage",
    anfrage: "Reifenwechsel Anfrage",
    status: "Booked",
    value: "CHF 250",
    lastAction: "Termin für Mittwoch bestätigt",
    summary: "Marco braucht kurzfristig einen Reifenwechsel, weil er am Wochenende in die Berge fährt.",
    urgency: "Hoch, der Kunde will diese Woche einen fixen Werkstatt-Termin.",
    customerReply: "Ja, Reifenwechsel diese Woche wäre ideal. Mittwochvormittag passt.",
    recommendedAction: "Termin bestätigen und direkt auf Einlagerung oder Wintercheck hinweisen.",
    suggestedMessage:
      "Guten Tag Herr Keller, danke für Ihre Anfrage. Wir haben Mittwoch um 10:30 Uhr einen Reifenwechsel-Termin frei. Sollen wir diesen für Sie reservieren?",
  },
  {
    id: "garage-2",
    name: "Sandra Meier",
    phone: "+41 76 512 90 11",
    branche: "Garage",
    anfrage: "MFK-Vorbereitung",
    status: "Qualified",
    value: "CHF 680",
    lastAction: "Fahrzeugdaten angefragt",
    summary: "Sandra hat bald einen MFK-Termin und möchte vorher prüfen lassen, ob ihr Auto bereit ist.",
    urgency: "Mittel bis hoch, MFK-Termin ist bereits geplant.",
    customerReply: "MFK ist nächsten Dienstag. Es ist ein VW Golf, Jahrgang 2016.",
    recommendedAction: "Fahrzeugdaten aufnehmen und einen MFK-Checkslot vor Dienstag anbieten.",
    suggestedMessage:
      "Guten Tag Frau Meier, wir können Ihr Fahrzeug vor dem MFK prüfen. Bitte senden Sie uns Kontrollschild und MFK-Datum, dann schlagen wir Ihnen einen passenden Termin vor.",
  },
  {
    id: "garage-3",
    name: "Nina Baumann",
    phone: "+41 78 441 22 09",
    branche: "Garage",
    anfrage: "Bremsen quietschen",
    status: "New",
    value: "CHF 720",
    lastAction: "Strukturierte Rückmeldung gesendet",
    summary: "Nina hört quietschende Bremsen und möchte wissen, ob sie noch weiterfahren kann.",
    urgency: "Sehr hoch, sicherheitsrelevantes Thema und klare Abschlusschance.",
    customerReply: "Es quietscht beim Bremsen, vor allem innerorts. Ich möchte es rasch anschauen lassen.",
    recommendedAction: "Sofort Diagnose-Termin anbieten und Sicherheitspriorität klar kommunizieren.",
    suggestedMessage:
      "Guten Tag Frau Baumann, Bremsgeräusche sollten wir zeitnah prüfen. Wir haben morgen um 14:00 Uhr einen Diagnose-Termin frei. Passt Ihnen das?",
  },
  {
    id: "garage-4",
    name: "Thomas Frei",
    phone: "+41 77 308 16 52",
    branche: "Garage",
    anfrage: "Service Termin",
    status: "Qualified",
    value: "CHF 520",
    lastAction: "Serviceumfang geklärt",
    summary: "Thomas möchte den Jahresservice buchen und fragt nach einem Termin mit Ersatzwagen.",
    urgency: "Mittel, der Kunde ist kaufbereit und braucht nur eine Terminoption.",
    customerReply: "Jahresservice wäre fällig. Falls möglich brauche ich einen Ersatzwagen.",
    recommendedAction: "Zwei Terminvorschläge senden und Ersatzwagen-Verfügbarkeit nennen.",
    suggestedMessage:
      "Guten Tag Herr Frei, für den Jahresservice haben wir Montag um 08:00 Uhr oder Dienstag um 13:30 Uhr frei. Ein Ersatzwagen ist nach Reservation möglich.",
  },
  {
    id: "garage-5",
    name: "Aline Schmid",
    phone: "+41 79 660 83 27",
    branche: "Garage",
    anfrage: "Batterieproblem",
    status: "Booked",
    value: "CHF 310",
    lastAction: "Batteriecheck gebucht",
    summary: "Aline hat Startprobleme am Morgen und vermutet eine schwache Batterie.",
    urgency: "Hoch, das Problem beeinträchtigt die tägliche Nutzung des Autos.",
    customerReply: "Das Auto startet morgens schlecht. Ich brauche es täglich für den Arbeitsweg.",
    recommendedAction: "Kurzfristigen Batteriecheck buchen und mögliche Ersatzbatterie bereithalten.",
    suggestedMessage:
      "Guten Tag Frau Schmid, wir können die Batterie kurzfristig prüfen. Heute um 16:00 Uhr wäre ein kurzer Check möglich. Sollen wir Sie eintragen?",
  },
  {
    id: "garage-6",
    name: "Peter Huber",
    phone: "+41 78 904 55 31",
    branche: "Garage",
    anfrage: "Klimaservice",
    status: "Lost",
    value: "CHF 190",
    lastAction: "Keine Antwort nach Follow-up",
    summary: "Peter fragte nach Klimaservice und Preis, hat aber auf das zweite Follow-up nicht reagiert.",
    urgency: "Niedrig, Anfrage ist preissensitiv und aktuell nicht bestätigt.",
    customerReply: "Was kostet ein Klimaservice ungefähr? Ich vergleiche gerade ein paar Garagen.",
    recommendedAction: "In sieben Tagen mit einfachem Paketpreis und freiem Slot nachfassen.",
    suggestedMessage:
      "Guten Tag Herr Huber, unser Klimaservice startet bei CHF 190. Wenn das Thema noch offen ist, hätten wir am Freitag freie Termine.",
  },
];

export const leads: Lead[] = garageLeads;

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "CHF 390/Monat",
    setupFee: "CHF 790 Setup",
    description: "Für kleinere Betriebe, die verpasste Anfragen sichtbar machen und strukturiert erfassen wollen.",
    features: [
      "Kundenspezifischer Pilot-Link",
      "Lead-Erfassung pro Betrieb",
      "E-Mail-Benachrichtigung bei neuen Anfragen",
      "Basis-Übersicht der eingegangenen Leads",
      "CSV-Export für einfache Nachbearbeitung",
      "7/14/30-Tage Auswertung",
    ],
  },
  {
    name: "Professional",
    price: "CHF 690/Monat",
    setupFee: "CHF 1’490 Setup",
    description:
      "Für Betriebe, die ihre Anfragen zentral erfassen, auswerten und den Rückmeldeprozess sauber organisieren wollen.",
    features: [
      "Alles aus Starter",
      "Kundenspezifische Rückmelde-Texte",
      "Lead-Status: Neu, Kontaktiert, Qualifiziert, Gewonnen, Verloren",
      "Detailansicht pro Lead",
      "Auswertung der Pilotphase",
      "Potenzialschätzung pro Anfrage",
      "Unterstützung bei der Pilot-Auswertung",
    ],
    recommended: true,
  },
  {
    name: "Business Plus",
    price: "CHF 990/Monat",
    setupFee: "CHF 2’490 Setup",
    description:
      "Für Betriebe mit höherem Anfragevolumen, die einen begleiteten Pilot mit technischer Einrichtung wünschen.",
    features: [
      "Alles aus Professional",
      "Begleitete Einrichtung des Pilot-Systems",
      "Unterstützung bei Recovery-Nummer und Anrufweiterleitung, sofern technisch verfügbar",
      "Erweiterte Auswertung des Anfragepotenzials",
      "Optimierungsempfehlungen nach dem Pilot",
      "Priorisierter Support während der Pilotphase",
    ],
  },
];

export const requestOptions: Record<BusinessType, string[]> = {
  Garage: ["Reifenwechsel", "Service", "Bremsen", "MFK Vorbereitung", "Batterieproblem", "Klimaservice"],
  Reinigung: ["Endreinigung", "Büroreinigung", "Fensterreinigung", "Baureinigung"],
  Umzug: ["Privatumzug", "Firmenumzug", "Entsorgung", "Einlagerung"],
  Handwerk: ["Notfall", "Reparatur", "Offerte", "Besichtigung"],
};
