import { NextResponse } from "next/server";
import { createLeadActivity } from "@/lib/leadActivities";
import { sendClientLeadNotificationEmail } from "@/lib/resend";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

type ClientLeadBody = {
  slug?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
  customerEmail?: unknown;
  requestType?: unknown;
  message?: unknown;
};

type ClientRow = {
  id: string;
  name: string;
  notification_email: string;
  average_order_value_chf: number | null;
  is_active: boolean | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: ClientLeadBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const slug = readString(body.slug);
  const customerName = readString(body.customerName);
  const customerPhone = readString(body.customerPhone);
  const customerEmail = readString(body.customerEmail);
  const requestType = readString(body.requestType);
  const message = readString(body.message);

  if (!slug || !customerName || !customerPhone || !requestType) {
    return NextResponse.json({ error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
  }

  const createdAt = new Date();

  try {
    const supabase = createServiceRoleClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, notification_email, average_order_value_chf, is_active")
      .eq("slug", slug)
      .maybeSingle<ClientRow>();

    if (clientError || !client || !client.is_active) {
      return NextResponse.json({ error: "Dieser Pilot-Link ist nicht verfügbar." }, { status: 404 });
    }

    const estimatedValueChf = client.average_order_value_chf || 250;
    const internalSummary = `${customerName} fragt wegen ${requestType}. Nachricht: ${message || "-"}`;

    const { data: insertedLead, error: insertError } = await supabase
      .from("client_leads")
      .insert({
        client_id: client.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        request_type: requestType,
        message: message || null,
        status: "new",
        estimated_value_chf: estimatedValueChf,
        source: "pilot_form",
        internal_summary: internalSummary,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertError) {
      console.error("Client lead insert failed:", insertError);
      return NextResponse.json(
        { error: "Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." },
        { status: 500 },
      );
    }

    if (insertedLead) {
      await createLeadActivity({
        supabase,
        leadId: insertedLead.id,
        clientId: client.id,
        actorType: "system",
        actorLabel: "Öffentlicher Erfassungslink",
        activityType: "lead_created",
        message: "Lead über öffentlichen Erfassungslink erstellt.",
      });
    }

    try {
      const emailSent = await sendClientLeadNotificationEmail({
        clientName: client.name,
        notificationEmail: client.notification_email,
        adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
        customerName,
        customerPhone,
        customerEmail,
        requestType,
        message,
        estimatedValueChf,
        createdAt,
      });

      if (emailSent) {
        console.log("Resend email sent");
      }
    } catch (error) {
      console.error("Resend email failed", error);
    }

    return NextResponse.json({
      message: "Ihre Anfrage wurde gespeichert. Der Betrieb meldet sich zeitnah.",
    });
  } catch (error) {
    console.error("Client lead request failed:", error);
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Serverfehler. Bitte später erneut versuchen." }, { status: 500 });
  }
}
