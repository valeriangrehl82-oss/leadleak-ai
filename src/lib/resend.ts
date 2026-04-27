import { Resend } from "resend";
import { formatChf } from "@/lib/audit";

type AuditNotificationInput = {
  companyName: string;
  industry: string;
  contactPerson: string;
  phone: string;
  email: string;
  missedCallsPerWeek: number;
  currentProblem: string;
  estimatedOrderValueChf: number;
  estimatedMonthlyPotentialChf: number;
  createdAt: Date;
};

type ClientLeadNotificationInput = {
  clientName: string;
  notificationEmail: string;
  adminNotificationEmail?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  requestType: string;
  message: string;
  estimatedValueChf: number;
  createdAt: Date;
};

type OperationalEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function buildAuditEmailText(input: AuditNotificationInput) {
  return [
    "Neue LeadLeak AI Audit-Anfrage",
    "",
    `Firmenname: ${input.companyName}`,
    `Branche: ${input.industry}`,
    `Kontaktperson: ${input.contactPerson}`,
    `Telefon: ${input.phone}`,
    `E-Mail: ${input.email}`,
    `Verpasste Anrufe pro Woche: ${input.missedCallsPerWeek}`,
    `Geschätzter Auftragswert: ${formatChf(input.estimatedOrderValueChf)}`,
    `Geschätztes monatliches Potenzial: ${formatChf(input.estimatedMonthlyPotentialChf)}`,
    `Aktuelles Problem: ${input.currentProblem || "-"}`,
    `Zeitpunkt: ${formatDate(input.createdAt)}`,
  ].join("\n");
}

function buildClientLeadEmailText(input: ClientLeadNotificationInput) {
  return [
    "Neue Anfrage über LeadLeak AI",
    "",
    `Betrieb: ${input.clientName}`,
    `Kunde: ${input.customerName || "-"}`,
    `Telefon: ${input.customerPhone || "-"}`,
    `E-Mail: ${input.customerEmail || "-"}`,
    `Anfrageart: ${input.requestType || "-"}`,
    `Nachricht: ${input.message || "-"}`,
    `Geschätzter Wert: ${formatChf(input.estimatedValueChf)}`,
    `Zeitpunkt: ${formatDate(input.createdAt)}`,
  ].join("\n");
}

export async function sendAuditNotificationEmail(input: AuditNotificationInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  console.log("Resend configured:", Boolean(resendApiKey));
  console.log("Admin notification email configured:", Boolean(adminNotificationEmail));

  if (!resendApiKey || !adminNotificationEmail) {
    return false;
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: "LeadLeak AI <onboarding@resend.dev>",
    to: [adminNotificationEmail],
    subject: `Neue LeadLeak AI Audit-Anfrage: ${input.companyName}`,
    text: buildAuditEmailText(input),
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }

  return true;
}

export async function sendClientLeadNotificationEmail(input: ClientLeadNotificationInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const recipients = [input.notificationEmail, input.adminNotificationEmail].filter(Boolean) as string[];

  console.log("Resend configured:", Boolean(resendApiKey));
  console.log("Admin notification email configured:", Boolean(input.adminNotificationEmail));

  if (!resendApiKey || recipients.length === 0) {
    return false;
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: "LeadLeak AI <onboarding@resend.dev>",
    to: recipients,
    subject: `Neue Anfrage über LeadLeak AI: ${input.requestType}`,
    text: buildClientLeadEmailText(input),
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }

  return true;
}

export async function sendOperationalEmail(input: OperationalEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const recipients = Array.isArray(input.to) ? input.to.filter(Boolean) : [input.to].filter(Boolean);

  console.log("Resend configured:", Boolean(resendApiKey));

  if (!resendApiKey || recipients.length === 0) {
    return false;
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: "LeadLeak AI <onboarding@resend.dev>",
    to: recipients,
    subject: input.subject,
    text: input.text,
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }

  return true;
}
