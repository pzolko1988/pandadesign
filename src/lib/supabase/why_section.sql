-- =========================================================
-- PandaDesign – „Miért a PandaDesign?” szekció
-- =========================================================

create table if not exists public.why_section_settings (
  id smallint primary key default 1
    check (id = 1),

  eyebrow text not null default 'Miért mi',
  title text not null default 'Miért a PandaDesign?',
  description text not null default '',
  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.why_items (
  id uuid primary key default gen_random_uuid(),

  title text not null
    check (char_length(trim(title)) >= 2),

  description text not null default '',

  icon_key text not null default 'check',

  sort_order integer not null default 0
    check (sort_order >= 0),

  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists why_items_visible_sort_idx
  on public.why_items (is_visible, sort_order);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_why_updated_at()
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

drop trigger if exists set_why_section_settings_updated_at
  on public.why_section_settings;

create trigger set_why_section_settings_updated_at
before update on public.why_section_settings
for each row
execute function public.update_why_updated_at();

drop trigger if exists set_why_item_updated_at
  on public.why_items;

create trigger set_why_item_updated_at
before update on public.why_items
for each row
execute function public.update_why_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.why_section_settings enable row level security;
alter table public.why_items enable row level security;

-- Publikus olvasás
drop policy if exists "Public can read visible why settings"
  on public.why_section_settings;

create policy "Public can read visible why settings"
on public.why_section_settings
for select
to anon
using (is_visible = true);

drop policy if exists "Public can read visible why items"
  on public.why_items;

create policy "Public can read visible why items"
on public.why_items
for select
to anon
using (is_visible = true);

-- Admin olvasás
drop policy if exists "Admins can read why settings"
  on public.why_section_settings;

create policy "Admins can read why settings"
on public.why_section_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read why items"
  on public.why_items;

create policy "Admins can read why items"
on public.why_items
for select
to authenticated
using (public.is_admin());

-- Admin létrehozás
drop policy if exists "Admins can insert why settings"
  on public.why_section_settings;

create policy "Admins can insert why settings"
on public.why_section_settings
for insert
to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can insert why items"
  on public.why_items;

create policy "Admins can insert why items"
on public.why_items
for insert
to authenticated
with check (public.is_admin());

-- Admin módosítás
drop policy if exists "Admins can update why settings"
  on public.why_section_settings;

create policy "Admins can update why settings"
on public.why_section_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can update why items"
  on public.why_items;

create policy "Admins can update why items"
on public.why_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admin törlés
drop policy if exists "Admins can delete why items"
  on public.why_items;

create policy "Admins can delete why items"
on public.why_items
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Alapértelmezett tartalom
-- =========================================================

insert into public.why_section_settings (
  id,
  eyebrow,
  title,
  description,
  is_visible
)
values (
  1,
  'Miért mi',
  'Miért a PandaDesign?',
  'Modern, gyors és üzletileg átgondolt weboldalakat készítünk, amelyek nemcsak jól néznek ki, hanem támogatják a vállalkozásod növekedését is.',
  true
)
on conflict (id) do nothing;

insert into public.why_items (
  title,
  description,
  icon_key,
  sort_order,
  is_visible
)
select
  seed.title,
  seed.description,
  seed.icon_key,
  seed.sort_order,
  true
from (
  values
    (
      'Egyedi, modern megjelenés',
      'Nem sablonos megoldást kapsz: a vizuális rendszer a vállalkozásodhoz és célközönségedhez igazodik.',
      'sparkles',
      10
    ),
    (
      'Gyors és átlátható munkafolyamat',
      'Minden szakaszban pontosan látod, hol tart a projekt és mi következik.',
      'zap',
      20
    ),
    (
      'Mobilra optimalizált kialakítás',
      'A weboldal telefonon, táblagépen és asztali gépen is átlátható és könnyen használható.',
      'smartphone',
      30
    ),
    (
      'Könnyen kezelhető adminfelület',
      'A fontos tartalmakat programozói tudás nélkül is módosíthatod.',
      'settings',
      40
    ),
    (
      'Magyar nyelvű támogatás',
      'Közérthetően kommunikálunk, és nem hagyunk magadra technikai kérdésekkel.',
      'message-square',
      50
    ),
    (
      'Hosszú távú együttműködés',
      'Az átadás után is számíthatsz ránk karbantartásban, fejlesztésben és bővítésben.',
      'refresh',
      60
    )
) as seed(title, description, icon_key, sort_order)
where not exists (
  select 1
  from public.why_items
);

select
  id,
  eyebrow,
  title,
  description,
  is_visible,
  updated_at
from public.why_section_settings;

select
  id,
  title,
  description,
  icon_key,
  sort_order,
  is_visible,
  updated_at
from public.why_items
order by sort_order asc;
