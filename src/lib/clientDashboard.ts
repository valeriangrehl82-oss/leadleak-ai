import type { LeadDnaProfile } from "@/lib/leadDna";

export type ClientDashboardLead = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  request_type: string | null;
  message: string | null;
  status: string | null;
  estimated_value_chf: number | null;
  source?: string | null;
};

export type NextBestAction = {
  title: string;
  explanation: string;
  priority: "Hoch" | "Mittel" | "Basis";
  related?: string;
};

export type RecentActivity = {
  id: string;
  createdAt: string;
  title: string;
  detail: string;
};

const openStatuses = new Set(["new", "qualified", "contacted"]);

function getStatus(value: string | null | undefined) {
  return value || "new";
}

function getLeadAgeHours(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return 0;
  }

  return Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
}

export function calculateDashboardMetrics(leads: ClientDashboardLead[]) {
  const total = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value_chf || 0), 0);
  const won = leads.filter((lead) => getStatus(lead.status) === "won").length;
  const lost = leads.filter((lead) => getStatus(lead.status) === "lost").length;
  const openPriorities = leads.filter((lead) => openStatuses.has(getStatus(lead.status))).length;
  const processed = leads.filter((lead) => getStatus(lead.status) !== "new").length;
  const processingRate = total ? Math.round((processed / total) * 100) : 0;
  const averageValue = total ? Math.round(totalValue / total) : 0;

  return {
    total,
    totalValue,
    openPriorities,
    processingRate,
    won,
    lost,
    open: openPriorities,
    averageValue,
  };
}

export function getMostCommonRequestType(leads: ClientDashboardLead[]) {
  const counts = leads.reduce<Record<string, number>>((currentCounts, lead) => {
    const requestType = lead.request_type?.trim();
    if (!requestType) {
      return currentCounts;
    }

    currentCounts[requestType] = (currentCounts[requestType] || 0) + 1;
    return currentCounts;
  }, {});

  const [requestType, count] =
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0] || [];

  return {
    requestType: requestType || "-",
    count: count || 0,
  };
}

export function getNextBestActions(leads: ClientDashboardLead[]) {
  if (!leads.length) {
    return [
      {
        title: "Pilot-Link aktiv teilen",
        explanation: "Erste Anfragen erfassen, damit die Auswertung aussagekräftig wird.",
        priority: "Basis",
      },
    ] satisfies NextBestAction[];
  }

  const actions: NextBestAction[] = [];
  const olderNewLeads = leads.filter((lead) => getStatus(lead.status) === "new" && getLeadAgeHours(lead.created_at) > 24);
  const highValueLead = [...leads].sort((left, right) => (right.estimated_value_chf || 0) - (left.estimated_value_chf || 0))[0];
  const commonType = getMostCommonRequestType(leads);
  const wonCount = leads.filter((lead) => getStatus(lead.status) === "won").length;
  const openCount = leads.filter((lead) => openStatuses.has(getStatus(lead.status))).length;

  if (olderNewLeads.length) {
    actions.push({
      title: "Offene Anfragen zuerst nachfassen",
      explanation: "Mehrere Anfragen sind noch nicht bearbeitet.",
      priority: "Hoch",
      related: olderNewLeads[0].customer_name || olderNewLeads[0].request_type || undefined,
    });
  }

  if ((highValueLead?.estimated_value_chf || 0) >= 500) {
    actions.push({
      title: "Hochwertige Anfrage priorisieren",
      explanation: "Diese Anfrage hat ein hohes geschätztes Potenzial.",
      priority: "Hoch",
      related: highValueLead.customer_name || highValueLead.request_type || undefined,
    });
  }

  if (commonType.count >= 2) {
    actions.push({
      title: "Häufige Anfrageart strukturieren",
      explanation: `Mehrere Anfragen betreffen ${commonType.requestType}.`,
      priority: "Mittel",
      related: commonType.requestType,
    });
  }

  if (wonCount) {
    actions.push({
      title: "Gewonnene Anfragen dokumentieren",
      explanation: "Erfolge helfen bei der Pilot-Auswertung.",
      priority: "Mittel",
      related: `${wonCount} gewonnen`,
    });
  }

  if (openCount) {
    actions.push({
      title: "Status nach jeder Rückmeldung aktualisieren",
      explanation: "So bleibt die Auswertung sauber und nachvollziehbar.",
      priority: "Basis",
      related: `${openCount} offen`,
    });
  }

  const fallbackActions: NextBestAction[] = [
    {
      title: "Erfassungslink im Team sichtbar halten",
      explanation: "So werden relevante Anfragen konsequent über den Pilot-Prozess erfasst.",
      priority: "Basis",
    },
    {
      title: "Anfragequalität regelmässig prüfen",
      explanation: "Kurze interne Reviews helfen, den Rückmeldeprozess weiter zu schärfen.",
      priority: "Basis",
    },
    {
      title: "Pilot-Auswertung wöchentlich besprechen",
      explanation: "Die Kennzahlen zeigen, welche Anfragearten und Potenziale sichtbar werden.",
      priority: "Mittel",
    },
  ];

  for (const fallbackAction of fallbackActions) {
    if (actions.length >= 3) {
      break;
    }
    if (!actions.some((action) => action.title === fallbackAction.title)) {
      actions.push(fallbackAction);
    }
  }

  return actions.slice(0, 5);
}

export function getRecentActivities(leads: ClientDashboardLead[], limit = 8): RecentActivity[] {
  return [...leads]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, limit)
    .map((lead) => {
      const status = getStatus(lead.status);
      const titleByStatus: Record<string, string> = {
        new: "Neue Anfrage erfasst",
        contacted: "Anfrage als kontaktiert markiert",
        qualified: "Anfrage qualifiziert",
        won: "Anfrage gewonnen",
        lost: "Anfrage verloren",
      };

      return {
        id: lead.id,
        createdAt: lead.created_at,
        title: titleByStatus[status] || "Anfrage aktualisiert",
        detail: `${lead.customer_name || "Unbekannter Kontakt"} · ${lead.request_type || "Anfrage ohne Kategorie"}`,
      };
    });
}

export function getStrongestLeadDnaSignal(profile: LeadDnaProfile) {
  const strongest = [...profile.dimensions].sort((left, right) => right.score - left.score)[0];
  const labelByKey: Record<string, string> = {
    value: "Hoher Auftragswert",
    urgency: "Hohe Dringlichkeit",
    competitionRisk: "Hoher Konkurrenzdruck",
    responsePressure: "Hoher Nachfassbedarf",
    closeProbability: "Hohe Anfragequalität",
  };

  return labelByKey[strongest.key] || "Priorität prüfen";
}
