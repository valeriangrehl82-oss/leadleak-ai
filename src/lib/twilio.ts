type SendSmsInput = {
  to: string;
  from: string;
  body: string;
};

type TwilioMessageResponse = {
  sid?: string;
  error_message?: string | null;
  message?: string;
};

export async function sendSms({ to, from, body }: SendSmsInput) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  console.log("Twilio Account SID configured:", Boolean(accountSid));
  console.log("Twilio Auth Token configured:", Boolean(authToken));

  if (!accountSid || !authToken) {
    return { sent: false };
  }

  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = (await response.json()) as TwilioMessageResponse;

  if (!response.ok) {
    console.error("Twilio SMS failed:", data.message || data.error_message || response.statusText);
    return { sent: false };
  }

  console.log("Twilio SMS sent");
  return { sent: true, sid: data.sid };
}
