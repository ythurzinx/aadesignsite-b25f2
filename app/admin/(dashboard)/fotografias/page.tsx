import { PhotoManager } from "@/components/admin/photo-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photograph, PublicEvent } from "@/lib/types";

export default async function PhotographsPage() {
  const supabase = await createSupabaseServerClient();
  const [photos, events] = await Promise.all([
    supabase!.from("photographs").select("*").order("position"),
    supabase!.from("events").select("*").order("starts_at")
  ]);
  return <PhotoManager initial={(photos.data ?? []) as Photograph[]} events={(events.data ?? []) as PublicEvent[]} />;
}
