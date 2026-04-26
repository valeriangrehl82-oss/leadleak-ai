import { createBrowserClient } from "@supabase/ssr";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL fehlt.");
  }

  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt.");
  }

  return { supabaseUrl, publicKey };
}

export function createClient() {
  const { supabaseUrl, publicKey } = getSupabaseConfig();

  // Browser client usage:
  // Use this helper only in Client Components or browser-only modules.
  // It uses the public anon/publishable key. Never expose service_role keys here.
  return createBrowserClient(supabaseUrl, publicKey);
}
