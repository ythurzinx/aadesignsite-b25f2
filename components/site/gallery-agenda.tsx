"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { CalendarCheck2, Camera, Check, Loader2, MapPin, Send } from "lucide-react";
import type { Photograph, PublicEvent } from "@/lib/types";

const services = ["Fotografia", "Cobertura de evento", "Produção audiovisual", "Drone / FPV", "Social Content", "Outro"];

function eventDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "Data em definição";
}

export function GalleryAgenda({ photographs, events }: { photographs: Photograph[]; events: PublicEvent[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar.");
      form.reset();
      setStatus("success");
      setMessage("Solicitação recebida. A equipe confirmará a disponibilidade com você.");
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Não foi possível enviar.");
    }
  }

  return (
    <>
      <section id="fotografias" className="section-pad bg-white"><div className="shell"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="eyebrow text-[#0077b8]">Fotografia</span><h2 className="display mt-6 text-[clamp(3rem,6vw,5.5rem)] font-bold leading-none">Olhares que ficam.</h2></div><p className="max-w-md text-sm leading-6 text-[#627d98]">Retratos, eventos, produtos e momentos vistos com intenção.</p></div>{photographs.length > 0 ? <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">{photographs.map((photo) => <figure key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-[1.4rem] border border-[#003b70]/10 bg-[#eef6fa]"><div className={`relative ${photo.orientation === "vertical" ? "aspect-[4/5]" : photo.orientation === "square" ? "aspect-square" : "aspect-[16/10]"}`}><Image src={photo.image_url} alt={photo.alt || photo.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" /></div><figcaption className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-[#486581]"><Camera className="h-3.5 w-3.5 text-[#0077b8]" />{photo.title}</figcaption></figure>)}</div> : <div className="mt-12 grid gap-4 sm:grid-cols-3">{["Retratos", "Eventos", "Campanhas"].map((label, index) => <div key={label} className="media-placeholder relative aspect-[4/3] overflow-hidden rounded-[1.4rem]"><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-xs font-black uppercase tracking-[.14em] text-white/70">{String(index + 1).padStart(2, "0")}</p><p className="display mt-2 text-3xl font-black text-white">{label}</p></div></div>)}</div>}</div></section>

      <section id="agenda" className="section-pad bg-[#f5f8fb] text-[#102a43]"><div className="shell"><div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-16"><div><span className="eyebrow text-[#0077b8]">Agenda e eventos</span><h2 className="display mt-7 text-[clamp(3rem,5.6vw,5.3rem)] font-bold leading-[.98]">Reserve uma data para sua ideia.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#627d98]">Escolha a data desejada. O envio é uma solicitação; a reserva só é confirmada depois do retorno da equipe.</p>{events.length > 0 && <div className="mt-9 space-y-3"><p className="text-[.65rem] font-black uppercase tracking-[.14em] text-[#0077b8]">Próximos eventos</p>{events.slice(0, 5).map((item) => <article key={item.id} className="rounded-2xl border border-[#003b70]/10 bg-white p-4"><div className="flex gap-4">{item.cover_url && <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={item.cover_url} alt="" fill sizes="80px" className="object-cover" /></div>}<div><p className="font-bold">{item.title}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#627d98]"><CalendarCheck2 className="h-3.5 w-3.5" />{eventDate(item.starts_at)}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#627d98]"><MapPin className="h-3.5 w-3.5" />{item.venue ? `${item.venue} · ` : ""}{item.city}</p></div></div></article>)}</div>}</div>

        <form onSubmit={submit} className="rounded-[1.75rem] border border-[#003b70]/10 bg-white p-5 shadow-[0_30px_80px_-48px_rgba(0,59,112,.4)] sm:p-8"><div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6f7fb] text-[#0077b8]"><CalendarCheck2 className="h-5 w-5" /></span><div><p className="font-black">Solicitar uma data</p><p className="text-xs text-[#627d98]">Resposta humana, sem reserva automática.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold">Nome *<input name="clientName" className="field mt-2" required minLength={2} maxLength={100} /></label><label className="text-xs font-bold">Empresa<input name="company" className="field mt-2" maxLength={120} /></label><label className="text-xs font-bold">E-mail *<input name="email" type="email" className="field mt-2" required maxLength={160} /></label><label className="text-xs font-bold">Telefone *<input name="phone" className="field mt-2" required maxLength={30} /></label><label className="text-xs font-bold">Serviço *<select name="serviceType" className="field mt-2" required><option value="">Selecione</option>{services.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold">Duração estimada<input name="durationHours" type="number" min="1" max="168" step="0.5" className="field mt-2" placeholder="Horas" /></label><label className="text-xs font-bold">Data desejada *<input name="desiredDate" type="date" min={new Date().toISOString().slice(0, 10)} className="field mt-2" required /></label><label className="text-xs font-bold">Data alternativa<input name="alternateDate" type="date" min={new Date().toISOString().slice(0, 10)} className="field mt-2" /></label><label className="text-xs font-bold">Cidade *<input name="city" className="field mt-2" required maxLength={120} /></label><label className="text-xs font-bold">Local<input name="venue" className="field mt-2" maxLength={180} /></label><label className="text-xs font-bold sm:col-span-2">Conte sobre o evento ou projeto *<textarea name="notes" className="field mt-2 min-h-28" required minLength={10} maxLength={2500} /></label><label className="sr-only" aria-hidden="true">Não preencher<input name="website" tabIndex={-1} autoComplete="off" /></label></div><div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><button className="button-light" disabled={status === "sending"}>{status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "success" ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}{status === "sending" ? "Enviando" : "Solicitar data"}</button><p className={`max-w-sm text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`} aria-live="polite">{message}</p></div></form></div></div></section>
    </>
  );
}
