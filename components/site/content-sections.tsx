"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Aperture,
  Building2,
  CalendarRange,
  Camera,
  Clapperboard,
  Film,
  Lightbulb,
  Mic2,
  Plane,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  X
} from "lucide-react";
import { useRef, useState, type ComponentType, type SVGProps } from "react";
import { SectionHeading } from "@/components/section-heading";
import type { BehindScene, ClientLogo, Equipment, Service, SiteSettings, Testimonial } from "@/lib/types";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
const icons: Record<string, IconComponent> = {
  Building2,
  CalendarRange,
  Camera,
  Clapperboard,
  Film,
  Plane,
  SlidersHorizontal,
  Smartphone,
  Aperture,
  Lightbulb,
  Mic2
};

const process = [
  ["01", "Briefing", "Entendemos contexto, objetivo, público e formato."],
  ["02", "Planejamento", "Transformamos intenção em roteiro, agenda e plano de captação."],
  ["03", "Captação", "Dirigimos imagem, som, luz e movimento no set."],
  ["04", "Pós-produção", "Montagem, cor, áudio e versões para cada plataforma."],
  ["05", "Entrega", "Arquivos organizados, revisados e prontos para publicar."]
];

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="servicos" className="section-pad bg-white text-[#102a43]">
      <div className="shell">
        <SectionHeading eyebrow="O que fazemos" title="Serviços" copy="Estratégia e execução no mesmo time. Montamos a equipe e o kit certos para o tamanho de cada história." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = icons[service.icon] ?? Sparkles;
            return (
              <Reveal key={service.id} delay={(index % 4) * 0.06}>
                <article className="group min-h-64 rounded-[1.4rem] border border-[#003b70]/10 bg-[#f8fbfd] p-6 transition-all hover:-translate-y-1 hover:border-[#0077b8]/28 hover:bg-white hover:shadow-[0_22px_55px_-38px_rgba(0,59,112,.5)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f6fb] text-[#0077b8] transition group-hover:bg-[#0077b8] group-hover:text-white"><Icon className="h-5 w-5" /></span>
                    <span className="text-[0.62rem] font-bold tracking-[0.12em] text-[#829ab1]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="display mt-10 text-2xl font-bold leading-[1.05]">{service.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#627d98]">{service.description}</p>
                  <a href="#contato" className="mt-6 inline-flex text-[0.68rem] font-bold text-[#0077b8]">Pedir orçamento →</a>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function About({ settings, equipment }: { settings: SiteSettings; equipment: Equipment[] }) {
  return (
    <>
      <section id="sobre" className="section-pad overflow-hidden bg-[#f5f8fb] text-[#102a43]">
        <div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#003b70]/10 bg-white shadow-[0_30px_70px_-45px_rgba(0,59,112,.45)]" style={{ aspectRatio: "4/5" }}>
              {settings.team_image_url || settings.about_image_url ? (
                <Image src={(settings.team_image_url || settings.about_image_url)!} alt="Arthur e Alana, equipe da AA Design & Media" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              ) : (
                <div className="media-placeholder flex h-full items-end p-7">
                  <div><p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#8bdcff]">Imagem da equipe</p><p className="display mt-3 text-4xl font-bold text-white">Arthur + Alana</p></div>
                </div>
              )}
              <div className="absolute right-5 top-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-[0.6rem] font-bold text-[#003b70] shadow-sm backdrop-blur">São Paulo · Brasil</div>
            </div>
          </Reveal>
          <div>
            <Reveal><span className="eyebrow text-[#0077b8]">A produtora</span></Reveal>
            <Reveal delay={0.08}><h2 className="display mt-7 text-[clamp(3rem,6vw,5.8rem)] font-bold leading-[0.98]">Ideias viram<br /><span className="text-[#0077b8]">experiências</span><br />visuais.</h2></Reveal>
            <Reveal delay={0.15}><p className="mt-7 max-w-2xl text-base leading-8 text-[#627d98]">{settings.about_text}</p></Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 grid gap-4 border-t border-[#003b70]/10 pt-7 sm:grid-cols-3">
                {["Direção próxima", "Produção completa", "Entrega multiformato"].map((item, index) => <div key={item}><span className="text-[0.62rem] font-bold text-[#00a3e0]">0{index + 1}</span><p className="mt-2 text-sm font-bold text-[#102a43]">{item}</p></div>)}
              </div>
            </Reveal>
          </div>
        </div>
        <div className="shell mt-24">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#627d98]">Kit de produção</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {equipment.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 0.05}>
                <div className="min-h-44 rounded-[1.25rem] border border-[#003b70]/10 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(0,59,112,.4)]">
                  <Aperture className="h-5 w-5 text-[#0077b8]" />
                  <h3 className="mt-9 text-sm font-bold text-[#102a43]">{item.title}</h3>
                  <p className="mt-3 text-xs leading-5 text-[#627d98]">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Process />
    </>
  );
}

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return (
    <section className="section-pad bg-white text-[#102a43]">
      <div className="shell">
        <SectionHeading eyebrow="Como trabalhamos" title="Processo" copy="Clareza em cada etapa, com decisões criativas alinhadas ao objetivo do projeto." />
        <div ref={ref} className="relative mt-16 grid gap-8 md:grid-cols-5">
          <div className="absolute left-0 right-0 top-[1.2rem] hidden h-px bg-[#003b70]/10 md:block"><motion.div className="h-full origin-left bg-[#00a3e0]" initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : undefined} transition={{ duration: 1.2 }} /></div>
          {process.map(([number, title, copy], index) => (
            <Reveal key={title} delay={index * 0.08}>
              <div className="relative">
                <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-[#0b66ff]/30 bg-white text-[0.62rem] font-black text-[#0b66ff]">{number}</span>
                <h3 className="display mt-7 text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#687487]">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BehindScenes({ items }: { items: BehindScene[] }) {
  const [selected, setSelected] = useState<BehindScene | null>(null);
  return (
    <section id="bastidores" className="section-pad bg-[#f5f8fb] text-[#102a43]">
      <div className="shell">
        <SectionHeading eyebrow="Por trás da câmera" title="Bastidores" copy="A construção da imagem também faz parte da história: pessoas, decisões, luz e movimento." />
      </div>
      <div className="no-scrollbar mt-14 flex snap-x gap-4 overflow-x-auto px-[max(1rem,calc((100vw-88rem)/2))] pb-5">
        {items.map((item, index) => (
          <motion.button key={item.id} onClick={() => item.media_url && setSelected(item)} whileHover={{ y: -5 }} className="group relative aspect-[9/14] w-[72vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[#003b70]/10 bg-white text-left shadow-[0_22px_55px_-40px_rgba(0,59,112,.5)]">
            {item.media_url ? item.media_type === "image" ? <Image src={item.media_url} alt={item.title} fill sizes="360px" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <video muted loop playsInline preload="metadata" poster={item.poster_url ?? undefined} className="h-full w-full object-cover" onMouseEnter={(event) => event.currentTarget.play().catch(() => undefined)} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }}><source src={item.media_url} /></video> : <div className="media-placeholder h-full w-full" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />
            <span className="absolute left-4 top-4 text-[0.58rem] font-bold tracking-[0.18em] text-white/45">0{index + 1}</span>
            <div className="absolute inset-x-0 bottom-0 p-5"><h3 className="display text-3xl font-bold leading-none text-white">{item.title}</h3><p className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#8bdcff]">{item.equipment || "Equipamento a cadastrar"}</p></div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected && <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-[#07152f]" onClick={() => setSelected(null)} aria-label="Fechar bastidor"><X className="h-5 w-5" /></button>{selected.media_type === "video" ? <video controls autoPlay playsInline className="max-h-[88vh] max-w-full rounded-xl"><source src={selected.media_url!} /></video> : <div className="relative h-[85vh] w-[90vw]"><Image src={selected.media_url!} alt={selected.title} fill sizes="90vw" className="object-contain" /></div>}</motion.div>}
      </AnimatePresence>
    </section>
  );
}

export function Clients({ clients, testimonials }: { clients: ClientLogo[]; testimonials: Testimonial[] }) {
  const reduceMotion = useReducedMotion();
  const doubled = reduceMotion ? clients : [...clients, ...clients];
  return (
    <section id="clientes" className="relative overflow-hidden bg-white py-24 text-[#102a43]">
      <div className="absolute -right-24 -top-20 h-[28rem] w-[38rem] opacity-[0.035]"><Image src="/brand/aa-mark.png" alt="" fill sizes="610px" className="object-contain" /></div>
      <div className="shell relative"><span className="eyebrow text-[#0077b8]">Marcas que confiaram na AA</span><h2 className="display mt-7 max-w-4xl text-[clamp(2.8rem,5.5vw,5.5rem)] font-bold leading-[0.98]">Parcerias que viram <span className="text-[#0077b8]">boas histórias.</span></h2></div>
      <div className="relative mt-14 overflow-hidden border-y border-[#003b70]/10 bg-[#f8fbfd] py-9">
        <div className="flex w-max items-center" style={!reduceMotion ? { animation: "marquee 28s linear infinite" } : undefined}>
          {doubled.map((client, index) => (
            <div key={`${client.id}-${index}`} className="mx-8 flex h-16 min-w-48 items-center justify-center sm:mx-14">
              {client.logo_url ? <div className="relative h-12 w-40"><Image src={client.logo_url} alt={`Logo ${client.name}`} fill sizes="160px" className="object-contain" /></div> : <span className="display text-center text-2xl font-bold text-[#486581]">{client.name}</span>}
            </div>
          ))}
        </div>
      </div>
      {testimonials.length > 0 && (
        <div className="shell mt-20 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => <blockquote key={item.id} className="rounded-[1.4rem] border border-[#003b70]/10 bg-[#f8fbfd] p-7"><p className="text-lg leading-8 text-[#334e68]">“{item.quote}”</p><footer className="mt-7 text-xs font-bold text-[#0077b8]">{item.author_name}{item.author_company ? ` · ${item.author_company}` : ""}</footer></blockquote>)}
        </div>
      )}
    </section>
  );
}
