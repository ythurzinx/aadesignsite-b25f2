"use client";

import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, removeManagedMedia, toMediaReference } from "@/lib/media";
import type { SiteSettings } from "@/lib/types";
import { MuxVideoUploader } from "@/components/admin/mux-video-uploader";

type Field = { name: string; label: string; type?: "text" | "textarea" | "url" | "checkbox" | "select" | "file"; options?: string[]; accept?: string };
export type EditableRow = { id: string; position?: number; visible?: boolean; [key: string]: unknown };
export type ContentGroup = { key: string; title: string; table: string; items: EditableRow[]; fields: Field[] };

async function upload(file: File, folder: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  if (file.size > 250 * 1024 * 1024) throw new Error("Arquivo maior que 250 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, cacheControl: "31536000" });
  if (error) throw error;
  const { error: signError } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
  if (signError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw signError;
  }
  return toMediaReference(path);
}

function CollectionEditor({ group }: { group: ContentGroup }) {
  const router = useRouter();
  const [items, setItems] = useState(group.items);
  const [persistedItems, setPersistedItems] = useState(group.items);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function update(id: string, field: string, value: unknown) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function add() {
    const item: EditableRow = { id: `new-${crypto.randomUUID()}`, position: items.length, visible: true };
    group.fields.forEach((field) => { item[field.name] = field.type === "checkbox" ? true : field.options?.[0] ?? ""; });
    setItems((current) => [...current, item]);
  }

  async function save(item: EditableRow) {
    setSaving(item.id);
    setMessage("");
    const supabase = getSupabaseBrowserClient()!;
    const payload: Record<string, unknown> = { position: item.position ?? 0 };
    group.fields.forEach((field) => { if (field.type !== "file") payload[field.name] = item[field.name] ?? null; });
    const isNew = item.id.startsWith("new-");
    const result = isNew ? await supabase.from(group.table).insert(payload).select("*").single() : await supabase.from(group.table).update(payload).eq("id", item.id).select("*").single();
    setSaving(null);
    if (result.error) setMessage(`Não foi possível salvar: ${result.error.message}`);
    else {
      const saved = result.data as EditableRow;
      const previous = persistedItems.find((row) => row.id === item.id);
      const staleMedia = previous
        ? [...new Set(group.fields.map((field) => field.name))].flatMap((field) => previous[field] !== saved[field] ? [previous[field]] : [])
        : [];
      const storageError = await removeManagedMedia(supabase, staleMedia);
      setItems((current) => current.map((row) => row.id === item.id ? saved : row));
      setPersistedItems((current) => isNew ? [...current, saved] : current.map((row) => row.id === item.id ? saved : row));
      setMessage(storageError ? "Conteúdo salvo; uma mídia privada precisa de limpeza manual." : "Conteúdo salvo.");
      router.refresh();
    }
  }

  async function remove(item: EditableRow) {
    if (item.id.startsWith("new-")) return setItems((current) => current.filter((row) => row.id !== item.id));
    if (!window.confirm("Excluir este item definitivamente?")) return;
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from(group.table).delete().eq("id", item.id);
    if (error) setMessage("Não foi possível excluir.");
    else {
      const storageError = await removeManagedMedia(supabase, Object.values(item));
      setItems((current) => current.filter((row) => row.id !== item.id));
      setPersistedItems((current) => current.filter((row) => row.id !== item.id));
      setMessage(storageError ? "Item excluído; uma mídia privada precisa de limpeza manual." : "Item e mídias excluídos.");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((item, position) => { item.position = position; });
    setItems(next);
    const supabase = getSupabaseBrowserClient()!;
    await Promise.all(next.filter((item) => !item.id.startsWith("new-")).map((item) => supabase.from(group.table).update({ position: item.position }).eq("id", item.id)));
  }

  async function handleFile(item: EditableRow, field: Field, file: File) {
    setSaving(item.id);
    try { update(item.id, field.name, await upload(file, `${group.table}/${item.id}`)); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Falha no upload."); }
    finally { setSaving(null); }
  }

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">{group.title}</h2><p className="mt-1 text-xs text-[#748196]">{items.length} item(ns)</p></div><button onClick={add} className="button-light" type="button"><Plus className="h-4 w-4" />Adicionar</button></div>
      {message && <p className="mt-4 rounded-lg bg-[#eef1f5] p-3 text-sm" aria-live="polite">{message}</p>}
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-[#07152f]/10 p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.fields.map((field) => field.type === "checkbox" ? (
                <label key={field.name} className="flex items-center gap-3 self-end rounded-lg bg-[#eef1f5] p-4 text-xs font-bold"><input type="checkbox" checked={Boolean(item[field.name])} onChange={(event) => update(item.id, field.name, event.target.checked)} className="h-5 w-5 accent-[#0b66ff]" />{field.label}</label>
              ) : field.type === "file" ? (
                <label key={field.name} className="flex cursor-pointer items-center justify-center gap-2 self-end rounded-lg border border-dashed border-[#07152f]/20 p-4 text-xs font-bold"><Upload className="h-4 w-4 text-[#0b66ff]" />{field.label}<input type="file" accept={field.accept || "image/*,video/*"} className="sr-only" onChange={(event) => event.target.files?.[0] && handleFile(item, field, event.target.files[0])} /></label>
              ) : (
                <label key={field.name} className={`text-xs font-bold ${field.type === "textarea" ? "sm:col-span-2 xl:col-span-3" : ""}`}>{field.label}{field.type === "textarea" ? <textarea className="field mt-2 min-h-24" value={String(item[field.name] ?? "")} onChange={(event) => update(item.id, field.name, event.target.value)} /> : field.type === "select" ? <select className="field mt-2" value={String(item[field.name] ?? "")} onChange={(event) => update(item.id, field.name, event.target.value)}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type="text" className="field mt-2" value={String(item[field.name] ?? "")} onChange={(event) => update(item.id, field.name, event.target.value)} />}</label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => move(index, -1)} className="grid h-10 w-10 place-items-center rounded-full bg-[#eef1f5]" aria-label="Mover para cima"><ChevronUp className="h-4 w-4" /></button><button type="button" onClick={() => move(index, 1)} className="grid h-10 w-10 place-items-center rounded-full bg-[#eef1f5]" aria-label="Mover para baixo"><ChevronDown className="h-4 w-4" /></button><button type="button" onClick={() => remove(item)} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button><button type="button" onClick={() => save(item)} disabled={saving === item.id} className="button-light">{saving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [persistedSettings, setPersistedSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fields: Array<{ key: keyof SiteSettings; label: string; type?: "textarea" | "url" }> = [
    { key: "logo_url", label: "URL do logotipo", type: "url" },
    { key: "hero_video_url", label: "Vídeo do hero", type: "url" },
    { key: "hero_poster_url", label: "Capa do hero", type: "url" },
    { key: "showreel_url", label: "Link do showreel", type: "url" },
    { key: "team_image_url", label: "Foto da equipe", type: "url" },
    { key: "about_image_url", label: "Foto da produtora", type: "url" },
    { key: "cta_background_url", label: "Fundo da chamada final", type: "url" },
    { key: "whatsapp", label: "WhatsApp com DDI" },
    { key: "instagram", label: "Instagram", type: "url" },
    { key: "email", label: "E-mail" },
    { key: "address", label: "Localização" },
    { key: "hero_title", label: "Título do hero", type: "textarea" },
    { key: "hero_support", label: "Frase de apoio", type: "textarea" },
    { key: "hero_description", label: "Descrição do hero", type: "textarea" },
    { key: "about_text", label: "Texto sobre a AA", type: "textarea" },
    { key: "footer_text", label: "Texto do rodapé", type: "textarea" }
  ];

  async function save() {
    setSaving(true);
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("site_settings").upsert(settings, { onConflict: "id" });
    if (!error) {
      const staleMedia = Object.keys(settings).flatMap((key) => {
        const typedKey = key as keyof SiteSettings;
        return persistedSettings[typedKey] !== settings[typedKey] ? [persistedSettings[typedKey]] : [];
      });
      await removeManagedMedia(supabase, staleMedia);
      setPersistedSettings(settings);
    }
    setSaving(false);
    setMessage(error ? "Não foi possível salvar as configurações." : "Configurações salvas.");
  }

  async function uploadSetting(file: File, key: keyof SiteSettings) {
    setSaving(true);
    try {
      const url = await upload(file, "settings");
      setSettings((current) => ({ ...current, [key]: url }));
    }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Falha no upload."); }
    finally { setSaving(false); }
  }

  function muxCreated(uploadId: string) {
    setSettings((current) => ({ ...current, hero_mux_upload_id: uploadId, hero_mux_status: "waiting" }));
    void getSupabaseBrowserClient()?.from("site_settings").upsert({ id: "main", hero_mux_upload_id: uploadId, hero_mux_status: "waiting" }, { onConflict: "id" });
  }

  function muxReady(video: { uploadId: string; assetId: string; playbackId: string; status: "ready" }) {
    const changes = { hero_mux_upload_id: video.uploadId, hero_mux_asset_id: video.assetId, hero_mux_playback_id: video.playbackId, hero_mux_status: video.status, hero_video_url: null };
    setSettings((current) => ({ ...current, ...changes }));
  }

  return (
    <section className="rounded-2xl bg-[#07152f] p-5 text-white sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#62b8ff]">Identidade e contatos</p><h2 className="display mt-2 text-3xl font-black uppercase">Configurações gerais</h2></div><button type="button" onClick={save} className="button-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar tudo</button></div>
      {message && <p className="mt-4 rounded-lg bg-white/8 p-3 text-sm" aria-live="polite">{message}</p>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-4 text-xs font-bold"><Upload className="h-4 w-4 text-[#62b8ff]" />Enviar logotipo oficial<input type="file" accept="image/png,image/svg+xml,image/webp" className="sr-only" onChange={(event) => event.target.files?.[0] && uploadSetting(event.target.files[0], "logo_url")} /></label>
        <div className="sm:col-span-2 rounded-2xl bg-white p-2 text-[#07152f]"><MuxVideoUploader label="Enviar showreel em até 4K" currentUploadId={settings.hero_mux_upload_id} currentPlaybackId={settings.hero_mux_playback_id} currentStatus={settings.hero_mux_status} onCreated={(video) => muxCreated(video.uploadId)} onReady={muxReady} /></div>
        <details className="sm:col-span-2"><summary className="cursor-pointer text-xs font-bold text-white/55">Usar upload antigo de até 250 MB</summary><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-4 text-xs font-bold"><Upload className="h-4 w-4 text-[#62b8ff]" />Enviar no Supabase<input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(event) => event.target.files?.[0] && uploadSetting(event.target.files[0], "hero_video_url")} /></label></details>
        {fields.map((field) => <label key={field.key} className={`text-xs font-bold text-white/62 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>{field.label}{field.type === "textarea" ? <textarea className="field mt-2 min-h-24" value={String(settings[field.key] ?? "")} onChange={(event) => setSettings((current) => ({ ...current, [field.key]: event.target.value }))} /> : <input type="text" className="field mt-2" value={String(settings[field.key] ?? "")} onChange={(event) => setSettings((current) => ({ ...current, [field.key]: event.target.value }))} />}</label>)}
      </div>
    </section>
  );
}

export function ContentManager({ settings, groups }: { settings: SiteSettings; groups: ContentGroup[] }) {
  return <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0b66ff]">Site público</p><h1 className="display mt-3 text-5xl font-black uppercase">Conteúdo</h1><p className="mt-3 text-sm text-[#657286]">Controle textos, mídia, serviços, clientes e bastidores sem alterar o layout.</p><div className="mt-8 space-y-6"><SettingsEditor initial={settings} />{groups.map((group) => <CollectionEditor key={group.key} group={group} />)}</div></div>;
}
