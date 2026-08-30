import type { SiteData } from "@/lib/types";

export const fallbackData: SiteData = {
  photographs: [],
  events: [],
  settings: {
    id: "main",
    logo_url: null,
    hero_video_url: null,
    hero_mux_upload_id: null,
    hero_mux_asset_id: null,
    hero_mux_playback_id: null,
    hero_mux_status: null,
    hero_poster_url: null,
    showreel_url: null,
    about_image_url: null,
    team_image_url: null,
    cta_background_url: null,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    email: "",
    address: "",
    hero_title: "CRIAMOS EXPERIÊNCIAS. CONTAMOS HISTÓRIAS.",
    hero_support: "DO SEU IDEAL AO RESULTADO EXTRAORDINÁRIO.",
    hero_description:
      "Produção audiovisual, fotografia e conteúdo para marcas que querem ser vistas, lembradas e sentidas.",
    about_text:
      "A AA Design & Media conduz cada projeto do briefing à entrega, combinando direção, captação e pós-produção em uma operação próxima e feita sob medida.",
    footer_text: "Produção audiovisual, fotografia, drone e conteúdo."
  },
  projects: [],
  services: [
    { id: "s1", title: "Vídeo institucional", description: "Narrativa, direção e produção para apresentar marcas com clareza.", icon: "Clapperboard", visible: true, position: 0 },
    { id: "s2", title: "Conteúdo para redes", description: "Conteúdo recorrente pensado para alcance, presença e conversão.", icon: "Smartphone", visible: true, position: 1 },
    { id: "s3", title: "Fotografia", description: "Retratos, produtos, gastronomia e cobertura com direção visual.", icon: "Camera", visible: true, position: 2 },
    { id: "s4", title: "Direção criativa", description: "Conceito, roteiro, linguagem visual e planejamento de produção.", icon: "Sparkles", visible: true, position: 3 },
    { id: "s5", title: "Drone e FPV", description: "Imagens aéreas e movimentos imersivos para ampliar a narrativa.", icon: "Plane", visible: true, position: 4 },
    { id: "s6", title: "Cobertura de eventos", description: "Foto, vídeo, bastidores e entregas ágeis para o digital.", icon: "CalendarRange", visible: true, position: 5 },
    { id: "s7", title: "Documentários", description: "Histórias conduzidas com escuta, pesquisa e linguagem cinematográfica.", icon: "Film", visible: true, position: 6 },
    { id: "s8", title: "Pós-produção", description: "Edição, cor, tratamento de áudio e finalização multiformato.", icon: "SlidersHorizontal", visible: true, position: 7 }
  ],
  equipment: [
    { id: "e1", title: "Cinema digital 4K", description: "Captação principal em alta resolução e ampla latitude de cor.", image_url: null, visible: true, position: 0 },
    { id: "e2", title: "Óptica profissional", description: "Versatilidade e consistência para produções em movimento.", image_url: null, visible: true, position: 1 },
    { id: "e3", title: "Drone e FPV", description: "Perspectivas aéreas e movimentos imersivos.", image_url: null, visible: true, position: 2 },
    { id: "e4", title: "Luz, áudio e estabilização", description: "Kit de produção adaptado a entrevistas, eventos e set.", image_url: null, visible: true, position: 3 }
  ],
  clients: [],
  testimonials: [],
  behindScenes: []
};
