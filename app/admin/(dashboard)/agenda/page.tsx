import { AgendaManager } from "@/components/admin/agenda-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest, PublicEvent } from "@/lib/types";

export default async function AgendaPage() {
  const supabase = await createSupabaseServerClient();
  const [events, bookings] = await Promise.all([
    supabase!.from("events").select("*").order("starts_at"),
    supabase!.from("booking_requests").select("*").order("desired_date")
  ]);
  return <AgendaManager initialEvents={(events.data ?? []) as PublicEvent[]} initialBookings={(bookings.data ?? []) as BookingRequest[]} />;
}
