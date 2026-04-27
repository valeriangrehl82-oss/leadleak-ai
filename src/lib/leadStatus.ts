export const leadStatuses = [
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "qualified", label: "Qualifiziert" },
  { value: "won", label: "Gewonnen" },
  { value: "lost", label: "Verloren" },
] as const;

export type LeadStatus = (typeof leadStatuses)[number]["value"];

export function isLeadStatus(value: string): value is LeadStatus {
  return leadStatuses.some((status) => status.value === value);
}

export function getLeadStatusLabel(value: string | null | undefined) {
  return leadStatuses.find((status) => status.value === value)?.label || "Neu";
}
