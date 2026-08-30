export const PROJECT_CATEGORIES = [
  "Institucional",
  "Eventos",
  "Social Content",
  "Gastronomia",
  "Esportes e turfe",
  "Drone e FPV",
  "Fotografia",
  "Documentários",
  "Imóveis"
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type MediaOrientation = "horizontal" | "vertical" | "square";

export interface ProjectMedia {
  id: string;
  project_id: string;
  kind: "image" | "video";
  url: string;
  poster_url: string | null;
  alt: string;
  orientation: MediaOrientation;
  position: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: number;
  format: string;
  description: string;
  full_description: string | null;
  services: string[];
  credits: string | null;
  cover_url: string | null;
  video_url: string | null;
  mux_upload_id: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  mux_status: "waiting" | "processing" | "ready" | "errored" | null;
  orientation: MediaOrientation;
  aspect_ratio: string;
  focal_x: number;
  focal_y: number;
  featured: boolean;
  published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  project_media?: ProjectMedia[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  position: number;
}

export interface Equipment {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  visible: boolean;
  position: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  logo_url: string | null;
  visible: boolean;
  position: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  portrait_url: string | null;
  visible: boolean;
  position: number;
}

export interface BehindScene {
  id: string;
  title: string;
  media_url: string | null;
  poster_url: string | null;
  media_type: "image" | "video";
  equipment: string | null;
  orientation: MediaOrientation;
  visible: boolean;
  position: number;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  hero_video_url: string | null;
  hero_mux_upload_id: string | null;
  hero_mux_asset_id: string | null;
  hero_mux_playback_id: string | null;
  hero_mux_status: "waiting" | "processing" | "ready" | "errored" | null;
  hero_poster_url: string | null;
  showreel_url: string | null;
  about_image_url: string | null;
  team_image_url: string | null;
  cta_background_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  address: string | null;
  hero_title: string;
  hero_support: string;
  hero_description: string;
  about_text: string;
  footer_text: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  event_type: string;
  description: string | null;
  city: string;
  venue: string | null;
  starts_at: string | null;
  ends_at: string | null;
  cover_url: string | null;
  status: "planejado" | "confirmado" | "concluido" | "cancelado";
  published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Photograph {
  id: string;
  title: string;
  image_url: string;
  alt: string;
  event_id: string | null;
  captured_at: string | null;
  orientation: MediaOrientation;
  published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  client_name: string;
  company: string | null;
  email: string;
  phone: string;
  service_type: string;
  desired_date: string;
  alternate_date: string | null;
  city: string;
  venue: string | null;
  duration_hours: number | null;
  notes: string;
  status: "solicitado" | "em_analise" | "confirmado" | "recusado" | "concluido";
  assigned_team: string[];
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceEntry {
  id: string;
  kind: "entrada" | "saida";
  category: string;
  description: string;
  amount_cents: number;
  due_date: string;
  paid_at: string | null;
  project_id: string | null;
  event_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelEstimate {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  round_trip: boolean;
  fuel_price: number;
  km_per_liter: number;
  tolls_cents: number;
  extra_cents: number;
  total_cents: number;
  notes: string | null;
  created_at: string;
}

export interface AiBriefing {
  id: string;
  client_name: string;
  project_type: string;
  objective: string;
  audience: string | null;
  deliverables: string | null;
  budget: string | null;
  deadline: string | null;
  references: string | null;
  raw_notes: string | null;
  generated_briefing: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteData {
  projects: Project[];
  photographs: Photograph[];
  events: PublicEvent[];
  services: Service[];
  equipment: Equipment[];
  clients: ClientLogo[];
  testimonials: Testimonial[];
  behindScenes: BehindScene[];
  settings: SiteSettings;
}

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  project_type: string;
  expected_date: string | null;
  city: string;
  budget: string;
  description: string;
  reference_url: string | null;
  consent: boolean;
  status: "novo" | "em_contato" | "convertido" | "arquivado";
  created_at: string;
}
