"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, Loader2, Plus, Trash2, Users } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BookingRequest, PublicEvent } from "@/lib/types";

const bookingStatuses: BookingRequest["status"][] = ["solicitado", "em_analise", "confirmado", "recusado", "concluido"];
const eventStatuses: PublicEvent["status"][] = ["planejado", "confirmado", "concluido", "cancelado"];

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" }) : "Sem data";
}

export function AgendaManager({ initialEvents, initialBookings }: { initialEvents: PublicEvent[]; initialBookings: BookingRequest[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [bookings, setBookings] = useState(initialBookings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title") || "").trim(), event_type: String(data.get("eventType") || "Evento"),
      city: String(data.get("city") || "").trim(), venue: String(data.get("venue") || "").trim() || null,
      starts_at: String(data.get("startsAt") || "") ? new Date(String(data.get("startsAt"))).toISOString() : null,
      ends_at: String(data.get("endsAt") || "") ? new Date(String(data.get("endsAt"))).toISOString() : null,
      description: String(data.get("description") || "").trim() || null, status: "planejado", published: data.get("published") === "true", position: events.length
    };
    const supabase = getSupabaseBrowserClient()!;
    const result = await supabase.from("events").insert(payload).select("*").single();
    setSaving(false);
    if (result.error) return setMessage(result.error.message);
    setEvents((current) => [...current, result.data as PublicEvent]);
    form.reset(); setMessage("Evento adicionado à agenda.");
  }

  async function updateEvent(item: PublicEvent, changes: Partial<PublicEvent>) {
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("events").update(changes).eq("id", item.id);
    if (!error) setEvents((current) => current.map((event) => event.id === item.id ? { ...event, ...changes } : event));
  }

  async function removeEvent(item: PublicEvent) {
    if (!window.confirm("Excluir este evento?")) return;
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("events").delete().eq("id", item.id);
    if (!error) setEvents((current) => current.filter((event) => event.id !== item.id));
  }

  async function updateBooking(item: BookingRequest, changes: Partial<BookingRequest>) {
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("booking_requests").update(changes).eq("id", item.id);
    if (!error) setBookings((current) => current.map((booking) => booking.id === item.id ? { ...booking, ...changes } : booking));
  }

  return <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#0b66ff]">Operação</p><h1 className="display mt-3 text-5xl font-black uppercase">Agenda & eventos</h1><p className="mt-3 text-sm text-[#657286]">Eventos da AA e solicitações de datas dos clientes, em uma visão interna.</p><form onSubmit={addEvent} className="mt-8 rounded-2xl bg-white p-5 sm:p-7"><div className="mb-5 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#0b66ff]" /><h2 className="font-black">Adicionar evento</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-bold">Nome *<input name="title" className="field mt-2" required minLength={2} /></label><label className="text-xs font-bold">Tipo<input name="eventType" className="field mt-2" defaultValue="Evento" /></label><label className="text-xs font-bold">Cidade *<input name="city" className="field mt-2" required /></label><label className="text-xs font-bold">Local<input name="venue" className="field mt-2" /></label><label className="text-xs font-bold">Início<input name="startsAt" type="datetime-local" className="field mt-2" /></label><label className="text-xs font-bold">Fim<input name="endsAt" type="datetime-local" className="field mt-2" /></label><label className="text-xs font-bold md:col-span-2">Descrição<input name="description" className="field mt-2" /></label><label className="flex items-center gap-3 text-sm font-bold"><input name="published" type="checkbox" value="true" className="h-5 w-5 accent-[#0b66ff]" />Mostrar no site</label><button className="button-light" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Adicionar evento</button></div>{message && <p className="mt-4 text-sm text-[#627d98]">{message}</p>}</form><div className="mt-8 grid gap-4 xl:grid-cols-2">{events.map((item) => <article key={item.id} className="rounded-2xl bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#0b66ff]">{item.event_type}</p><h2 className="mt-2 text-xl font-black">{item.title}</h2><p className="mt-2 text-sm text-[#627d98]">{dateTime(item.starts_at)} · {item.venue ? `${item.venue}, ` : ""}{item.city}</p></div><button onClick={() => void removeEvent(item)} className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button></div><div className="mt-5 flex flex-wrap gap-3"><select className="field max-w-44" value={item.status} onChange={(event) => void updateEvent(item, { status: event.target.value as PublicEvent["status"] })}>{eventStatuses.map((status) => <option key={status}>{status}</option>)}</select><button onClick={() => void updateEvent(item, { published: !item.published })} className={`rounded-full px-4 py-2 text-xs font-black ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-[#eef1f5] text-[#627d98]"}`}>{item.published ? "Visível no site" : "Evento interno"}</button></div></article>)}{events.length === 0 && <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#748196] xl:col-span-2">Adicione o primeiro evento — por exemplo, uma cobertura de rodeio.</div>}</div><div className="mt-12 flex items-center gap-3"><Users className="h-5 w-5 text-[#0b66ff]" /><h2 className="display text-3xl font-black uppercase">Solicitações de clientes</h2></div><div className="mt-6 space-y-4">{bookings.map((item) => <article key={item.id} className="rounded-2xl bg-white p-5 sm:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_13rem]"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-black">{item.client_name}</h3><span className="rounded-full bg-[#e6f7fb] px-3 py-1 text-[.62rem] font-black uppercase text-[#0077b8]">{item.service_type}</span></div><p className="mt-2 text-sm text-[#627d98]">{new Date(`${item.desired_date}T12:00:00`).toLocaleDateString("pt-BR")} · {item.city}{item.venue ? ` · ${item.venue}` : ""}</p><p className="mt-4 whitespace-pre-line text-sm leading-6">{item.notes}</p><p className="mt-4 text-xs text-[#829ab1]">{item.email} · {item.phone}{item.company ? ` · ${item.company}` : ""}</p></div><div className="space-y-3"><select className="field" value={item.status} onChange={(event) => void updateBooking(item, { status: event.target.value as BookingRequest["status"] })}>{bookingStatuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select><input className="field" placeholder="Equipe: Arthur, Alana" defaultValue={item.assigned_team.join(", ")} onBlur={(event) => void updateBooking(item, { assigned_team: event.target.value.split(",").map((name) => name.trim()).filter(Boolean) })} /><textarea className="field min-h-24" placeholder="Notas internas" defaultValue={item.internal_notes ?? ""} onBlur={(event) => void updateBooking(item, { internal_notes: event.target.value || null })} /></div></div></article>)}{bookings.length === 0 && <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#748196]">Nenhuma solicitação de agenda recebida.</div>}</div></div>;
}
