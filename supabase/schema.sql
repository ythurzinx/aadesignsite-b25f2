-- AA Design & Media — schema completo para Supabase
-- Execute uma vez no SQL Editor de um projeto novo.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin reads own membership" on public.admin_users;
create policy "admin reads own membership" on public.admin_users
for select to authenticated using (id = (select auth.uid()));

create table if not exists public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  logo_url text,
  hero_video_url text,
  hero_mux_upload_id text,
  hero_mux_asset_id text,
  hero_mux_playback_id text,
  hero_mux_status text check (hero_mux_status is null or hero_mux_status in ('waiting','processing','ready','errored')),
  hero_poster_url text,
  showreel_url text,
  about_image_url text,
  team_image_url text,
  cta_background_url text,
  whatsapp text,
  instagram text,
  email text,
  address text,
  hero_title text not null default 'CRIAMOS EXPERIÊNCIAS. CONTAMOS HISTÓRIAS.',
  hero_support text not null default 'DO SEU IDEAL AO RESULTADO EXTRAORDINÁRIO.',
  hero_description text not null default 'Produção audiovisual, fotografia e conteúdo em São Paulo.',
  about_text text not null default 'A AA Design & Media transforma ideias em experiências visuais.',
  footer_text text not null default 'Produção audiovisual, fotografia, drone e conteúdo em São Paulo.',
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 160),
  client text not null check (char_length(client) between 2 and 160),
  category text not null check (category in ('Institucional','Eventos','Social Content','Gastronomia','Esportes e turfe','Drone e FPV','Fotografia','Documentários','Imóveis')),
  year integer not null check (year between 2000 and 2100),
  format text not null default '',
  description text not null check (char_length(description) between 2 and 350),
  full_description text,
  services text[] not null default '{}',
  credits text,
  cover_url text,
  video_url text,
  mux_upload_id text,
  mux_asset_id text,
  mux_playback_id text,
  mux_status text check (mux_status is null or mux_status in ('waiting','processing','ready','errored')),
  orientation text not null default 'horizontal' check (orientation in ('horizontal','vertical','square')),
  aspect_ratio text not null default '16/9' check (aspect_ratio in ('16/9','16/10','4/5','9/16','1/1')),
  focal_x integer not null default 50 check (focal_x between 0 and 100),
  focal_y integer not null default 50 check (focal_y between 0 and 100),
  featured boolean not null default false,
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_public_order_idx on public.projects (published, position);
create index if not exists projects_category_idx on public.projects (category) where published;

alter table public.site_settings add column if not exists hero_mux_upload_id text;
alter table public.site_settings add column if not exists hero_mux_asset_id text;
alter table public.site_settings add column if not exists hero_mux_playback_id text;
alter table public.site_settings add column if not exists hero_mux_status text;
alter table public.projects add column if not exists mux_upload_id text;
alter table public.projects add column if not exists mux_asset_id text;
alter table public.projects add column if not exists mux_playback_id text;
alter table public.projects add column if not exists mux_status text;

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('image','video')),
  url text not null,
  poster_url text,
  alt text not null default '',
  orientation text not null default 'horizontal' check (orientation in ('horizontal','vertical','square')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_idx on public.project_media (project_id, position);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 180),
  event_type text not null default 'Evento',
  description text,
  city text not null default '',
  venue text,
  starts_at timestamptz,
  ends_at timestamptz,
  cover_url text,
  status text not null default 'planejado' check (status in ('planejado','confirmado','concluido','cancelado')),
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index if not exists events_schedule_idx on public.events (starts_at, status);

create table if not exists public.photographs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 180),
  image_url text not null,
  alt text not null default '',
  event_id uuid references public.events(id) on delete set null,
  captured_at date,
  orientation text not null default 'horizontal' check (orientation in ('horizontal','vertical','square')),
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photographs_public_idx on public.photographs (published, position);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text,
  email text not null,
  phone text not null,
  service_type text not null,
  desired_date date not null,
  alternate_date date,
  city text not null,
  venue text,
  duration_hours numeric(6,2),
  notes text not null,
  status text not null default 'solicitado' check (status in ('solicitado','em_analise','confirmado','recusado','concluido')),
  assigned_team text[] not null default '{}',
  internal_notes text,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_schedule_idx on public.booking_requests (desired_date, status);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('entrada','saida')),
  category text not null,
  description text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  due_date date not null,
  paid_at timestamptz,
  project_id uuid references public.projects(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_entries_due_idx on public.finance_entries (due_date, kind);

create table if not exists public.travel_estimates (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  distance_km numeric(10,2) not null check (distance_km >= 0),
  round_trip boolean not null default true,
  fuel_price numeric(10,2) not null check (fuel_price >= 0),
  km_per_liter numeric(10,2) not null check (km_per_liter > 0),
  tolls_cents bigint not null default 0 check (tolls_cents >= 0),
  extra_cents bigint not null default 0 check (extra_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_briefings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  project_type text not null,
  objective text not null,
  audience text,
  deliverables text,
  budget text,
  deadline text,
  "references" text,
  raw_notes text,
  generated_briefing text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'Sparkles',
  visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_role text,
  author_company text,
  portrait_url text,
  visible boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.behind_scenes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_url text,
  poster_url text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  equipment text,
  orientation text not null default 'vertical' check (orientation in ('horizontal','vertical','square')),
  visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text not null,
  email text not null,
  project_type text not null,
  expected_date date,
  city text not null,
  budget text not null,
  description text not null,
  reference_url text,
  consent boolean not null check (consent),
  status text not null default 'novo' check (status in ('novo','em_contato','convertido','arquivado')),
  source text not null default 'site',
  ip_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_created_idx on public.leads (status, created_at desc);

create table if not exists public.lead_rate_limits (
  identifier text primary key check (identifier ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists lead_rate_limits_window_idx on public.lead_rate_limits (window_started_at);

create or replace function public.submit_contact_lead(p_identifier text, p_lead jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_count integer;
  inserted_id uuid;
begin
  if p_identifier !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_identifier' using errcode = '22023';
  end if;

  insert into public.lead_rate_limits (identifier, window_started_at, attempt_count, updated_at)
  values (p_identifier, now(), 1, now())
  on conflict (identifier) do update set
    window_started_at = case
      when public.lead_rate_limits.window_started_at < now() - interval '15 minutes' then now()
      else public.lead_rate_limits.window_started_at
    end,
    attempt_count = case
      when public.lead_rate_limits.window_started_at < now() - interval '15 minutes' then 1
      else public.lead_rate_limits.attempt_count + 1
    end,
    updated_at = now()
  returning attempt_count into current_count;

  if current_count > 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.leads (
    name, company, phone, email, project_type, expected_date, city, budget,
    description, reference_url, consent, status, source, ip_hash
  ) values (
    p_lead ->> 'name',
    nullif(p_lead ->> 'company', ''),
    p_lead ->> 'phone',
    p_lead ->> 'email',
    p_lead ->> 'project_type',
    nullif(p_lead ->> 'expected_date', '')::date,
    p_lead ->> 'city',
    p_lead ->> 'budget',
    p_lead ->> 'description',
    nullif(p_lead ->> 'reference_url', ''),
    coalesce((p_lead ->> 'consent')::boolean, false),
    'novo',
    'site',
    p_identifier
  ) returning id into inserted_id;

  delete from public.lead_rate_limits
  where window_started_at < now() - interval '2 days';

  return inserted_id;
end;
$$;

revoke all on function public.submit_contact_lead(text, jsonb) from public;
grant execute on function public.submit_contact_lead(text, jsonb) to service_role;

create or replace function public.submit_booking_request(p_identifier text, p_booking jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_count integer;
  inserted_id uuid;
begin
  if p_identifier !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_identifier' using errcode = '22023';
  end if;

  insert into public.lead_rate_limits (identifier, window_started_at, attempt_count, updated_at)
  values (p_identifier, now(), 1, now())
  on conflict (identifier) do update set
    window_started_at = case when public.lead_rate_limits.window_started_at < now() - interval '15 minutes' then now() else public.lead_rate_limits.window_started_at end,
    attempt_count = case when public.lead_rate_limits.window_started_at < now() - interval '15 minutes' then 1 else public.lead_rate_limits.attempt_count + 1 end,
    updated_at = now()
  returning attempt_count into current_count;

  if current_count > 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.booking_requests (
    client_name, company, email, phone, service_type, desired_date,
    alternate_date, city, venue, duration_hours, notes, ip_hash
  ) values (
    p_booking ->> 'client_name',
    nullif(p_booking ->> 'company', ''),
    p_booking ->> 'email',
    p_booking ->> 'phone',
    p_booking ->> 'service_type',
    (p_booking ->> 'desired_date')::date,
    nullif(p_booking ->> 'alternate_date', '')::date,
    p_booking ->> 'city',
    nullif(p_booking ->> 'venue', ''),
    nullif(p_booking ->> 'duration_hours', '')::numeric,
    p_booking ->> 'notes',
    p_identifier
  ) returning id into inserted_id;

  delete from public.lead_rate_limits
  where window_started_at < now() - interval '2 days';

  return inserted_id;
end;
$$;

revoke all on function public.submit_booking_request(text, jsonb) from public;
grant execute on function public.submit_booking_request(text, jsonb) to service_role;

do $$
declare table_name text;
begin
  foreach table_name in array array['site_settings','projects','services','equipment','client_logos','testimonials','behind_scenes','leads','events','photographs','booking_requests','finance_entries','ai_briefings']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.services enable row level security;
alter table public.equipment enable row level security;
alter table public.client_logos enable row level security;
alter table public.testimonials enable row level security;
alter table public.behind_scenes enable row level security;
alter table public.leads enable row level security;
alter table public.lead_rate_limits enable row level security;
alter table public.events enable row level security;
alter table public.photographs enable row level security;
alter table public.booking_requests enable row level security;
alter table public.finance_entries enable row level security;
alter table public.travel_estimates enable row level security;
alter table public.ai_briefings enable row level security;

drop policy if exists "public reads settings" on public.site_settings;
create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings" on public.site_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects" on public.projects for select to anon using (published);
drop policy if exists "authenticated reads published projects" on public.projects;
create policy "authenticated reads published projects" on public.projects for select to authenticated using (published or (select public.is_admin()));
drop policy if exists "admins insert projects" on public.projects;
create policy "admins insert projects" on public.projects for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "admins update projects" on public.projects;
create policy "admins update projects" on public.projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete projects" on public.projects;
create policy "admins delete projects" on public.projects for delete to authenticated using ((select public.is_admin()));

drop policy if exists "public reads published project media" on public.project_media;
create policy "public reads published project media" on public.project_media for select to anon using (exists (select 1 from public.projects p where p.id = project_id and p.published));
drop policy if exists "authenticated reads project media" on public.project_media;
create policy "authenticated reads project media" on public.project_media for select to authenticated using ((select public.is_admin()) or exists (select 1 from public.projects p where p.id = project_id and p.published));
drop policy if exists "admins insert project media" on public.project_media;
create policy "admins insert project media" on public.project_media for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "admins update project media" on public.project_media;
create policy "admins update project media" on public.project_media for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete project media" on public.project_media;
create policy "admins delete project media" on public.project_media for delete to authenticated using ((select public.is_admin()));

do $$
declare table_name text;
begin
  foreach table_name in array array['services','equipment','client_logos','testimonials','behind_scenes']
  loop
    execute format('drop policy if exists "public reads visible %1$s" on public.%1$I', table_name);
    execute format('create policy "public reads visible %1$s" on public.%1$I for select to anon using (visible)', table_name);
    execute format('drop policy if exists "authenticated reads %1$s" on public.%1$I', table_name);
    execute format('create policy "authenticated reads %1$s" on public.%1$I for select to authenticated using (visible or (select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins insert %1$s" on public.%1$I', table_name);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins update %1$s" on public.%1$I', table_name);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins delete %1$s" on public.%1$I', table_name);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))', table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['events','photographs']
  loop
    execute format('drop policy if exists "public reads published %1$s" on public.%1$I', table_name);
    execute format('create policy "public reads published %1$s" on public.%1$I for select to anon using (published)', table_name);
    execute format('drop policy if exists "authenticated reads %1$s" on public.%1$I', table_name);
    execute format('create policy "authenticated reads %1$s" on public.%1$I for select to authenticated using (published or (select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins insert %1$s" on public.%1$I', table_name);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins update %1$s" on public.%1$I', table_name);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
    execute format('drop policy if exists "admins delete %1$s" on public.%1$I', table_name);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))', table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['booking_requests','finance_entries','travel_estimates','ai_briefings']
  loop
    execute format('drop policy if exists "admins manage %1$s" on public.%1$I', table_name);
    execute format('create policy "admins manage %1$s" on public.%1$I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
  end loop;
end $$;

drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads for select to authenticated using ((select public.is_admin()));
drop policy if exists "admins update leads" on public.leads;
create policy "admins update leads" on public.leads for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete leads" on public.leads;
create policy "admins delete leads" on public.leads for delete to authenticated using ((select public.is_admin()));
-- Não existe INSERT anônimo em leads. A rota /api/contact usa service role exclusivamente no servidor.

revoke select on public.site_settings, public.projects from anon;
grant select (
  id, logo_url, hero_video_url, hero_mux_playback_id, hero_poster_url, showreel_url,
  about_image_url, team_image_url, cta_background_url, whatsapp, instagram, email,
  address, hero_title, hero_support, hero_description, about_text, footer_text, updated_at
) on public.site_settings to anon;
grant select (
  id, slug, title, client, category, year, format, description, full_description,
  services, credits, cover_url, video_url, mux_playback_id, orientation, aspect_ratio,
  focal_x, focal_y, featured, published, position, created_at, updated_at
) on public.projects to anon;
grant select on public.project_media, public.services, public.equipment, public.client_logos, public.testimonials, public.behind_scenes, public.events, public.photographs to anon;
grant select, insert, update, delete on public.site_settings, public.projects, public.project_media, public.services, public.equipment, public.client_logos, public.testimonials, public.behind_scenes, public.leads, public.events, public.photographs, public.booking_requests, public.finance_entries, public.travel_estimates, public.ai_briefings to authenticated;
grant select on public.admin_users to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 262144000, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads media" on storage.objects;
drop policy if exists "admins read media" on storage.objects;
create policy "admins read media" on storage.objects for select to authenticated using (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.is_admin())) with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));

insert into public.site_settings (id, whatsapp, instagram, email, address, hero_description, about_text)
values ('main', null, null, 'contato@aadesignmedia.com.br', 'São Paulo, SP', 'Produção audiovisual, fotografia e conteúdo para marcas que querem ser vistas, lembradas e sentidas.', 'Arthur e Alana conduzem a AA Design & Media do briefing à entrega, combinando direção, captação e pós-produção em uma operação próxima e feita sob medida.')
on conflict (id) do nothing;

insert into public.services (title, description, icon, position) values
('Produção audiovisual', 'Projetos completos, do conceito à entrega final.', 'Clapperboard', 0),
('Vídeos institucionais', 'Filmes que traduzem cultura, operação e propósito.', 'Building2', 1),
('Social Content e Reels', 'Conteúdo nativo para Instagram, TikTok e YouTube.', 'Smartphone', 2),
('Fotografia profissional', 'Campanhas, produtos, eventos e retratos com direção.', 'Camera', 3),
('Drone e FPV', 'Imagens aéreas e movimentos imersivos para ampliar a narrativa.', 'Plane', 4),
('Cobertura de eventos', 'Foto, vídeo, bastidores e entregas ágeis para o digital.', 'CalendarRange', 5),
('Documentários', 'Histórias conduzidas com escuta, pesquisa e linguagem cinematográfica.', 'Film', 6),
('Pós-produção', 'Edição, cor, tratamento de áudio e finalização multiformato.', 'SlidersHorizontal', 7)
on conflict do nothing;

insert into public.equipment (title, description, position) values
('Sony FX30', 'Cinema digital 4K 10-bit para captação principal.', 0),
('Tamron 17–70mm f/2.8', 'Versatilidade e consistência para produções em movimento.', 1),
('DJI Avata 360', 'Perspectivas FPV e movimentos aéreos imersivos.', 2),
('Luz, áudio e estabilização', 'Kit de produção adaptado a entrevistas, eventos e set.', 3)
on conflict do nothing;

insert into public.client_logos (name, position) values
('Terra Brasa', 0),
('Jockey Club de São Paulo', 1),
('Clínica Donia', 2),
('House Requinte', 3),
('JM Fibra', 4)
on conflict do nothing;

-- Após criar o primeiro usuário em Authentication > Users, promova-o manualmente:
-- insert into public.admin_users (id) values ('UUID-DO-USUARIO');
