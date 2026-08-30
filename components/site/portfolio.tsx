"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, Share2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory, type ProjectMedia } from "@/lib/types";
import { MuxVideo } from "@/components/mux-video";

type Filter = "Todos" | "Destaques" | ProjectCategory;
const filters: Filter[] = ["Todos", "Destaques", ...PROJECT_CATEGORIES];

function viewportFrameStyle(orientation: Project["orientation"], maxHeight = 68) {
  const ratio = orientation === "vertical" ? 4 / 5 : orientation === "square" ? 1 : 16 / 9;
  return {
    aspectRatio: `${ratio}`,
    width: `min(100%, ${(maxHeight * ratio).toFixed(1)}svh)`,
    maxHeight: `${maxHeight}svh`,
    marginInline: "auto"
  };
}

function MediaPlaceholder({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <div className={`media-placeholder flex h-full w-full items-end p-5 ${className}`}>
      <div className="absolute -right-10 top-[12%] h-[58%] w-[72%] opacity-15"><Image src="/brand/aa-mark.png" alt="" fill sizes="420px" className="object-contain" /></div>
      <div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#75c4ff]">Capa pronta para upload</p>
        <p className="display mt-2 text-2xl font-extrabold uppercase leading-none text-white/88">{project.client}</p>
      </div>
      <span className="absolute left-4 top-4 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/35">AA Originals</span>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const [inViewport, setInViewport] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const previewActive = !reduceMotion && inViewport;

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.45),
      { threshold: [0.15, 0.45, 0.7], rootMargin: "-8% 0px -8% 0px" }
    );
    observer.observe(media);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (previewActive) video.play().catch(() => undefined);
    else {
      video.pause();
      video.currentTime = 0;
    }
  }, [previewActive]);

  const tall = project.orientation === "vertical";
  const ratio = tall ? "4 / 5" : project.orientation === "square" ? "1 / 1" : "16 / 10";

  return (
    <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.36 }}>
      <button onClick={onOpen} className="group block w-full text-left" aria-label={`Abrir projeto ${project.title}`}>
        <div ref={mediaRef} className="relative overflow-hidden rounded-[1.35rem] border border-[#003b70]/10 bg-[#eaf4f9] shadow-[0_22px_55px_-38px_rgba(0,59,112,.48)]" style={{ aspectRatio: ratio }}>
          {project.cover_url ? (
            <Image src={project.cover_url} alt={`Capa do projeto ${project.title}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" style={{ objectPosition: `${project.focal_x}% ${project.focal_y}%` }} />
          ) : <MediaPlaceholder project={project} />}
          {project.mux_playback_id && previewActive && (
            <MuxVideo playbackId={project.mux_playback_id} title={`Prévia — ${project.title}`} poster={project.cover_url} autoPlay muted loop preview fit="cover" className="pointer-events-none absolute inset-0 z-[1]" />
          )}
          {!project.mux_playback_id && project.video_url && previewActive && (
            <video ref={videoRef} muted loop playsInline preload="metadata" poster={project.cover_url ?? undefined} onTimeUpdate={(event) => {
              if (event.currentTarget.currentTime >= 35) event.currentTarget.currentTime = 0;
            }} className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover">
              <source src={project.video_url} />
            </video>
          )}
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#02050c]/88 via-transparent to-transparent opacity-80" />
          <span className="absolute left-4 top-4 z-[3] rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur-lg">{previewActive && (project.mux_playback_id || project.video_url) ? "Prévia 35s · sem áudio" : project.category}</span>
          <span className="absolute right-4 top-4 z-[3] grid h-10 w-10 place-items-center rounded-full bg-white text-[#07152f] opacity-0 transition-all duration-300 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
          <div className="absolute inset-x-0 bottom-0 z-[3] p-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/48">{project.client} · {project.year}</p>
            <h3 className="display mt-2 text-[clamp(1.65rem,4vw,2.75rem)] font-extrabold uppercase leading-[0.94] text-white">{project.title}</h3>
          </div>
        </div>
        <div className="flex items-start justify-between gap-5 px-1 pt-4">
          <p className="max-w-lg text-sm leading-6 text-[#627d98]">{project.description}</p>
          <span className="mt-1 shrink-0 text-[0.62rem] font-bold text-[#0077b8]">Ver projeto →</span>
        </div>
      </button>
    </motion.article>
  );
}

function ProjectViewer({ projects, index, onClose, onNavigate }: { projects: Project[]; index: number; onClose: () => void; onNavigate: (index: number) => void }) {
  const project = projects[index];
  const [activeMedia, setActiveMedia] = useState<ProjectMedia | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((index - 1 + projects.length) % projects.length);
      if (event.key === "ArrowRight") onNavigate((index + 1) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, onClose, onNavigate, projects.length]);

  if (!project) return null;
  const media = project.project_media ?? [];
  const share = async () => {
    const url = `${window.location.origin}/projetos/${project.slug}`;
    if (navigator.share) await navigator.share({ title: project.title, url });
    else await navigator.clipboard.writeText(url);
  };

  return (
    <motion.div className="fixed inset-0 z-[90] overflow-y-auto bg-[#02040a]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Projeto ${project.title}`}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#02040a]/85 px-4 py-3 backdrop-blur-xl sm:px-7">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/48">{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
        <div className="flex gap-2">
          <button onClick={share} className="grid h-11 w-11 place-items-center rounded-full border border-white/12" aria-label="Compartilhar projeto"><Share2 className="h-4 w-4" /></button>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#07152f]" aria-label="Fechar projeto"><X className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="shell py-10 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_.55fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071126]" style={viewportFrameStyle(project.orientation)}>
            {project.mux_playback_id ? (
              <MuxVideo playbackId={project.mux_playback_id} title={`${project.title} — ${project.client}`} poster={project.cover_url} />
            ) : project.video_url ? (
              <video controls playsInline preload="metadata" poster={project.cover_url ?? undefined} className="h-full w-full object-contain"><source src={project.video_url} /></video>
            ) : project.cover_url ? (
              <div className="relative h-full w-full"><Image src={project.cover_url} alt={project.title} fill sizes="70vw" className="object-contain" /></div>
            ) : <MediaPlaceholder project={project} />}
          </div>
          <div className="lg:sticky lg:top-28">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#62b8ff]">{project.category} · {project.year}</p>
            <h2 className="display mt-5 text-[clamp(3rem,7vw,6rem)] font-extrabold uppercase leading-[0.9]">{project.title}</h2>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.13em] text-white/72">{project.client}</p>
            <p className="mt-7 text-base leading-7 text-white/55">{project.full_description || project.description}</p>
            <dl className="mt-8 border-t border-white/12 pt-6 text-sm">
              <div className="flex justify-between gap-5 py-2"><dt className="text-white/38">Formato</dt><dd className="text-right text-white/75">{project.format}</dd></div>
              <div className="flex justify-between gap-5 py-2"><dt className="text-white/38">Serviços</dt><dd className="text-right text-white/75">{project.services.join(", ")}</dd></div>
              {project.credits && <div className="flex justify-between gap-5 py-2"><dt className="text-white/38">Ficha técnica</dt><dd className="whitespace-pre-line text-right text-white/75">{project.credits}</dd></div>}
            </dl>
            <a href={`/projetos/${project.slug}`} className="button-inverse mt-8">Abrir página do projeto <Maximize2 className="h-4 w-4" /></a>
          </div>
        </div>
        {media.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <button key={item.id} onClick={() => setActiveMedia(item)} className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#071126]" style={{ aspectRatio: item.orientation === "vertical" ? "4/5" : item.orientation === "square" ? "1" : "16/9" }}>
                {item.kind === "image" ? <Image src={item.url} alt={item.alt} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <video muted playsInline preload="metadata" poster={item.poster_url ?? undefined} className="h-full w-full object-cover"><source src={item.url} /></video>}
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur"><Maximize2 className="h-4 w-4" /></span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-16 flex items-center justify-between border-t border-white/12 pt-7">
          <button onClick={() => onNavigate((index - 1 + projects.length) % projects.length)} className="button-inverse"><ArrowLeft className="h-4 w-4" /> Anterior</button>
          <button onClick={() => onNavigate((index + 1) % projects.length)} className="button-inverse">Próximo <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <AnimatePresence>
        {activeMedia && (
          <motion.button className="fixed inset-0 z-[110] grid place-items-center bg-black/94 p-4" onClick={() => setActiveMedia(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label="Fechar mídia ampliada">
            {activeMedia.kind === "image" ? <Image src={activeMedia.url} alt={activeMedia.alt} fill sizes="100vw" className="object-contain p-4" /> : <video controls autoPlay className="max-h-[92vh] max-w-full" onClick={(event) => event.stopPropagation()}><source src={activeMedia.url} /></video>}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Portfolio({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Filter>("Todos");
  const [selected, setSelected] = useState<number | null>(null);
  const filtered = useMemo(() => projects.filter((project) => active === "Todos" || (active === "Destaques" ? project.featured : project.category === active)), [active, projects]);

  return (
    <section id="portfolio" className="section-pad relative bg-[#f5f8fb]">
      <div className="shell">
        <SectionHeading eyebrow="Trabalhos selecionados" title="Portfólio" copy="Histórias, marcas, sabores, movimento e pessoas — cada projeto pede uma linguagem própria." />
        <div className="no-scrollbar mt-12 flex gap-2 overflow-x-auto pb-3" role="tablist" aria-label="Filtrar portfólio">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActive(filter)} role="tab" aria-selected={active === filter} className={`shrink-0 rounded-full border px-4 py-2.5 text-[0.68rem] font-bold transition ${active === filter ? "border-[#0077b8] bg-[#0077b8] text-white shadow-[0_10px_25px_-16px_rgba(0,119,184,.8)]" : "border-[#003b70]/12 bg-white text-[#627d98] hover:border-[#0077b8]/40 hover:text-[#0077b8]"}`}>
              {filter}
            </button>
          ))}
        </div>
        <motion.div layout className="mt-9 grid auto-flow-dense gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => <ProjectCard key={project.id} project={project} onOpen={() => setSelected(index)} />)}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && <div className="mt-12 rounded-2xl border border-dashed border-[#003b70]/15 bg-white p-12 text-center text-sm text-[#627d98]">Nenhum projeto publicado nesta categoria.</div>}
      </div>
      <AnimatePresence>
        {selected !== null && <ProjectViewer projects={filtered} index={selected} onClose={() => setSelected(null)} onNavigate={setSelected} />}
      </AnimatePresence>
    </section>
  );
}
