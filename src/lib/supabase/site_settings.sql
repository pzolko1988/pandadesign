-- =========================================================
-- PandaDesign – Általános weboldal-beállítások
-- =========================================================

create table if not exists public.site_settings (
  id smallint primary key default 1
    check (id = 1),

  site_name text not null default 'PandaDesign',
  legal_name text not null default '',
  tagline text not null default '',

  email text not null default '',
  phone text not null default '',
  contact_recipient_email text not null default '',

  address_line text not null default '',
  postal_code text not null default '',
  city text not null default '',
  country text not null default 'Magyarország',
  opening_hours text not null default '',

  facebook_url text not null default '',
  instagram_url text not null default '',
  linkedin_url text not null default '',

  base_url text not null default 'https://pandadesign.hu',
  default_meta_title text not null default
    'PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek',
  default_meta_description text not null default
    'Gyors, mobilbarát és átlátható weboldalakat készítünk magyar vállalkozásoknak – az első ötlettől a hosszú távú üzemeltetésig.',

  logo_path text,
  favicon_path text,
  og_image_path text,

  footer_text text not null default '',
  copyright_text text not null default
    'Minden jog fenntartva.',

  show_contact_details boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_site_settings_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_settings_updated_at
  on public.site_settings;

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.update_site_settings_updated_at();

-- =========================================================
-- Row Level Security – beállítások
-- =========================================================

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings"
  on public.site_settings;

create policy "Public can read site settings"
on public.site_settings
for select
to anon
using (true);

drop policy if exists "Admins can read site settings"
  on public.site_settings;

create policy "Admins can read site settings"
on public.site_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert site settings"
  on public.site_settings;

create policy "Admins can insert site settings"
on public.site_settings
for insert
to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can update site settings"
  on public.site_settings;

create policy "Admins can update site settings"
on public.site_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and id = 1);

-- =========================================================
-- Supabase Storage – logó, favicon és közösségi kép
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site assets"
  on storage.objects;

create policy "Public can read site assets"
on storage.objects
for select
to public
using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site assets"
  on storage.objects;

create policy "Admins can upload site assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and public.is_admin()
);

drop policy if exists "Admins can update site assets"
  on storage.objects;

create policy "Admins can update site assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'site-assets'
  and public.is_admin()
);

drop policy if exists "Admins can delete site assets"
  on storage.objects;

create policy "Admins can delete site assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and public.is_admin()
);

-- =========================================================
-- Alapértelmezett beállítások
-- =========================================================

insert into public.site_settings (
  id,
  site_name,
  legal_name,
  tagline,
  email,
  phone,
  contact_recipient_email,
  address_line,
  postal_code,
  city,
  country,
  opening_hours,
  facebook_url,
  instagram_url,
  linkedin_url,
  base_url,
  default_meta_title,
  default_meta_description,
  footer_text,
  copyright_text,
  show_contact_details
)
values (
  1,
  'PandaDesign',
  '',
  'Modern weboldalak magyar vállalkozásoknak',
  '',
  '',
  '',
  '',
  '',
  '',
  'Magyarország',
  '',
  '',
  '',
  '',
  'https://pandadesign.hu',
  'PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek',
  'Gyors, mobilbarát és átlátható weboldalakat készítünk magyar vállalkozásoknak – az első ötlettől a hosszú távú üzemeltetésig.',
  'Modern, gyors és könnyen kezelhető weboldalak vállalkozásoknak.',
  'Minden jog fenntartva.',
  true
)
on conflict (id) do nothing;

select
  id,
  site_name,
  legal_name,
  tagline,
  email,
  phone,
  contact_recipient_email,
  address_line,
  postal_code,
  city,
  country,
  opening_hours,
  facebook_url,
  instagram_url,
  linkedin_url,
  base_url,
  default_meta_title,
  default_meta_description,
  logo_path,
  favicon_path,
  og_image_path,
  footer_text,
  copyright_text,
  show_contact_details,
  updated_at
from public.site_settings;
