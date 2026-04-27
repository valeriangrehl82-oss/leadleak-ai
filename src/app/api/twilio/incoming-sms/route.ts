import { NextResponse } from "next/server";
import { formatChf } from "@/lib/audit";
import { sendOperationalEmail } from "@/lib/resend";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ClientRow = {
  id: string;
  name: string;
  notification_email: string;
  average_order_value_chf: number | null;
};

type LeadRow = {
  id: string;
  message: string | null;
  internal_summary: string | null;
  estimated_value_chf: number | null;
};

type LeadIdRow = {
  id: string;
};

function twimlResponse(xml = "<Response></Response>", status = 200) {
  return new NextResponse(xml, {
    status,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function formDataToObject(formData: FormData) {
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    payload[key] = typeof value === "string" ? value : value.name;
  });
  return payload;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Zurich",
  }).format(value);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawPayload = formDataToObject(formData);
  const from = rawPayload.From || "";
  const to = rawPayload.To || "";
  const body = rawPayload.Body || "";
  const messageSid = rawPayload.MessageSid || "";
  const createdAt = new Date();

  if (!from || !to) {
    return twimlResponse("<Response></Response>", 400);
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, notification_email, average_order_value_chf")
      .eq("twilio_phone_number", to)
      .maybeSingle<ClientRow>();

    if (clientError || !client) {
      return twimlResponse();
    }

    const estimatedValueChf = client.average_order_value_chf || 250;
    const { data: existingLead } = await supabase
      .from("client_leads")
      .select("id, message, internal_summary, estimated_value_chf")
      .eq("client_id", client.id)
      .eq("customer_phone", from)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<LeadRow>();

    let leadId = existingLead?.id;

    if (existingLead) {
      const appendedMessage = existingLead.message
        ? `${existingLead.message}\n\nSMS Antwort (${formatDate(createdAt)}): ${body || "-"}`
        : body || null;
      const nextSummary = `${existingLead.internal_summary || `SMS von ${from}`}\nLetzte SMS: ${body || "-"}`;

      const { error: updateError } = await supabase
        .from("client_leads")
        .update({
          message: appendedMessage,
          internal_summary: nextSummary,
          status: "qualified",
        })
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Twilio SMS lead update failed:", updateError);
      }
    } else {
      const { data: newLead, error: insertError } = await supabase
        .from("client_leads")
        .insert({
          client_id: client.id,
          customer_phone: from,
          request_type: "SMS Antwort",
          message: body || null,
          source: "twilio_sms",
          status: "qualified",
          estimated_value_chf: estimatedValueChf,
          internal_summary: `SMS von ${from}: ${body || "-"}`,
        })
        .select("id")
        .single<LeadIdRow>();

      if (insertError || !newLead) {
        console.error("Twilio SMS lead insert failed:", insertError);
        return twimlResponse("<Response></Response>", 500);
      }

      leadId = newLead.id;
    }

    const { error: messageError } = await supabase.from("client_messages").insert({
      client_id: client.id,
      client_lead_id: leadId || null,
      direction: "inbound",
      channel: "sms",
      from_number: from,
      to_number: to,
      body: body || null,
      twilio_message_sid: messageSid || null,
      raw_payload: rawPayload,
    });

    if (messageError) {
      console.error("Twilio inbound SMS message insert failed:", messageError);
    }

    try {
      const emailSent = await sendOperationalEmail({
        to: client.notification_email,
        subject: "Neue SMS-Antwort über LeadLeak AI",
        text: [
          "Neue SMS-Antwort über LeadLeak AI",
          "",
          `Betrieb: ${client.name}`,
          `Telefon: ${from}`,
          `Twilio-Nummer: ${to}`,
          `Nachricht: ${body || "-"}`,
          `Geschätzter Wert: ${formatChf(estimatedValueChf)}`,
          `Zeitpunkt: ${formatDate(createdAt)}`,
        ].join("\n"),
      });

      if (emailSent) {
        console.log("Resend email sent");
      }
    } catch (error) {
      console.error("Resend email failed", error);
    }

    return twimlResponse();
  } catch (error) {
    console.error("Twilio incoming SMS failed:", error);
    return twimlResponse("<Response></Response>", 500);
  }
}
