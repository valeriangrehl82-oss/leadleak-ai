export type LeadDnaInput = {
  estimated_value_chf?: number | null;
  request_type?: string | null;
  status?: string | null;
  created_at?: string | null;
  message?: string | null;
  customer_name?: string | null;
};

export type LeadDnaLevel = "Niedrig" | "Mittel" | "Hoch";

export type LeadDnaDimensionKey =
  | "value"
  | "urgency"
  | "responsePressure"
  | "competitionRisk"
  | "closeProbability";

export type LeadDnaDimension = {
  key: LeadDnaDimensionKey;
  label: string;
  score: number;
  level: LeadDnaLevel;
  explanation: string;
};

export type LeadDnaProfile = {
  dimensions: LeadDnaDimension[];
  summary: string;
  recommendedAction: string;
  highlightBadge: string;
  totalScore: number;
  priorityScore: number;
};

const urgentTerms = ["brems", "batterie", "notfall", "panne", "mfk", "dringend", "sofort"];
const competitorTerms = ["reifenwechsel", "reinigungsofferte", "umzugsofferte", "offerte", "standard-service", "standard service", "klimaservice"];
const buyingIntentTerms = ["termin", "service", "mfk", "offerte", "wechsel", "reparatur", "check", "vorbereitung", "buchen"];
const openStatuses = new Set(["new", "qualified", "contacted", "booked"]);

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelFromScore(score: number): LeadDnaLevel {
  if (score >= 70) {
    return "Hoch";
  }

  if (score >= 45) {
    return "Mittel";
  }

  return "Niedrig";
}

function normalizeText(value: string | null | undefined) {
  return (value || "").toLowerCase();
}

function hasAnyTerm(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function getAgeHours(createdAt: string | null | undefined) {
  if (!createdAt) {
    return 0;
  }

  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return 0;
  }

  return Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
}

function isOpenStatus(status: string) {
  return openStatuses.has(status);
}

function buildSummary(dimensions: LeadDnaDimension[]) {
  const byKey = Object.fromEntries(dimensions.map((dimension) => [dimension.key, dimension]));
  const value = byKey.value;
  const urgency = byKey.urgency;
  const pressure = byKey.responsePressure;
  const competition = byKey.competitionRisk;
  const close = byKey.closeProbability;

  return `Auftragswert: ${value.level}. Dringlichkeit: ${urgency.level}. Konkurrenzdruck: ${competition.level}. Nachfassbedarf: ${pressure.level}. Anfragequalität: ${close.level}. Eine zeitnahe, strukturierte Rückmeldung ist sinnvoll.`;
}

export function getLeadDnaProfile(lead: LeadDnaInput): LeadDnaProfile {
  const value = lead.estimated_value_chf || 0;
  const requestText = normalizeText(`${lead.request_type || ""} ${lead.message || ""}`);
  const status = normalizeText(lead.status || "new");
  const ageHours = getAgeHours(lead.created_at);
  const leadIsOpen = isOpenStatus(status);
  const hasUrgencySignal = hasAnyTerm(requestText, urgentTerms);
  const hasCompetitorSignal = hasAnyTerm(requestText, competitorTerms);
  const hasBuyingIntent = hasAnyTerm(requestText, buyingIntentTerms);

  const valueScore = value >= 500 ? 86 : value >= 250 ? 62 : value > 0 ? 38 : 25;

  let urgencyScore = 38;
  if (hasUrgencySignal) {
    urgencyScore += 35;
  }
  if (leadIsOpen && ageHours <= 24) {
    urgencyScore += 12;
  }
  if (status === "new" || status === "qualified") {
    urgencyScore += 8;
  }

  let responsePressureScore = status === "won" || status === "lost" ? 18 : 30;
  if (status === "new") {
    responsePressureScore += 30;
  } else if (status === "qualified") {
    responsePressureScore += 24;
  } else if (status === "contacted") {
    responsePressureScore += 12;
  }
  if (leadIsOpen && ageHours > 48) {
    responsePressureScore += 20;
  } else if (leadIsOpen && ageHours > 24) {
    responsePressureScore += 15;
  } else if (leadIsOpen && ageHours > 12) {
    responsePressureScore += 10;
  }

  let competitionRiskScore = 32;
  if (hasCompetitorSignal) {
    competitionRiskScore += 28;
  }
  if (leadIsOpen && ageHours > 48) {
    competitionRiskScore += 15;
  } else if (leadIsOpen && ageHours > 24) {
    competitionRiskScore += 10;
  }
  if (status === "won") {
    competitionRiskScore -= 20;
  }

  let closeProbabilityScore = 35;
  if (value >= 500) {
    closeProbabilityScore += 18;
  } else if (value >= 250) {
    closeProbabilityScore += 12;
  }
  if (status === "won") {
    closeProbabilityScore += 45;
  } else if (status === "qualified") {
    closeProbabilityScore += 22;
  } else if (status === "contacted") {
    closeProbabilityScore += 18;
  } else if (status === "new") {
    closeProbabilityScore += 8;
  }
  if (hasBuyingIntent) {
    closeProbabilityScore += 14;
  }
  if (leadIsOpen && ageHours > 72) {
    closeProbabilityScore -= 18;
  }
  if (status === "lost") {
    closeProbabilityScore = 18;
  }

  const dimensions: LeadDnaDimension[] = [
    {
      key: "value",
      label: "Auftragswert",
      score: clampScore(valueScore),
      level: levelFromScore(clampScore(valueScore)),
      explanation: "Geschätzter wirtschaftlicher Wert der Anfrage.",
    },
    {
      key: "urgency",
      label: "Dringlichkeit",
      score: clampScore(urgencyScore),
      level: levelFromScore(clampScore(urgencyScore)),
      explanation: "Zeigt, wie zeitnah die Anfrage bearbeitet werden sollte.",
    },
    {
      key: "responsePressure",
      label: "Nachfassbedarf",
      score: clampScore(responsePressureScore),
      level: levelFromScore(clampScore(responsePressureScore)),
      explanation: "Zeigt, ob eine aktive Nachbearbeitung sinnvoll ist.",
    },
    {
      key: "competitionRisk",
      label: "Konkurrenzdruck",
      score: clampScore(competitionRiskScore),
      level: levelFromScore(clampScore(competitionRiskScore)),
      explanation: "Zeigt, wie leicht die Anfrage bei einem anderen Anbieter landen könnte.",
    },
    {
      key: "closeProbability",
      label: "Anfragequalität",
      score: clampScore(closeProbabilityScore),
      level: levelFromScore(clampScore(closeProbabilityScore)),
      explanation: "Zeigt, wie konkret und verwertbar die Anfrage für den Betrieb ist.",
    },
  ];

  const totalScore = clampScore(dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length);
  const priorityScore = clampScore(
    dimensions.reduce((sum, dimension) => {
      const weight =
        dimension.key === "responsePressure" || dimension.key === "competitionRisk" || dimension.key === "urgency"
          ? 1.2
          : 1;
      return sum + dimension.score * weight;
    }, 0) / 5.6,
  );

  const responsePressure = dimensions.find((dimension) => dimension.key === "responsePressure")?.score || 0;
  const urgency = dimensions.find((dimension) => dimension.key === "urgency")?.score || 0;
  const competitionRisk = dimensions.find((dimension) => dimension.key === "competitionRisk")?.score || 0;
  const closeProbability = dimensions.find((dimension) => dimension.key === "closeProbability")?.score || 0;

  let recommendedAction = "Heute zurückrufen";
  if (responsePressure >= 80 || urgency >= 80) {
    recommendedAction = "Sofort nachfassen";
  } else if (competitionRisk >= 75) {
    recommendedAction = "Offerte klären";
  } else if (closeProbability >= 75) {
    recommendedAction = "Termin priorisieren";
  }

  let highlightBadge = "Priorität prüfen";
  if (valueScore >= 75 && closeProbability >= 65) {
    highlightBadge = "Hohes Potenzial";
  } else if (responsePressure >= 75) {
    highlightBadge = "Hoher Nachfassbedarf";
  } else if (competitionRisk >= 75) {
    highlightBadge = "Hoher Konkurrenzdruck";
  } else if (urgency >= 75) {
    highlightBadge = "Hohe Dringlichkeit";
  }

  return {
    dimensions,
    summary: buildSummary(dimensions),
    recommendedAction,
    highlightBadge,
    totalScore,
    priorityScore,
  };
}

export function getTopLeadDnaHighlights<TLead extends LeadDnaInput>(leads: TLead[], limit = 3) {
  return leads
    .map((lead) => ({ lead, profile: getLeadDnaProfile(lead) }))
    .sort((left, right) => right.profile.priorityScore - left.profile.priorityScore)
    .slice(0, limit);
}
