"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Camera, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, removeManagedMedia, signManagedMedia, toMediaReference } from "@/lib/media";
import type { Photograph, PublicEvent } from "@/lib/types";

async function uploadPhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha uma imagem.");
  if (file.size > 30 * 1024 * 1024) throw new Error("A fotografia deve ter até 30 MB.");
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `photographs/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
  if (signError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw signError;
  }
  return { reference: toMediaReference(path), preview: data.signedUrl };
}

export function PhotoManager({ initial, events }: { initial: Photograph[]; events: PublicEvent[] }) {
  const [photos, setPhotos] = useState<Array<Photograph & { preview?: string }>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    void Promise.all(initial.map(async (photo) => ({ ...photo, preview: await signManagedMedia(supabase, photo.image_url) ?? undefined }))).then((items) => active && setPhotos(items));
    return () => { active = false; };
  }, [initial]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return setMessage("Escolha uma fotografia.");
    setSaving(true);
    setMessage("");
    const form = event.currentTarget;
    try {
      const uploaded = await uploadPhoto(file);
      const data = new FormData(form);
      const payload = {
        title: String(data.get("title") || "").trim(),
        alt: String(data.get("alt") || "").trim(),
        event_id: String(data.get("eventId") || "") || null,
        captured_at: String(data.get("capturedAt") || "") || null,
        orientation: String(data.get("orientation") || "horizontal"),
        published: data.get("published") === "true",
        position: photos.length,
        image_url: uploaded.reference
      };
      const supabase = getSupabaseBrowserClient()!;
      const result = await supabase.from("photographs").insert(payload).select("*").single();
      if (result.error) {
        await removeManagedMedia(supabase, [uploaded.reference]);
        throw result.error;
      }
      setPhotos((current) => [...current, { ...(result.data as Photograph), preview: uploaded.preview }]);
      form.reset();
      setFile(null);
      setMessage("Fotografia adicionada.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Não foi possível adicionar.");
    } finally { setSaving(false); }
  }

  async function remove(photo: Photograph) {
    if (!window.confirm("Excluir esta fotografia?")) return;
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("photographs").delete().eq("id", photo.id);
    if (!error) {
      await removeManagedMedia(supabase, [photo.image_url]);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    }
  }

  async function toggle(photo: Photograph) {
    const supabase = getSupabaseBrowserClient()!;
    const published = !photo.published;
    const { error } = await supabase.from("photographs").update({ published }).eq("id", photo.id);
    if (!error) setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, published } : item));
  }

  return <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#0b66ff]">Galeria</p><h1 className="display mt-3 text-5xl font-black uppercase">Fotografias</h1><p className="mt-3 text-sm text-[#657286]">Envie ensaios, coberturas e imagens avulsas para a galeria pública.</p><form onSubmit={add} className="mt-8 rounded-2xl bg-white p-5 sm:p-7"><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-bold">Título *<input name="title" className="field mt-2" required minLength={2} maxLength={180} /></label><label className="text-xs font-bold">Descrição acessível<input name="alt" className="field mt-2" maxLength={240} /></label><label className="text-xs font-bold">Evento<select name="eventId" className="field mt-2"><option value="">Sem evento</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="text-xs font-bold">Data da foto<input name="capturedAt" type="date" className="field mt-2" /></label><label className="text-xs font-bold">Orientação<select name="orientation" className="field mt-2"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="square">Quadrada</option></select></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#07152f]/20 p-4 text-xs font-bold"><Upload className="h-4 w-4 text-[#0b66ff]" />{file ? file.name : "Escolher fotografia"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label><label className="flex items-center gap-3 text-sm font-bold"><input name="published" type="checkbox" value="true" className="h-5 w-5 accent-[#0b66ff]" />Publicar agora</label><button className="button-light self-center" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Adicionar</button></div>{message && <p className="mt-4 text-sm text-[#637086]" aria-live="polite">{message}</p>}</form><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{photos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-2xl bg-white"><div className="relative aspect-[4/3] bg-[#eef6fa]">{photo.preview ? <Image src={photo.preview} alt={photo.alt || photo.title} fill sizes="320px" className="object-cover" /> : <div className="grid h-full place-items-center text-[#829ab1]"><Camera className="h-7 w-7" /></div>}</div><div className="p-4"><p className="font-bold">{photo.title}</p><div className="mt-4 flex items-center justify-between"><button onClick={() => void toggle(photo)} className={`rounded-full px-3 py-1.5 text-[.62rem] font-black uppercase ${photo.published ? "bg-emerald-50 text-emerald-700" : "bg-[#eef1f5] text-[#627d98]"}`}>{photo.published ? "Publicada" : "Rascunho"}</button><button onClick={() => void remove(photo)} className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button></div></div></article>)}{photos.length === 0 && <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#748196] sm:col-span-2 xl:col-span-4">Sua galeria começa com a primeira fotografia.</div>}</div></div>;
}
