import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CLIENT_COOKIE_NAME, readClientSessionValue } from "@/lib/clientSession";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type ClientPortalClient = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  portal_enabled: boolean | null;
  booking_url: string | null;
  booking_enabled: boolean | null;
  recovery_message: string | null;
};

export async function requireClientPortalClient() {
  const cookieStore = await cookies();
  const session = readClientSessionValue(cookieStore.get(CLIENT_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/client/login");
  }

  const supabase = createServiceRoleClient();
  const { data: client, error } = await supabase
    .from("clients")
    .select("id, name, slug, industry, portal_enabled, booking_url, booking_enabled, recovery_message")
    .eq("id", session.clientId)
    .maybeSingle<ClientPortalClient>();

  if (error || !client || !client.portal_enabled) {
    redirect("/client/login");
  }

  return { client, supabase };
}
