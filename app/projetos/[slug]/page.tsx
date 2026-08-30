import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { getProject } from "@/lib/queries";
import { MuxVideo } from "@/components/mux-video";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function viewportFrameStyle(orientation: "horizontal" | "vertical" | "square", maxHeight = 72) {
  const ratio = orientation === "vertical" ? 4 / 5 : orientation === "square" ? 1 : 16 / 9;
  return {
    aspectRatio: `${ratio}`,
    width: `min(100%, ${(maxHeight * ratio).toFixed(1)}svh)`,
    maxHeight: `${maxHeight}svh`,
    marginInline: "auto"
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.client}`,
    description: project.description,
    alternates: { canonical: `/projetos/${project.slug}` },
    openGraph: { title: `${project.title} | AA Design & Media`, description: project.description, type: "article", images: project.cover_url ? [{ url: project.cover_url }] : ["/opengraph-image"] }
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const media = project.project_media ?? [];

  return (
    <main className="min-h-screen bg-white text-[#102a43]">
      <header className="border-b border-[#003b70]/10 py-5"><div className="shell flex items-center justify-between"><Link href="/"><Brand /></Link><Link href="/#portfolio" className="button-ghost"><ArrowLeft className="h-4 w-4" /> Voltar ao portfólio</Link></div></header>
      <article className="shell py-14 sm:py-20">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#0077b8]">{project.category} · {project.year}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <h1 className="display text-[clamp(3.4rem,7.8vw,7rem)] font-bold leading-[0.96]">{project.title}</h1>
          <div><p className="text-sm font-bold text-[#003b70]">{project.client}</p><p className="mt-5 max-w-xl text-base leading-7 text-[#627d98]">{project.full_description || project.description}</p></div>
        </div>
        <div className="mt-12 overflow-hidden rounded-[1.6rem] border border-[#003b70]/10 bg-[#eef6fa] shadow-[0_26px_65px_-45px_rgba(0,59,112,.5)]" style={viewportFrameStyle(project.orientation)}>
          {project.mux_playback_id ? <MuxVideo playbackId={project.mux_playback_id} title={`${project.title} — ${project.client}`} poster={project.cover_url} /> : project.video_url ? <video controls playsInline preload="metadata" poster={project.cover_url ?? undefined} className="h-full w-full object-contain"><source src={project.video_url} /></video> : project.cover_url ? <div className="relative h-full"><Image src={project.cover_url} alt={project.title} fill sizes="100vw" className="object-contain" /></div> : <div className="media-placeholder flex h-full items-center justify-center text-center"><div><div className="relative mx-auto h-24 w-36 opacity-50"><Image src="/brand/aa-mark.png" alt="" fill sizes="144px" className="object-contain" /></div><p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#8bdcff]">Mídia pronta para upload</p><p className="display mt-3 text-5xl font-bold text-white">{project.client}</p></div></div>}
        </div>
        <div className="mt-12 grid gap-8 border-t border-[#003b70]/10 pt-8 md:grid-cols-3"><div><p className="text-xs text-[#829ab1]">Formato</p><p className="mt-2 text-sm">{project.format}</p></div><div><p className="text-xs text-[#829ab1]">Serviços</p><p className="mt-2 text-sm">{project.services.join(", ")}</p></div>{project.credits && <div><p className="text-xs text-[#829ab1]">Ficha técnica</p><p className="mt-2 whitespace-pre-line text-sm">{project.credits}</p></div>}</div>
        {media.length > 0 && <div className="mt-16 grid gap-4 md:grid-cols-2">{media.map((item) => <div key={item.id} className="relative overflow-hidden rounded-[1.25rem] border border-[#003b70]/10 bg-[#eef6fa]" style={{ aspectRatio: item.orientation === "vertical" ? "4/5" : item.orientation === "square" ? "1" : "16/9" }}>{item.kind === "image" ? <Image src={item.url} alt={item.alt} fill sizes="50vw" className="object-cover" /> : <video controls playsInline preload="metadata" poster={item.poster_url ?? undefined} className="h-full w-full object-cover"><source src={item.url} /></video>}</div>)}</div>}
        <div className="mt-20 rounded-[1.75rem] border border-[#0077b8]/10 bg-[linear-gradient(135deg,#eef8fc,#ffffff)] p-8 sm:p-12"><p className="display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.98]">Quer criar algo com essa energia?</p><Link href="/#contato" className="button-primary mt-8">Solicitar orçamento <ArrowUpRight className="h-4 w-4" /></Link></div>
      </article>
    </main>
  );
}
