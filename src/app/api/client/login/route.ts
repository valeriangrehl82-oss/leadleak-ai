import { NextResponse } from "next/server";
import {
  CLIENT_COOKIE_MAX_AGE,
  CLIENT_COOKIE_NAME,
  createClientSessionValue,
  isClientPortalConfigError,
  verifyClientAccessCode,
} from "@/lib/clientSession";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

type LoginBody = {
  slug?: unknown;
  accessCode?: unknown;
};

type ClientRow = {
  id: string;
  portal_enabled: boolean | null;
  portal_access_code_hash: string | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function invalidLogin() {
  return NextResponse.json(
    { error: "Login fehlgeschlagen. Bitte Slug und Zugangscode prüfen." },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = await request.json();
  } catch {
    return invalidLogin();
  }

  const slug = readString(body.slug).toLowerCase();
  const accessCode = readString(body.accessCode);

  if (!slug || !accessCode) {
    return invalidLogin();
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: client, error } = await supabase
      .from("clients")
      .select("id, portal_enabled, portal_access_code_hash")
      .eq("slug", slug)
      .maybeSingle<ClientRow>();

    if (error || !client || !client.portal_enabled || !client.portal_access_code_hash) {
      return invalidLogin();
    }

    if (!verifyClientAccessCode(accessCode, client.portal_access_code_hash)) {
      return invalidLogin();
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: CLIENT_COOKIE_NAME,
      value: createClientSessionValue(client.id),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/client",
      maxAge: CLIENT_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    if (isSupabaseConfigError(error) || isClientPortalConfigError(error)) {
      return NextResponse.json({ error: "Kundenportal ist noch nicht konfiguriert." }, { status: 500 });
    }

    console.error("Client login failed:", error);
    return NextResponse.json({ error: "Serverfehler. Bitte später erneut versuchen." }, { status: 500 });
  }
}
