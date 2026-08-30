import { FinanceManager } from "@/components/admin/finance-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FinanceEntry, TravelEstimate } from "@/lib/types";

export default async function FinancePage() {
  const supabase = await createSupabaseServerClient();
  const [entries, travel] = await Promise.all([
    supabase!.from("finance_entries").select("*").order("due_date", { ascending: false }),
    supabase!.from("travel_estimates").select("*").order("created_at", { ascending: false })
  ]);
  return <FinanceManager initialEntries={(entries.data ?? []) as FinanceEntry[]} initialTravel={(travel.data ?? []) as TravelEstimate[]} />;
}
