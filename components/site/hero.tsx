"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Camera, Check, Film, Plane, Play, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { MuxVideo } from "@/components/mux-video";

const capabilities = [
  { icon: Film, label: "Vídeo" },
  { icon: Camera, label: "Foto" },
  { icon: Plane, label: "Drone" }
];

export function Hero({ settings }: { settings: SiteSettings }) {
  const reduceMotion = useReducedMotion();
  const showreelHref = settings.showreel_url || settings.hero_video_url || "#portfolio";
  const headline = settings.hero_title.match(/[^.]+\.?/g)?.map((line) => line.trim()).filter(Boolean) ?? [settings.hero_title];

  return (
    <section id="inicio" className="grain relative min-h-[92svh] overflow-hidden bg-white pt-28 sm:pt-32">
      <div className="hero-grid absolute inset-0" />
      <div className="absolute -right-48 top-16 h-[34rem] w-[34rem] rounded-full bg-[#20c4e8]/10 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#0077b8]/8 blur-3xl" />

      <div className="shell relative z-10 grid min-h-[calc(92svh-7rem)] items-center gap-14 pb-20 lg:grid-cols-[1.04fr_.96fr] lg:gap-20">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#0077b8]/14 bg-[#eef8fc] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[#005a9c]">
            <Sparkles className="h-3.5 w-3.5 text-[#00a3e0]" />
            Produtora audiovisual · São Paulo
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="display max-w-4xl text-[clamp(3.25rem,7.2vw,6.8rem)] font-bold leading-[0.94] text-[#102a43]">
            {headline.map((line, index) => (
              <span key={`${line}-${index}`} className={`block ${index > 0 ? "text-[#0077b8]" : ""}`}>{line}</span>
            ))}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-7 max-w-xl text-base leading-8 text-[#627d98] sm:text-lg">
            {settings.hero_description}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-9 flex flex-wrap gap-3">
            <a href="#contato" className="button-primary">Pedir um orçamento <ArrowUpRight className="h-4 w-4" /></a>
            <a href={showreelHref} className="button-ghost"><Play className="h-4 w-4 fill-current" /> Ver nossos trabalhos</a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Produção completa", "Atendimento próximo", "Entrega multiformato"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#486581]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e6f7fb] text-[#0077b8]"><Check className="h-3.5 w-3.5" /></span>
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 34, rotate: 1.2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[35rem] lg:mx-0 lg:ml-auto">
          <div className="soft-card relative aspect-[4/4.7] overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#f8fcff,#e7f5fb)] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(32,196,232,.24),transparent_34%)]" />
            {settings.hero_mux_playback_id || settings.hero_video_url ? (
              <div className="absolute inset-5 overflow-hidden rounded-[1.45rem] sm:inset-7">
                {settings.hero_mux_playback_id ? <MuxVideo playbackId={settings.hero_mux_playback_id} title="Showreel AA Design & Media" poster={settings.hero_poster_url} autoPlay={!reduceMotion} muted loop className="object-cover" /> : <video autoPlay={!reduceMotion} muted loop playsInline preload="metadata" poster={settings.hero_poster_url ?? undefined} className="h-full w-full object-cover"><source src={settings.hero_video_url!} /></video>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#003b70]/55 via-transparent to-transparent" />
              </div>
            ) : (
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-[17%] top-[18%] aspect-[448/328] bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/brand/aa-mark.png')" }}
                role="img"
                aria-label="Símbolo da AA Design & Media"
              />
            )}
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4 rounded-2xl border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_-35px_rgba(0,59,112,.5)] backdrop-blur-xl">
              <div><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#0077b8]">AA Design &amp; Media</p><p className="mt-1 text-sm font-bold text-[#102a43]">Ideia, captação e entrega.</p></div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#003b70] text-white"><Play className="h-4 w-4 fill-current" /></span>
            </div>
          </div>

          <div className="soft-card absolute left-3 top-[13%] rounded-2xl p-3 sm:-left-4 lg:-left-10">
            <p className="mb-2 text-[0.58rem] font-extrabold uppercase tracking-[0.11em] text-[#627d98]">Tudo em um só time</p>
            <div className="flex gap-2">
              {capabilities.map(({ icon: Icon, label }) => <span key={label} className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8fc] text-[#0077b8]" title={label}><Icon className="h-4 w-4" /></span>)}
            </div>
          </div>
          <div className="soft-card absolute right-3 top-[27%] rounded-2xl px-4 py-3 sm:-right-4 lg:-right-8">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#627d98]">Atendimento</p>
            <p className="mt-1 text-sm font-bold text-[#003b70]">São Paulo · Brasil</p>
          </div>
        </motion.div>
      </div>

      <a href="#portfolio" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[0.64rem] font-bold text-[#627d98] lg:flex" aria-label="Continuar rolando">
        Conheça nossos projetos <ArrowDown className="h-4 w-4" />
      </a>
    </section>
  );
}
