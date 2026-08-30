"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

let client: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient() {
  if (client !== undefined) return client;

  const { url, key } = getPublicSupabaseConfig();
  client = url && key ? createBrowserClient(url, key) : null;
  return client;
}
