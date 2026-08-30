"use client";

import { FormEvent, useState } from "react";
import { Bot, Check, Copy, Loader2, Save, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AiBriefing, Lead } from "@/lib/types";

export function BriefingAssistant({ initial, leads }: { initial: AiBriefing[]; leads: Lead[] }) {
  const [briefings, setBriefings] = useState(initial);
  const [generated, setGenerated] = useState("");
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const selectedLead = leads.find((item) => item.id === selectedLeadId);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("loading"); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    setPayload(data);
    try {
      const response = await fetch("/api/ai/briefing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = (await response.json()) as { briefing?: string; aiConfigured?: boolean; warning?: string; error?: string };
      if (!response.ok || !result.briefing) throw new Error(result.error || "Não foi possível gerar.");
      setGenerated(result.briefing); setStatus("ready");
      setMessage(result.warning || (result.aiConfigured ? "Briefing criado pela IA." : "Versão estruturada pronta. Conecte a OpenAI para a camada criativa."));
    } catch (cause) { setStatus("error"); setMessage(cause instanceof Error ? cause.message : "Falha ao gerar."); }
  }

  async function save() {
    if (!generated) return;
    const dbPayload = { client_name: payload.clientName, project_type: payload.projectType, objective: payload.objective, audience: payload.audience || null, deliverables: payload.deliverables || null, budget: payload.budget || null, deadline: payload.deadline || null, references: payload.references || null, raw_notes: payload.rawNotes || null, generated_briefing: generated };
    const result = await getSupabaseBrowserClient()!.from("ai_briefings").insert(dbPayload).select("*").single();
    if (!result.error) { setBriefings((current) => [result.data as AiBriefing, ...current]); setMessage("Briefing salvo no histórico."); }
  }

  return <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#0b66ff]">Assistente</p><h1 className="display mt-3 text-5xl font-black uppercase">Briefing com IA</h1><p className="mt-3 text-sm text-[#657286]">Organiza as informações do cliente hoje e ganha análise criativa quando a chave OpenAI for conectada.</p>{leads.length > 0 && <label className="mt-7 block max-w-xl text-xs font-bold">Importar dados de um contato<select className="field mt-2" value={selectedLeadId} onChange={(event) => setSelectedLeadId(event.target.value)}><option value="">Começar em branco</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.project_type}</option>)}</select></label>}<div className="mt-8 grid gap-6 xl:grid-cols-[.82fr_1.18fr]"><form key={selectedLeadId} onSubmit={generate} className="rounded-2xl bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><Bot className="h-5 w-5 text-[#0b66ff]" /><h2 className="font-black">Dados do projeto</h2></div><div className="mt-6 grid gap-4"><label className="text-xs font-bold">Cliente *<input name="clientName" className="field mt-2" required minLength={2} defaultValue={selectedLead?.company || selectedLead?.name || ""} /></label><label className="text-xs font-bold">Tipo de projeto *<input name="projectType" className="field mt-2" required placeholder="Filme institucional, evento, ensaio…" defaultValue={selectedLead?.project_type || ""} /></label><label className="text-xs font-bold">Objetivo *<textarea name="objective" className="field mt-2 min-h-28" required minLength={10} defaultValue={selectedLead?.description || ""} /></label><label className="text-xs font-bold">Público<textarea name="audience" className="field mt-2 min-h-20" /></label><label className="text-xs font-bold">Entregas esperadas<textarea name="deliverables" className="field mt-2 min-h-20" placeholder="1 filme 4K, 6 reels, 30 fotos…" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Orçamento<input name="budget" className="field mt-2" defaultValue={selectedLead?.budget || ""} /></label><label className="text-xs font-bold">Prazo<input name="deadline" className="field mt-2" defaultValue={selectedLead?.expected_date || ""} /></label></div><label className="text-xs font-bold">Referências<textarea name="references" className="field mt-2 min-h-20" defaultValue={selectedLead?.reference_url || ""} /></label><label className="text-xs font-bold">Notas soltas<textarea name="rawNotes" className="field mt-2 min-h-24" defaultValue={selectedLead ? `Contato: ${selectedLead.name} · ${selectedLead.email} · ${selectedLead.phone}\nCidade: ${selectedLead.city}` : ""} /></label><button className="button-light" disabled={status === "loading"}>{status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Gerar briefing</button></div></form><section className="rounded-2xl bg-[#07152f] p-5 text-white sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#62b8ff]">Resultado</p><h2 className="display mt-2 text-3xl font-black uppercase">Briefing organizado</h2></div>{generated && <div className="flex gap-2"><button onClick={() => void navigator.clipboard.writeText(generated)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Copiar"><Copy className="h-4 w-4" /></button><button onClick={() => void save()} className="grid h-10 w-10 place-items-center rounded-full bg-[#0b66ff]" aria-label="Salvar"><Save className="h-4 w-4" /></button></div>}</div><div className="mt-6 min-h-[28rem] whitespace-pre-wrap rounded-2xl bg-white/[.06] p-5 text-sm leading-7 text-white/72">{generated || "Preencha os dados ao lado. O resultado aparecerá aqui com perguntas pendentes, escopo, logística e próximos passos."}</div>{message && <p className={`mt-4 flex items-center gap-2 text-sm ${status === "error" ? "text-red-300" : "text-[#8bdcff]"}`}>{status === "ready" && <Check className="h-4 w-4" />}{message}</p>}</section></div>{briefings.length > 0 && <section className="mt-8 rounded-2xl bg-white p-5 sm:p-7"><h2 className="font-black">Histórico</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{briefings.slice(0, 9).map((item) => <button key={item.id} onClick={() => setGenerated(item.generated_briefing || "")} className="rounded-xl border border-[#07152f]/8 p-4 text-left"><p className="font-bold">{item.client_name}</p><p className="mt-1 text-xs text-[#627d98]">{item.project_type} · {new Date(item.created_at).toLocaleDateString("pt-BR")}</p></button>)}</div></section>}</div>;
}
