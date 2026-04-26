import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const MISSING_URL_ERROR = "NEXT_PUBLIC_SUPABASE_URL fehlt.";
const MISSING_ANON_KEY_ERROR = "NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt.";
const MISSING_SERVICE_ROLE_ERROR = "SUPABASE_SERVICE_ROLE_KEY fehlt.";

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error(MISSING_URL_ERROR);
  }

  return supabaseUrl;
}

function getSupabasePublicKey() {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!publicKey) {
    throw new Error(MISSING_ANON_KEY_ERROR);
  }

  return publicKey;
}

function getSupabaseServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(MISSING_SERVICE_ROLE_ERROR);
  }

  return serviceRoleKey;
}

export function isSupabaseConfigError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    [MISSING_URL_ERROR, MISSING_ANON_KEY_ERROR, MISSING_SERVICE_ROLE_ERROR].includes(error.message)
  );
}

export async function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const publicKey = getSupabasePublicKey();
  const cookieStore = await cookies();

  // Server client usage:
  // Use this helper in Server Components, Server Actions, and Route Handlers.
  // It reads/writes Supabase auth cookies server-side using the public anon key.
  return createServerClient(supabaseUrl, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies. Route Handlers, Server Actions,
          // and proxy session refreshes handle cookie writes where allowed.
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  // Server-only privileged client:
  // Use only in Route Handlers or Server Components that never ship to the browser.
  // Never import this helper in Client Components. The service role key bypasses RLS.
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
