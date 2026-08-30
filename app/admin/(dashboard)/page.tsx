import { CalendarRange, Eye, FolderKanban, Images, Inbox, WalletCards } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [projects, published, leads, photos, bookings, finance] = await Promise.all([
    supabase!.from("projects").select("id", { count: "exact", head: true }),
    supabase!.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
    supabase!.from("leads").select("id", { count: "exact", head: true }),
    supabase!.from("photographs").select("id", { count: "exact", head: true }),
    supabase!.from("booking_requests").select("id", { count: "exact", head: true }).in("status", ["solicitado", "em_analise"]),
    supabase!.from("finance_entries").select("id", { count: "exact", head: true })
  ]);
  const cards = [
    ["Projetos", projects.count ?? 0, FolderKanban, "/admin/projetos"],
    ["Publicados", published.count ?? 0, Eye, "/admin/projetos"],
    ["Fotografias", photos.count ?? 0, Images, "/admin/fotografias"],
    ["Agenda pendente", bookings.count ?? 0, CalendarRange, "/admin/agenda"],
    ["Financeiro", finance.count ?? 0, WalletCards, "/admin/financeiro"],
    ["Contatos", leads.count ?? 0, Inbox, "/admin/contatos"]
  ] as const;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0b66ff]">AA Admin</p>
      <h1 className="display mt-3 text-5xl font-black uppercase">Visão geral</h1>
      <p className="mt-3 text-sm text-[#657286]">Acompanhe o conteúdo publicado e as novas solicitações.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon, href]) => <a key={label} href={href} className="rounded-2xl border border-[#07152f]/8 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-[#0b66ff]" /><span className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#8390a3]">Abrir</span></div><p className="display mt-8 text-5xl font-black">{value}</p><p className="mt-2 text-sm font-bold">{label}</p></a>)}</div>
      <div className="mt-8 rounded-2xl bg-[#07152f] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#62b8ff]">Fluxo completo</p><h2 className="display mt-3 text-3xl font-black uppercase">Da agenda à entrega em 4K</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">Receba a data do cliente, organize equipe e custos, gere o briefing e publique vídeos no Mux e fotografias na galeria.</p><a href="/admin/agenda" className="button-primary mt-6">Abrir agenda</a></div>
    </div>
  );
}
