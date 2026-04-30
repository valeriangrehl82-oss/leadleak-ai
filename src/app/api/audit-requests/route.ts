import { NextResponse } from "next/server";
import {
  calculateEstimatedMonthlyPotential,
  getEstimatedOrderValue,
  isAuditIndustry,
} from "@/lib/audit";
import { sendAuditNotificationEmail } from "@/lib/resend";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

type AuditRequestBody = {
  companyName?: unknown;
  industry?: unknown;
  contactPerson?: unknown;
  phone?: unknown;
  email?: unknown;
  missedCallsPerWeek?: unknown;
  currentProblem?: unknown;
};

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: AuditRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage. Bitte Formular erneut senden." }, { status: 400 });
  }

  const companyName = readRequiredString(body.companyName);
  const industry = readRequiredString(body.industry);
  const contactPerson = readRequiredString(body.contactPerson);
  const phone = readRequiredString(body.phone);
  const email = readRequiredString(body.email);
  const currentProblem = readRequiredString(body.currentProblem);
  const missedCallsPerWeek = Number(body.missedCallsPerWeek);

  if (!companyName || !industry || (!phone && !email)) {
    return NextResponse.json({ error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
  }

  if (email && !email.includes("@")) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
  }

  if (!isAuditIndustry(industry)) {
    return NextResponse.json({ error: "Bitte eine gültige Branche auswählen." }, { status: 400 });
  }

  if (!Number.isFinite(missedCallsPerWeek) || missedCallsPerWeek < 0) {
    return NextResponse.json({ error: "Bitte eine gültige Anzahl verpasster Anrufe eingeben." }, { status: 400 });
  }

  const estimatedOrderValueChf = getEstimatedOrderValue(industry);
  const estimatedMonthlyPotentialChf = calculateEstimatedMonthlyPotential(
    missedCallsPerWeek,
    estimatedOrderValueChf,
  );
  const createdAt = new Date();

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("audit_requests").insert({
      company_name: companyName,
      industry,
      contact_person: contactPerson || companyName,
      phone,
      email,
      missed_calls_per_week: Math.round(missedCallsPerWeek),
      current_problem: currentProblem || null,
      estimated_order_value_chf: estimatedOrderValueChf,
      estimated_monthly_potential_chf: estimatedMonthlyPotentialChf,
      status: "new",
    });

    if (error) {
      console.error("Supabase audit insert failed:", error);
      return NextResponse.json(
        { error: "Audit-Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Audit request failed:", error);
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert. Bitte Umgebungsvariablen prüfen." },
      { status: 500 },
    );
  }

  try {
    const emailSent = await sendAuditNotificationEmail({
      companyName,
      industry,
      contactPerson: contactPerson || companyName,
      phone,
      email,
      missedCallsPerWeek: Math.round(missedCallsPerWeek),
      currentProblem,
      estimatedOrderValueChf,
      estimatedMonthlyPotentialChf,
      createdAt,
    });

    if (emailSent) {
      console.log("Resend email sent");
    }
  } catch (error) {
    console.error("Resend email failed", error);
  }

  return NextResponse.json({
    message: "Audit-Anfrage gespeichert. Nächster Schritt: Einschätzung vorbereiten.",
    estimatedOrderValueChf,
    estimatedMonthlyPotentialChf,
    summary: `Bei ${Math.round(
      missedCallsPerWeek,
    )} verpassten Anfragen pro Woche und einem durchschnittlichen Auftragswert von CHF ${estimatedOrderValueChf.toLocaleString(
      "de-CH",
    )} könnte bereits ein kleiner Rückgewinnungsanteil relevant sein.`,
  });
}
