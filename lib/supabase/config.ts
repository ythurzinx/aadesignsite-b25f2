export const publicSupabaseUrl = "https://shloyddmmzupopkcwned.supabase.co";
export const publicSupabaseKey = "sb_publishable_gPFG9TIiCQr4YcHAuRIboA_8yG4luYY";

export function getPublicSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || publicSupabaseUrl,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || publicSupabaseKey
  };
}
