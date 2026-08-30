import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const allowed = new Set([request.nextUrl.origin]);
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    }
  } catch {
    // Invalid optional canonical URLs never widen the allowlist.
  }
  return allowed.has(origin);
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return admin ? { supabase, user } : null;
}
