import { NextResponse } from "next/server";
import { formatChf } from "@/lib/audit";
import { sendOperationalEmail } from "@/lib/resend";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/twilio";

export const runtime = "nodejs";

type ClientRow = {
  id: string;
  name: string;
  notification_email: string;
  average_order_value_chf: number | null;
  recovery_message: string | null;
};

type LeadIdRow = {
  id: string;
};

function twimlResponse(xml: string, status = 200) {
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
  const callSid = rawPayload.CallSid || "";
  const createdAt = new Date();

  const defaultXml = "<Response><Say language='de-DE'>Danke für Ihren Anruf. Wir melden uns zeitnah.</Say></Response>";

  if (!from || !to) {
    return twimlResponse(defaultXml, 400);
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, notification_email, average_order_value_chf, recovery_message")
      .eq("twilio_phone_number", to)
      .maybeSingle<ClientRow>();

    if (clientError || !client) {
      return twimlResponse("<Response><Say language='de-DE'>Danke für Ihren Anruf.</Say></Response>");
    }

    const estimatedValueChf = client.average_order_value_chf || 250;
    const internalSummary = `Verpasster oder eingehender Anruf von ${from}.`;

    const { data: lead, error: leadError } = await supabase
      .from("client_leads")
      .insert({
        client_id: client.id,
        customer_phone: from,
        request_type: "Verpasster Anruf",
        message: "Eingehender Anruf via Twilio",
        status: "new",
        estimated_value_chf: estimatedValueChf,
        source: "twilio_call",
        internal_summary: internalSummary,
      })
      .select("id")
      .single<LeadIdRow>();

    if (leadError || !lead) {
      console.error("Twilio call lead insert failed:", leadError);
      return twimlResponse(defaultXml, 500);
    }

    const { error: inboundMessageError } = await supabase.from("client_messages").insert({
      client_id: client.id,
      client_lead_id: lead.id,
      direction: "inbound",
      channel: "call",
      from_number: from,
      to_number: to,
      twilio_call_sid: callSid || null,
      raw_payload: rawPayload,
    });

    if (inboundMessageError) {
      console.error("Twilio inbound call message insert failed:", inboundMessageError);
    }

    const recoveryBody =
      client.recovery_message ||
      `Guten Tag, hier ist ${client.name}. Wir haben Ihren Anruf gesehen. Worum geht es? Antworten Sie kurz per SMS, damit wir uns gezielt melden können.`;

    const smsResult = await sendSms({ to: from, from: to, body: recoveryBody });

    if (smsResult.sent) {
      const { error: outboundMessageError } = await supabase.from("client_messages").insert({
        client_id: client.id,
        client_lead_id: lead.id,
        direction: "outbound",
        channel: "sms",
        from_number: to,
        to_number: from,
        body: recoveryBody,
        twilio_message_sid: smsResult.sid || null,
        raw_payload: { source: "leadleak_recovery_sms" },
      });

      if (outboundMessageError) {
        console.error("Twilio outbound SMS message insert failed:", outboundMessageError);
      }
    }

    try {
      const emailSent = await sendOperationalEmail({
        to: client.notification_email,
        subject: "Verpasster Anruf über LeadLeak AI",
        text: [
          "Verpasster Anruf über LeadLeak AI",
          "",
          `Betrieb: ${client.name}`,
          `Anrufer: ${from}`,
          `Twilio-Nummer: ${to}`,
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

    return twimlResponse(defaultXml);
  } catch (error) {
    console.error("Twilio incoming call failed:", error);
    return twimlResponse(defaultXml, 500);
  }
}
