import { BriefingAssistant } from "@/components/admin/briefing-assistant";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiBriefing, Lead } from "@/lib/types";

export default async function BriefingPage() {
  const supabase = await createSupabaseServerClient();
  const [briefings, leads] = await Promise.all([
    supabase!.from("ai_briefings").select("*").order("created_at", { ascending: false }),
    supabase!.from("leads").select("*").order("created_at", { ascending: false }).limit(100)
  ]);
  return <BriefingAssistant initial={(briefings.data ?? []) as AiBriefing[]} leads={(leads.data ?? []) as Lead[]} />;
}
