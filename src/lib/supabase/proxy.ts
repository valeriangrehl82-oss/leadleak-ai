import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publicKey) {
    return null;
  }

  return { supabaseUrl, publicKey };
}

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });

  if (!config) {
    return supabaseResponse;
  }

  const supabase = createServerClient(config.supabaseUrl, config.publicKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Proxy keeps Supabase auth cookies fresh before pages and route handlers read them.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
