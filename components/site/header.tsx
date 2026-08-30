"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";

const links = [
  ["inicio", "Início"],
  ["portfolio", "Portfólio"],
  ["fotografias", "Fotos"],
  ["agenda", "Agenda"],
  ["servicos", "Serviços"],
  ["sobre", "Sobre"],
  ["bastidores", "Bastidores"],
  ["clientes", "Clientes"],
  ["contato", "Contato"]
] as const;

export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("inicio");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-38% 0px -55%" }
    );
    links.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-[#003b70]/10 bg-white/92 py-2.5 shadow-[0_18px_55px_-40px_rgba(0,59,112,.5)] backdrop-blur-2xl" : "bg-white/70 py-4 backdrop-blur-xl"}`}>
      <div className="shell flex items-center justify-between gap-6">
        <a href="#inicio" aria-label="Voltar ao início"><Brand logoUrl={logoUrl} /></a>
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Navegação principal">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={`relative py-2 text-[0.68rem] font-bold transition-colors ${active === id ? "text-[#003b70]" : "text-[#627d98] hover:text-[#0077b8]"}`}>
              {label}
              {active === id && <motion.span layoutId="active-section" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#00a3e0]" />}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contato" className="button-primary hidden sm:inline-flex">Solicitar orçamento <ArrowUpRight className="h-4 w-4" /></a>
          <button onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-[#003b70]/12 bg-white text-[#003b70] shadow-sm xl:hidden" aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-4 mt-3 rounded-2xl border border-[#003b70]/10 bg-white/98 p-4 text-[#102a43] shadow-[0_22px_60px_-32px_rgba(0,59,112,.45)] xl:hidden">
            {links.map(([id, label], index) => (
              <motion.a key={id} href={`#${id}`} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.035 } }} className="flex items-center justify-between border-b border-[#003b70]/8 py-3 text-sm font-bold text-[#486581] last:border-0">
                {label}<span className="text-[#00a3e0]">0{index + 1}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
