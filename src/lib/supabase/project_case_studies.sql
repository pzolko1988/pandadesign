-- =========================================================
-- PandaDesign – Részletes projektoldalak / esettanulmányok
-- =========================================================

alter table public.projects
  add column if not exists client_name text not null default '';

alter table public.projects
  add column if not exists location text not null default '';

alter table public.projects
  add column if not exists completed_year text not null default '';

alter table public.projects
  add column if not exists duration_label text not null default '';

alter table public.projects
  add column if not exists challenge text not null default '';

alter table public.projects
  add column if not exists solution text not null default '';

alter table public.projects
  add column if not exists results text[] not null default '{}';

alter table public.projects
  add column if not exists services text[] not null default '{}';

alter table public.projects
  add column if not exists technologies text[] not null default '{}';

alter table public.projects
  add column if not exists content_html text not null default '<p></p>';

alter table public.projects
  add column if not exists content_json jsonb not null default
    '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb;

alter table public.projects
  add column if not exists gallery_paths text[] not null default '{}';

alter table public.projects
  add column if not exists seo_title text not null default '';

alter table public.projects
  add column if not exists seo_description text not null default '';

alter table public.projects
  add column if not exists cta_title text not null default
    'Hasonló weboldalra van szükséged?';

alter table public.projects
  add column if not exists cta_text text not null default
    'Beszéljük át az elképzelésedet egy díjmentes konzultáción.';

alter table public.projects
  add column if not exists cta_button_text text not null default
    'Ajánlatot kérek';

alter table public.projects
  add column if not exists created_at timestamptz not null default now();

alter table public.projects
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists projects_slug_unique_idx
  on public.projects (lower(slug));

create index if not exists projects_visible_sort_idx
  on public.projects (is_visible, sort_order);

-- =========================================================
-- Automatikus updated_at
-- =========================================================

create or replace function public.update_project_updated_at()
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

drop trigger if exists set_project_updated_at
  on public.projects;

create trigger set_project_updated_at
before update on public.projects
for each row
execute function public.update_project_updated_at();

-- =========================================================
-- Jogosultságok
-- =========================================================

alter table public.projects enable row level security;

grant select
  on table public.projects
  to anon;

grant select, insert, update, delete
  on table public.projects
  to authenticated;

drop policy if exists "Public can read visible projects v2"
  on public.projects;

create policy "Public can read visible projects v2"
on public.projects
for select
to anon
using (is_visible = true);

drop policy if exists "Admins can read all projects v2"
  on public.projects;

create policy "Admins can read all projects v2"
on public.projects
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert projects v2"
  on public.projects;

create policy "Admins can insert projects v2"
on public.projects
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update projects v2"
  on public.projects;

create policy "Admins can update projects v2"
on public.projects
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete projects v2"
  on public.projects;

create policy "Admins can delete projects v2"
on public.projects
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Portfolio Storage
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio',
  'portfolio',
  true,
  8388608,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read portfolio media v2"
  on storage.objects;

create policy "Public can read portfolio media v2"
on storage.objects
for select
to public
using (bucket_id = 'portfolio');

drop policy if exists "Admins can upload portfolio media v2"
  on storage.objects;

create policy "Admins can upload portfolio media v2"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio'
  and public.is_admin()
);

drop policy if exists "Admins can update portfolio media v2"
  on storage.objects;

create policy "Admins can update portfolio media v2"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio'
  and public.is_admin()
)
with check (
  bucket_id = 'portfolio'
  and public.is_admin()
);

drop policy if exists "Admins can delete portfolio media v2"
  on storage.objects;

create policy "Admins can delete portfolio media v2"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio'
  and public.is_admin()
);

-- A korábbi alapértelmezett /referenciak érték nem külső projektlink.
update public.projects
set project_url = ''
where project_url = '/referenciak';

select
  id,
  slug,
  title,
  client_name,
  is_visible,
  updated_at
from public.projects
order by sort_order asc;
