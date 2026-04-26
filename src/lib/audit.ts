export const estimatedOrderValues = {
  Garage: 250,
  Reinigung: 450,
  Umzug: 900,
  Handwerk: 650,
  "Coiffeur/Kosmetik": 120,
} as const;

export type AuditIndustry = keyof typeof estimatedOrderValues;

export const auditIndustries = Object.keys(estimatedOrderValues) as AuditIndustry[];

export function isAuditIndustry(value: string): value is AuditIndustry {
  return value in estimatedOrderValues;
}

export function getEstimatedOrderValue(industry: AuditIndustry) {
  return estimatedOrderValues[industry];
}

export function calculateEstimatedMonthlyPotential(missedCallsPerWeek: number, estimatedOrderValueChf: number) {
  return Math.round(missedCallsPerWeek * 4.33 * 0.6 * 0.4 * estimatedOrderValueChf);
}

export function formatChf(value: number) {
  return `CHF ${value.toLocaleString("de-CH")}`;
}
