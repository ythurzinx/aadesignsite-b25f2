"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, ImagePlus, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, removeManagedMedia, signManagedMedia, toMediaReference } from "@/lib/media";
import { PROJECT_CATEGORIES, type MediaOrientation, type Project, type ProjectMedia } from "@/lib/types";
import { MuxVideoUploader } from "@/components/admin/mux-video-uploader";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

async function upload(file: File, folder: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  if (file.size > 250 * 1024 * 1024) throw new Error("Arquivo maior que 250 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
  if (signError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw signError;
  }
  return { reference: toMediaReference(path), preview: data.signedUrl };
}

const empty: Omit<Project, "id" | "created_at" | "updated_at"> = {
  slug: "",
  title: "",
  client: "",
  category: "Institucional",
  year: new Date().getFullYear(),
  format: "",
  description: "",
  full_description: null,
  services: [],
  credits: null,
  cover_url: null,
  video_url: null,
  mux_upload_id: null,
  mux_asset_id: null,
  mux_playback_id: null,
  mux_status: null,
  orientation: "horizontal",
  aspect_ratio: "16/9",
  focal_x: 50,
  focal_y: 50,
  featured: false,
  published: false,
  position: 0,
  project_media: []
};

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [values, setValues] = useState({ ...empty, ...project });
  const [media, setMedia] = useState<Array<ProjectMedia & { preview_url?: string }>>(project?.project_media ?? []);
  const [coverPreview, setCoverPreview] = useState<string | null>(project?.cover_url ?? null);
  const [persistedMainMedia, setPersistedMainMedia] = useState({
    cover_url: project?.cover_url ?? null,
    video_url: project?.video_url ?? null
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    void (async () => {
      const [signedCover, ...signedGallery] = await Promise.all([
        signManagedMedia(supabase, project?.cover_url),
        ...(project?.project_media ?? []).map((item) => signManagedMedia(supabase, item.url))
      ]);
      if (!active) return;
      setCoverPreview(signedCover);
      setMedia((items) => items.map((item, index) => ({ ...item, preview_url: signedGallery[index] ?? undefined })));
    })();
    return () => { active = false; };
  }, [project]);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function muxCreated(uploadId: string) {
    setValues((current) => ({ ...current, mux_upload_id: uploadId, mux_status: "waiting" }));
    if (project) void getSupabaseBrowserClient()?.from("projects").update({ mux_upload_id: uploadId, mux_status: "waiting" }).eq("id", project.id);
  }

  async function muxReady(video: { uploadId: string; assetId: string; playbackId: string; status: "ready" }) {
    const changes = { mux_upload_id: video.uploadId, mux_asset_id: video.assetId, mux_playback_id: video.playbackId, mux_status: video.status, video_url: null } as const;
    setValues((current) => ({ ...current, ...changes }));

    if (project) {
      const supabase = getSupabaseBrowserClient();
      const { error } = supabase
        ? await supabase.from("projects").update(changes).eq("id", project.id)
        : { error: new Error("Supabase não configurado.") };
      setMessage(error ? "Vídeo pronto. Clique em Publicar para concluir." : "Vídeo processado e atualizado automaticamente no projeto.");
      if (!error) router.refresh();
    }
  }

  async function uploadField(file: File, key: "cover_url" | "video_url") {
    setUploading(true);
    setMessage("");
    try {
      const result = await upload(file, `projects/${project?.id || "draft"}`);
      set(key, result.reference);
      if (key === "cover_url") setCoverPreview(result.preview);
    }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Falha no upload."); }
    finally { setUploading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const shouldPublish = submitter?.value === "publish";
    setSaving(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = {
      slug: values.slug || slugify(values.title),
      title: values.title.trim(),
      client: values.client.trim(),
      category: values.category,
      year: Number(values.year),
      format: values.format.trim(),
      description: values.description.trim(),
      full_description: values.full_description?.trim() || null,
      services: values.services,
      credits: values.credits?.trim() || null,
      cover_url: values.cover_url || null,
      video_url: values.video_url || null,
      mux_upload_id: values.mux_upload_id || null,
      mux_asset_id: values.mux_asset_id || null,
      mux_playback_id: values.mux_playback_id || null,
      mux_status: values.mux_status || null,
      orientation: values.orientation,
      aspect_ratio: values.aspect_ratio,
      focal_x: Number(values.focal_x),
      focal_y: Number(values.focal_y),
      featured: values.featured,
      published: shouldPublish,
      position: values.position
    };
    const result = project ? await supabase.from("projects").update(payload).eq("id", project.id).select("id").single() : await supabase.from("projects").insert(payload).select("id").single();
    setSaving(false);
    if (result.error) setMessage(result.error.code === "23505" ? "Já existe um projeto com esse endereço." : "Não foi possível salvar o projeto.");
    else if (!project) router.replace(`/admin/projetos/${result.data.id}`);
    else {
      const staleMedia = [
        persistedMainMedia.cover_url !== payload.cover_url ? persistedMainMedia.cover_url : null,
        persistedMainMedia.video_url !== payload.video_url ? persistedMainMedia.video_url : null
      ];
      const storageError = await removeManagedMedia(supabase, staleMedia);
      setPersistedMainMedia({ cover_url: payload.cover_url, video_url: payload.video_url });
      setMessage(storageError ? "Projeto salvo; uma mídia privada precisa de limpeza manual." : "Projeto salvo.");
      router.refresh();
    }
  }

  async function addGallery(files: FileList | null) {
    if (!project || !files?.length) return;
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient()!;
      for (const file of Array.from(files)) {
        const kind = file.type.startsWith("video/") ? "video" : "image";
        const uploaded = await upload(file, `projects/${project.id}/gallery`);
        const { data, error } = await supabase.from("project_media").insert({ project_id: project.id, kind, url: uploaded.reference, alt: `${project.title} — mídia de galeria`, orientation: values.orientation, position: media.length }).select("*").single();
        if (error) throw error;
        setMedia((items) => [...items, { ...(data as ProjectMedia), preview_url: uploaded.preview }]);
      }
    } catch { setMessage("Não foi possível enviar toda a galeria."); }
    finally { setUploading(false); }
  }

  async function removeMedia(item: ProjectMedia) {
    if (!window.confirm("Remover esta mídia da galeria?")) return;
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.from("project_media").delete().eq("id", item.id);
    if (!error) {
      await removeManagedMedia(supabase, [item.url, item.poster_url]);
      setMedia((items) => items.filter((mediaItem) => mediaItem.id !== item.id));
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Link href="/admin/projetos" className="inline-flex items-center gap-2 text-xs font-bold text-[#637086]"><ArrowLeft className="h-4 w-4" />Voltar</Link><h1 className="display mt-4 text-5xl font-black uppercase">{project ? "Editar projeto" : "Novo projeto"}</h1></div><div className="flex gap-2"><button type="submit" name="publish_action" value="draft" disabled={saving} className="rounded-full border border-[#07152f]/15 px-5 py-3 text-xs font-black uppercase tracking-[0.1em]">Salvar rascunho</button><button type="submit" name="publish_action" value="publish" disabled={saving} className="button-light">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Publicar</button></div></div>
      {message && <p className="mt-5 rounded-xl bg-white p-4 text-sm" aria-live="polite">{message}</p>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 sm:p-7"><h2 className="font-bold">Informações principais</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold">Título *<input className="field mt-2" value={values.title} onChange={(e) => set("title", e.target.value)} required maxLength={160} /></label><label className="text-xs font-bold">Cliente *<input className="field mt-2" value={values.client} onChange={(e) => set("client", e.target.value)} required maxLength={160} /></label><label className="text-xs font-bold">URL amigável<input className="field mt-2" value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder={slugify(values.title) || "nome-do-projeto"} /></label><label className="text-xs font-bold">Categoria *<select className="field mt-2" value={values.category} onChange={(e) => set("category", e.target.value as typeof values.category)}>{PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-xs font-bold">Ano<input className="field mt-2" type="number" min="2000" max="2100" value={values.year} onChange={(e) => set("year", Number(e.target.value))} /></label><label className="text-xs font-bold">Formato<input className="field mt-2" value={values.format} onChange={(e) => set("format", e.target.value)} placeholder="Filme 16:9, reels 9:16…" /></label><label className="text-xs font-bold sm:col-span-2">Descrição curta *<textarea className="field mt-2 min-h-24" value={values.description} onChange={(e) => set("description", e.target.value)} required maxLength={350} /></label><label className="text-xs font-bold sm:col-span-2">Descrição completa<textarea className="field mt-2 min-h-36" value={values.full_description ?? ""} onChange={(e) => set("full_description", e.target.value)} maxLength={5000} /></label><label className="text-xs font-bold sm:col-span-2">Serviços realizados<input className="field mt-2" value={values.services.join(", ")} onChange={(e) => set("services", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Direção, captação, edição" /></label><label className="text-xs font-bold sm:col-span-2">Ficha técnica<textarea className="field mt-2 min-h-24" value={values.credits ?? ""} onChange={(e) => set("credits", e.target.value)} /></label></div></section>
          <section className="rounded-2xl bg-white p-5 sm:p-7"><h2 className="font-bold">Mídia principal</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="rounded-xl border border-dashed border-[#07152f]/20 p-5 text-center text-xs font-bold"><ImagePlus className="mx-auto mb-3 h-5 w-5 text-[#0b66ff]" />Enviar capa<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadField(e.target.files[0], "cover_url")} /></label><label className="text-xs font-bold sm:col-span-2">URL ou referência da capa<input className="field mt-2" type="text" value={values.cover_url ?? ""} onChange={(e) => { set("cover_url", e.target.value); setCoverPreview(e.target.value); }} /></label><div className="sm:col-span-2"><MuxVideoUploader currentUploadId={values.mux_upload_id} currentPlaybackId={values.mux_playback_id} currentStatus={values.mux_status} onCreated={(video) => muxCreated(video.uploadId)} onReady={muxReady} /></div><details className="sm:col-span-2"><summary className="cursor-pointer text-xs font-bold text-[#627d98]">Usar vídeo antigo ou URL externa</summary><div className="mt-3 grid gap-3"><label className="rounded-xl border border-dashed border-[#07152f]/20 p-5 text-center text-xs font-bold"><Upload className="mx-auto mb-3 h-5 w-5 text-[#0b66ff]" />Enviar até 250 MB no Supabase<input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadField(e.target.files[0], "video_url")} /></label><label className="text-xs font-bold">URL ou referência do vídeo<input className="field mt-2" type="text" value={values.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} /></label></div></details></div></section>
          {project && <section className="rounded-2xl bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="font-bold">Galeria</h2><label className="button-light cursor-pointer"><Plus className="h-4 w-4" />Adicionar<input type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => addGallery(e.target.files)} /></label></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{media.map((item) => <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-[#07152f]">{item.preview_url && (item.kind === "image" ? <Image src={item.preview_url} alt={item.alt} fill sizes="200px" className="object-cover" /> : <video muted className="h-full w-full object-cover"><source src={item.preview_url} /></video>)}<button type="button" onClick={() => removeMedia(item)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white"><Trash2 className="h-4 w-4" /></button></div>)}{media.length === 0 && <p className="text-sm text-[#748196]">Nenhuma mídia adicional.</p>}</div></section>}
        </div>
        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-5"><h2 className="font-bold">Exibição</h2><div className="mt-5 space-y-4"><label className="flex items-center justify-between text-sm font-bold">Em destaque<input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="h-5 w-5 accent-[#0b66ff]" /></label><label className="text-xs font-bold">Orientação<select className="field mt-2" value={values.orientation} onChange={(e) => set("orientation", e.target.value as MediaOrientation)}><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="square">Quadrada</option></select></label><label className="text-xs font-bold">Proporção<select className="field mt-2" value={values.aspect_ratio} onChange={(e) => set("aspect_ratio", e.target.value)}><option>16/9</option><option>16/10</option><option>4/5</option><option>9/16</option><option>1/1</option></select></label><label className="text-xs font-bold">Foco horizontal: {values.focal_x}%<input type="range" min="0" max="100" value={values.focal_x} onChange={(e) => set("focal_x", Number(e.target.value))} className="mt-2 w-full accent-[#0b66ff]" /></label><label className="text-xs font-bold">Foco vertical: {values.focal_y}%<input type="range" min="0" max="100" value={values.focal_y} onChange={(e) => set("focal_y", Number(e.target.value))} className="mt-2 w-full accent-[#0b66ff]" /></label></div></section>
          <section className="overflow-hidden rounded-2xl bg-[#07152f] text-white"><div className="relative aspect-[4/5]">{coverPreview ? <Image src={coverPreview} alt="Prévia da capa" fill sizes="350px" className="object-cover" style={{ objectPosition: `${values.focal_x}% ${values.focal_y}%` }} /> : <div className="media-placeholder h-full" />}<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-white/45">Prévia</p><p className="display mt-2 text-3xl font-black uppercase leading-none">{values.title || "Título do projeto"}</p><p className="mt-2 text-xs text-white/55">{values.client || "Cliente"}</p></div></div></section>
          {uploading && <p className="flex items-center gap-2 rounded-xl bg-[#0b66ff]/10 p-4 text-sm text-[#0b66ff]"><Loader2 className="h-4 w-4 animate-spin" />Enviando mídia…</p>}
          {message === "Projeto salvo." && <p className="flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" />{message}</p>}
        </aside>
      </div>
    </form>
  );
}
