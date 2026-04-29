export const outreachStatuses = [
  { value: "new", label: "Neu" },
  { value: "researched", label: "Recherchiert" },
  { value: "called", label: "Angerufen" },
  { value: "interested", label: "Interessiert" },
  { value: "demo_scheduled", label: "Demo geplant" },
  { value: "pilot_offered", label: "Pilot angeboten" },
  { value: "pilot_won", label: "Pilot gewonnen" },
  { value: "not_interested", label: "Kein Interesse" },
  { value: "no_response", label: "Keine Rückmeldung" },
  { value: "later", label: "Später" },
] as const;

export const outreachPriorities = [
  { value: "high", label: "Hoch" },
  { value: "medium", label: "Mittel" },
  { value: "low", label: "Niedrig" },
] as const;

export type OutreachStatus = (typeof outreachStatuses)[number]["value"];
export type OutreachPriority = (typeof outreachPriorities)[number]["value"];

export type OutreachTargetRow = {
  id: string;
  created_at: string;
  updated_at: string | null;
  company_name: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  source: string | null;
  status: string | null;
  priority: string | null;
  fit_score: number | null;
  estimated_potential_chf: number | null;
  notes: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  next_action: string | null;
  demo_scheduled_at: string | null;
  pilot_value_chf: number | null;
  linked_client_id: string | null;
};

export function isOutreachStatus(value: string): value is OutreachStatus {
  return outreachStatuses.some((status) => status.value === value);
}

export function isOutreachPriority(value: string): value is OutreachPriority {
  return outreachPriorities.some((priority) => priority.value === value);
}

export function getOutreachStatusLabel(value: string | null | undefined) {
  return outreachStatuses.find((status) => status.value === value)?.label || "Neu";
}

export function getOutreachPriorityLabel(value: string | null | undefined) {
  return outreachPriorities.find((priority) => priority.value === value)?.label || "Mittel";
}

export function statusBadgeClass(status: string | null | undefined) {
  const value = status || "new";
  const classes: Record<string, string> = {
    new: "border-blue-200 bg-blue-50 text-blue-800",
    researched: "border-slate-200 bg-slate-100 text-slate-700",
    called: "border-cyan-200 bg-cyan-50 text-cyan-800",
    interested: "border-emerald-200 bg-swiss-mint text-emerald-800",
    demo_scheduled: "border-amber-200 bg-amber-50 text-amber-800",
    pilot_offered: "border-violet-200 bg-violet-50 text-violet-800",
    pilot_won: "border-emerald-300 bg-emerald-100 text-emerald-900",
    not_interested: "border-slate-200 bg-slate-100 text-slate-600",
    no_response: "border-red-200 bg-red-50 text-red-800",
    later: "border-indigo-200 bg-indigo-50 text-indigo-800",
  };

  return classes[value] || classes.new;
}

export function priorityBadgeClass(priority: string | null | undefined) {
  const value = priority || "medium";
  const classes: Record<string, string> = {
    high: "border-red-200 bg-red-50 text-red-800",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return classes[value] || classes.medium;
}

export function clampFitScore(value: number) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function nullableText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

export function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const number = Number(text);
  return Number.isFinite(number) ? Math.round(number) : null;
}

export function nullableDateTime(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function normalizeWebsiteUrl(value: string | null | undefined) {
  const website = value?.trim();
  if (!website) {
    return "";
  }

  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function isFollowUpDue(target: OutreachTargetRow, now = new Date()) {
  if (!target.next_follow_up_at || ["pilot_won", "not_interested"].includes(target.status || "new")) {
    return false;
  }

  return new Date(target.next_follow_up_at).getTime() <= now.getTime();
}

export function sortOutreachTargets(targets: OutreachTargetRow[]) {
  const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const statusWeight: Record<string, number> = {
    interested: 0,
    demo_scheduled: 1,
    pilot_offered: 2,
    called: 3,
    researched: 4,
    new: 5,
    no_response: 6,
    later: 7,
    not_interested: 8,
    pilot_won: 9,
  };
  const now = new Date();

  return [...targets].sort((left, right) => {
    const leftDue = isFollowUpDue(left, now) ? 0 : 1;
    const rightDue = isFollowUpDue(right, now) ? 0 : 1;
    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    const leftPriority = priorityWeight[left.priority || "medium"] ?? 1;
    const rightPriority = priorityWeight[right.priority || "medium"] ?? 1;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftStatus = statusWeight[left.status || "new"] ?? 5;
    const rightStatus = statusWeight[right.status || "new"] ?? 5;
    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function buildSlugFromCompany(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
