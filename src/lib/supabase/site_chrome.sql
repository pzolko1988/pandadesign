-- =========================================================
-- PandaDesign – Dinamikus fejléc és lábléc
-- =========================================================

create table if not exists public.site_chrome_settings (
  id smallint primary key default 1
    check (id = 1),

  announcement_text text not null default '',
  announcement_url text not null default '',
  announcement_visible boolean not null default false,

  header_cta_text text not null default 'Ajánlatot kérek',
  header_cta_url text not null default '/kapcsolat',
  header_cta_visible boolean not null default true,
  header_sticky boolean not null default true,

  footer_show_navigation boolean not null default true,
  footer_show_contact boolean not null default true,
  footer_show_social boolean not null default true,
  footer_show_back_to_top boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_navigation_items (
  id uuid primary key default gen_random_uuid(),

  label text not null
    check (char_length(trim(label)) between 1 and 80),

  url text not null
    check (char_length(trim(url)) between 1 and 500),

  placement text not null default 'both'
    check (
      placement in (
        'header',
        'footer',
        'both'
      )
    ),

  group_label text not null default 'Navigáció'
    check (char_length(group_label) <= 80),

  sort_order integer not null default 0
    check (sort_order >= 0),

  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_navigation_items_display_idx
  on public.site_navigation_items (
    is_visible,
    placement,
    sort_order
  );

-- =========================================================
-- Automatikus updated_at
-- =========================================================

create or replace function public.update_site_chrome_updated_at()
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

drop trigger if exists set_site_chrome_settings_updated_at
  on public.site_chrome_settings;

create trigger set_site_chrome_settings_updated_at
before update on public.site_chrome_settings
for each row
execute function public.update_site_chrome_updated_at();

drop trigger if exists set_site_navigation_item_updated_at
  on public.site_navigation_items;

create trigger set_site_navigation_item_updated_at
before update on public.site_navigation_items
for each row
execute function public.update_site_chrome_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.site_chrome_settings
  enable row level security;

alter table public.site_navigation_items
  enable row level security;

grant select
  on table public.site_chrome_settings
  to anon, authenticated;

grant select
  on table public.site_navigation_items
  to anon, authenticated;

grant insert, update, delete
  on table public.site_navigation_items
  to authenticated;

grant insert, update
  on table public.site_chrome_settings
  to authenticated;

drop policy if exists "Public can read site chrome settings"
  on public.site_chrome_settings;

create policy "Public can read site chrome settings"
on public.site_chrome_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert site chrome settings"
  on public.site_chrome_settings;

create policy "Admins can insert site chrome settings"
on public.site_chrome_settings
for insert
to authenticated
with check (
  public.is_admin()
  and id = 1
);

drop policy if exists "Admins can update site chrome settings"
  on public.site_chrome_settings;

create policy "Admins can update site chrome settings"
on public.site_chrome_settings
for update
to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and id = 1
);

drop policy if exists "Public can read visible navigation items"
  on public.site_navigation_items;

create policy "Public can read visible navigation items"
on public.site_navigation_items
for select
to anon, authenticated
using (
  is_visible = true
  or public.is_admin()
);

drop policy if exists "Admins can insert navigation items"
  on public.site_navigation_items;

create policy "Admins can insert navigation items"
on public.site_navigation_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update navigation items"
  on public.site_navigation_items;

create policy "Admins can update navigation items"
on public.site_navigation_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete navigation items"
  on public.site_navigation_items;

create policy "Admins can delete navigation items"
on public.site_navigation_items
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Alapértelmezett beállítások
-- =========================================================

insert into public.site_chrome_settings (
  id,
  announcement_text,
  announcement_url,
  announcement_visible,
  header_cta_text,
  header_cta_url,
  header_cta_visible,
  header_sticky,
  footer_show_navigation,
  footer_show_contact,
  footer_show_social,
  footer_show_back_to_top
)
values (
  1,
  '',
  '',
  false,
  'Ajánlatot kérek',
  '/kapcsolat',
  true,
  true,
  true,
  true,
  true,
  true
)
on conflict (id) do nothing;

insert into public.site_navigation_items (
  label,
  url,
  placement,
  group_label,
  sort_order,
  is_visible,
  open_in_new_tab
)
select
  seed.label,
  seed.url,
  seed.placement,
  seed.group_label,
  seed.sort_order,
  true,
  false
from (
  values
    ('Főoldal', '/', 'both', 'Navigáció', 10),
    ('Szolgáltatások', '/szolgaltatasok', 'both', 'Navigáció', 20),
    ('Árak', '/arak', 'both', 'Navigáció', 30),
    ('Referenciák', '/referenciak', 'both', 'Navigáció', 40),
    ('Blog', '/blog', 'both', 'Navigáció', 50),
    ('Rólunk', '/rolunk', 'both', 'Navigáció', 60),
    ('Kapcsolat', '/kapcsolat', 'both', 'Navigáció', 70),
    ('Adatkezelés', '/adatkezeles', 'footer', 'Jogi információk', 110),
    ('Általános Szerződési Feltételek', '/aszf', 'footer', 'Jogi információk', 120),
    ('Cookie-tájékoztató', '/cookie', 'footer', 'Jogi információk', 130)
) as seed(
  label,
  url,
  placement,
  group_label,
  sort_order
)
where not exists (
  select 1
  from public.site_navigation_items
);

select
  id,
  announcement_visible,
  header_cta_visible,
  header_sticky,
  updated_at
from public.site_chrome_settings;

select
  id,
  label,
  url,
  placement,
  group_label,
  sort_order,
  is_visible
from public.site_navigation_items
order by sort_order asc;
