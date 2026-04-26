export type LeadStatus = "New" | "Qualified" | "Booked" | "Lost";

export type BusinessType = "Garage" | "Reinigung" | "Umzug" | "Handwerk";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  branche: BusinessType;
  anfrage: string;
  status: LeadStatus;
  value: string;
  lastAction: string;
  summary: string;
  urgency: string;
  customerReply: string;
  recommendedAction: string;
  suggestedMessage: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  setupFee: string;
  description: string;
  features: string[];
  recommended?: boolean;
};
