-- =========================================================
-- PandaDesign – Záró CTA szekció
-- =========================================================

create table if not exists public.final_cta_settings (
  id smallint primary key default 1
    check (id = 1),

  badge_text text not null default 'Ingyenes konzultáció',

  title text not null default 'Készen állsz egy jobb weboldalra?'
    check (char_length(trim(title)) >= 3),

  description text not null default
    'Beszéljük át az elképzelésedet egy kötelezettségmentes konzultáción.',

  button_text text not null default 'Ajánlatot kérek'
    check (char_length(trim(button_text)) >= 2),

  button_url text not null default '/kapcsolat',

  icon_key text not null default 'users',

  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_final_cta_updated_at()
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

drop trigger if exists set_final_cta_updated_at
  on public.final_cta_settings;

create trigger set_final_cta_updated_at
before update on public.final_cta_settings
for each row
execute function public.update_final_cta_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.final_cta_settings enable row level security;

drop policy if exists "Public can read visible final CTA"
  on public.final_cta_settings;

create policy "Public can read visible final CTA"
on public.final_cta_settings
for select
to anon
using (is_visible = true);

drop policy if exists "Admins can read final CTA"
  on public.final_cta_settings;

create policy "Admins can read final CTA"
on public.final_cta_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert final CTA"
  on public.final_cta_settings;

create policy "Admins can insert final CTA"
on public.final_cta_settings
for insert
to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can update final CTA"
  on public.final_cta_settings;

create policy "Admins can update final CTA"
on public.final_cta_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and id = 1);

-- =========================================================
-- Alapértelmezett tartalom
-- =========================================================

insert into public.final_cta_settings (
  id,
  badge_text,
  title,
  description,
  button_text,
  button_url,
  icon_key,
  is_visible
)
values (
  1,
  'Ingyenes konzultáció',
  'Készen állsz egy jobb weboldalra?',
  'Beszéljük át az elképzelésedet egy kötelezettségmentes konzultáción.',
  'Ajánlatot kérek',
  '/kapcsolat',
  'users',
  true
)
on conflict (id) do nothing;

select
  id,
  badge_text,
  title,
  description,
  button_text,
  button_url,
  icon_key,
  is_visible,
  updated_at
from public.final_cta_settings;
