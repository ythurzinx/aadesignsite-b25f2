"use client";

import { Bot, CalendarRange, FolderKanban, Images, Inbox, LayoutDashboard, LogOut, Menu, PanelTop, Settings2, WalletCards, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  ["/admin", "Visão geral", LayoutDashboard],
  ["/admin/projetos", "Projetos", FolderKanban],
  ["/admin/fotografias", "Fotografias", Images],
  ["/admin/agenda", "Agenda & eventos", CalendarRange],
  ["/admin/financeiro", "Financeiro", WalletCards],
  ["/admin/briefing-ia", "Briefing com IA", Bot],
  ["/admin/conteudo", "Conteúdo", Settings2],
  ["/admin/contatos", "Contatos", Inbox]
] as const;

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <>
      <div className="p-5"><Brand /></div>
      <nav className="mt-8 flex-1 space-y-1 px-3">
        {links.map(([href, label, Icon]) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return <a key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#0b66ff] text-white" : "text-white/52 hover:bg-white/[0.05] hover:text-white"}`}><Icon className="h-4 w-4" />{label}</a>;
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/55 hover:bg-white/[0.05] hover:text-white"><PanelTop className="h-4 w-4" />Ver site</a>
        <p className="truncate px-3 pt-4 text-xs text-white/28">{email}</p>
        <button onClick={signOut} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/55 hover:bg-red-500/10 hover:text-red-300"><LogOut className="h-4 w-4" />Sair</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#eef1f5] text-[#07152f]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#03060d] lg:flex">{sidebar}</aside>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#07152f]/10 bg-white px-4 py-3 lg:hidden"><Brand compact /><button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-[#07152f] text-white" aria-label="Abrir navegação"><Menu className="h-5 w-5" /></button></div>
      {open && <div className="fixed inset-0 z-50 bg-black/55 lg:hidden" onClick={() => setOpen(false)}><aside className="flex h-full w-72 flex-col bg-[#03060d]" onClick={(event) => event.stopPropagation()}><button onClick={() => setOpen(false)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white"><X className="h-5 w-5" /></button>{sidebar}</aside></div>}
      <main className="lg:pl-64"><div className="mx-auto max-w-[90rem] p-4 sm:p-7 lg:p-10">{children}</div></main>
    </div>
  );
}
