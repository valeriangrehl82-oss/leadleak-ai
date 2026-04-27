import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    hasTwilioAccountSid: Boolean(process.env.TWILIO_ACCOUNT_SID),
    hasTwilioAuthToken: Boolean(process.env.TWILIO_AUTH_TOKEN),
  });
}
