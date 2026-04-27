export type RecoveryBrainLead = {
  customer_name?: string | null;
  customer_phone?: string | null;
  request_type?: string | null;
  message?: string | null;
};

export type RecoveryBrainClient = {
  name?: string | null;
  booking_url?: string | null;
  booking_enabled?: boolean | null;
  recovery_message?: string | null;
};

export type RecoveryBrainResult = {
  category: string;
  urgencyLabel: "Hoch" | "Mittel/Hoch" | "Mittel" | "Basis";
  appointmentNeed: boolean;
  missingInformation: string[];
  recommendedAction: string;
  suggestedReply: string;
  shouldIncludeBookingLink: boolean;
  reasoningSummary: string;
};

const categoryRules = [
  { category: "Reifenwechsel", terms: ["reifen", "radwechsel", "winterreifen", "sommerreifen"] },
  { category: "MFK-Vorbereitung", terms: ["mfk", "fahrzeugprüfung", "pruefung", "prüfung"] },
  { category: "Bremsen", terms: ["brems"] },
  { category: "Batterie", terms: ["batterie", "startet nicht", "springt nicht an"] },
  { category: "Service", terms: ["service", "jahresservice", "wartung"] },
  { category: "Offerte", terms: ["offerte", "angebot", "preis", "kosten"] },
];

const appointmentTerms = [
  "termin",
  "vorbeikommen",
  "buchen",
  "frei",
  "zeit",
  "nächste woche",
  "naechste woche",
  "service",
  "mfk",
  "reifenwechsel",
];

const vehicleTerms = [
  "auto",
  "fahrzeug",
  "wagen",
  "kontrollschild",
  "vw",
  "audi",
  "bmw",
  "mercedes",
  "toyota",
  "opel",
  "skoda",
  "seat",
  "renault",
  "peugeot",
  "tesla",
  "golf",
];

const timeTerms = [
  "heute",
  "morgen",
  "woche",
  "montag",
  "dienstag",
  "mittwoch",
  "donnerstag",
  "freitag",
  "samstag",
  "vormittag",
  "nachmittag",
  "abend",
  "uhr",
];

function normalize(value: string | null | undefined) {
  return (value || "").toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function detectCategory(text: string) {
  return categoryRules.find((rule) => includesAny(text, rule.terms))?.category || "Allgemeine Anfrage";
}

function getUrgency(category: string, text: string): RecoveryBrainResult["urgencyLabel"] {
  if (
    category === "Bremsen" ||
    category === "Batterie" ||
    includesAny(text, ["panne", "notfall", "startet nicht", "springt nicht an", "dringend", "sofort"])
  ) {
    return "Hoch";
  }

  if (category === "MFK-Vorbereitung" || (category === "Service" && includesAny(text, ["diese woche", "bald"]))) {
    return "Mittel/Hoch";
  }

  if (category === "Reifenwechsel" || category === "Offerte" || category === "Service") {
    return "Mittel";
  }

  return "Basis";
}

function buildRecommendedAction(result: {
  category: string;
  urgencyLabel: RecoveryBrainResult["urgencyLabel"];
  appointmentNeed: boolean;
  missingInformation: string[];
  shouldIncludeBookingLink: boolean;
}) {
  if (result.urgencyLabel === "Hoch") {
    return "Zeitnah zurückrufen und Anliegen direkt klären.";
  }

  if (result.shouldIncludeBookingLink) {
    return "Booking-Link senden und fehlende Angaben kurz abfragen.";
  }

  if (result.appointmentNeed) {
    return "Terminbedarf bestätigen und passende Zeitfenster oder Rückruf anbieten.";
  }

  if (result.missingInformation.length) {
    return "Fehlende Angaben einholen und danach nächste Rückmeldung vorbereiten.";
  }

  return "Anfrage prüfen und strukturiert nachfassen.";
}

function buildSuggestedReply(params: {
  clientName: string;
  category: string;
  missingInformation: string[];
  appointmentNeed: boolean;
  bookingUrl: string | null;
  shouldIncludeBookingLink: boolean;
}) {
  const missingText = params.missingInformation.length
    ? ` Bitte senden Sie uns noch: ${params.missingInformation.join(", ")}.`
    : "";
  const topic = params.category === "Allgemeine Anfrage" ? "Ihr Anliegen" : params.category;

  if (params.shouldIncludeBookingLink && params.bookingUrl) {
    return `Guten Tag, hier ist ${params.clientName}. Danke für Ihre Anfrage zu ${topic}. Sie können über diesen Link einen passenden Terminwunsch erfassen: ${params.bookingUrl}.${missingText} Wir prüfen die Angaben und melden uns mit den nächsten Schritten.`;
  }

  if (params.appointmentNeed) {
    return `Guten Tag, hier ist ${params.clientName}. Danke für Ihre Anfrage zu ${topic}.${missingText} Wir prüfen den Terminbedarf und melden uns mit den nächsten Schritten.`;
  }

  return `Guten Tag, hier ist ${params.clientName}. Danke für Ihre Anfrage zu ${topic}.${missingText} Wir prüfen Ihr Anliegen und melden uns gezielt zurück.`;
}

export function analyzeRecoveryBrain(lead: RecoveryBrainLead, client: RecoveryBrainClient): RecoveryBrainResult {
  const combinedText = normalize(`${lead.request_type || ""} ${lead.message || ""}`);
  const category = detectCategory(combinedText);
  const urgencyLabel = getUrgency(category, combinedText);
  const appointmentNeed = includesAny(combinedText, appointmentTerms);
  const missingInformation: string[] = [];

  if (!includesAny(combinedText, vehicleTerms)) {
    missingInformation.push("Fahrzeugmodell");
  }

  if (appointmentNeed && !includesAny(combinedText, timeTerms)) {
    missingInformation.push("gewünschtes Zeitfenster");
  }

  if (!lead.customer_phone) {
    missingInformation.push("Telefonnummer");
  }

  const shouldIncludeBookingLink = Boolean(client.booking_enabled && client.booking_url && appointmentNeed);
  const recommendedAction = buildRecommendedAction({
    category,
    urgencyLabel,
    appointmentNeed,
    missingInformation,
    shouldIncludeBookingLink,
  });
  const suggestedReply = buildSuggestedReply({
    clientName: client.name || "Ihr Betrieb",
    category,
    missingInformation,
    appointmentNeed,
    bookingUrl: client.booking_url || null,
    shouldIncludeBookingLink,
  });

  return {
    category,
    urgencyLabel,
    appointmentNeed,
    missingInformation,
    recommendedAction,
    suggestedReply,
    shouldIncludeBookingLink,
    reasoningSummary: `Kategorie aus Anfrageart und Nachricht erkannt. Dringlichkeit: ${urgencyLabel}. Terminbedarf: ${
      appointmentNeed ? "Ja" : "Nein"
    }. Fehlende Angaben: ${missingInformation.length ? missingInformation.join(", ") : "keine zentralen Angaben"}.`,
  };
}
