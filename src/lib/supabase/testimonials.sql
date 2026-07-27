-- =========================================================
-- PandaDesign – Ügyfélvélemények
-- =========================================================

create table if not exists public.testimonial_section_settings (
  id smallint primary key default 1
    check (id = 1),

  eyebrow text not null default 'Vélemények',
  title text not null default 'Ügyfeleink véleménye',
  description text not null default '',
  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(trim(name)) >= 2),

  role text not null default '',

  testimonial_text text not null
    check (char_length(trim(testimonial_text)) >= 10),

  rating smallint not null default 5
    check (rating between 1 and 5),

  is_sample boolean not null default false,

  sort_order integer not null default 0
    check (sort_order >= 0),

  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_visible_sort_idx
  on public.testimonials (is_visible, sort_order);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_testimonials_updated_at()
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

drop trigger if exists set_testimonial_section_settings_updated_at
  on public.testimonial_section_settings;

create trigger set_testimonial_section_settings_updated_at
before update on public.testimonial_section_settings
for each row
execute function public.update_testimonials_updated_at();

drop trigger if exists set_testimonial_updated_at
  on public.testimonials;

create trigger set_testimonial_updated_at
before update on public.testimonials
for each row
execute function public.update_testimonials_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.testimonial_section_settings enable row level security;
alter table public.testimonials enable row level security;

-- Publikus olvasás
drop policy if exists "Public can read visible testimonial settings"
  on public.testimonial_section_settings;

create policy "Public can read visible testimonial settings"
on public.testimonial_section_settings
for select
to anon
using (is_visible = true);

drop policy if exists "Public can read visible testimonials"
  on public.testimonials;

create policy "Public can read visible testimonials"
on public.testimonials
for select
to anon
using (is_visible = true);

-- Admin olvasás
drop policy if exists "Admins can read testimonial settings"
  on public.testimonial_section_settings;

create policy "Admins can read testimonial settings"
on public.testimonial_section_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read testimonials"
  on public.testimonials;

create policy "Admins can read testimonials"
on public.testimonials
for select
to authenticated
using (public.is_admin());

-- Admin létrehozás
drop policy if exists "Admins can insert testimonial settings"
  on public.testimonial_section_settings;

create policy "Admins can insert testimonial settings"
on public.testimonial_section_settings
for insert
to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can insert testimonials"
  on public.testimonials;

create policy "Admins can insert testimonials"
on public.testimonials
for insert
to authenticated
with check (public.is_admin());

-- Admin módosítás
drop policy if exists "Admins can update testimonial settings"
  on public.testimonial_section_settings;

create policy "Admins can update testimonial settings"
on public.testimonial_section_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and id = 1);

drop policy if exists "Admins can update testimonials"
  on public.testimonials;

create policy "Admins can update testimonials"
on public.testimonials
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admin törlés
drop policy if exists "Admins can delete testimonials"
  on public.testimonials;

create policy "Admins can delete testimonials"
on public.testimonials
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Alapértelmezett tartalom
-- =========================================================

insert into public.testimonial_section_settings (
  id,
  eyebrow,
  title,
  description,
  is_visible
)
values (
  1,
  'Vélemények',
  'Ügyfeleink véleménye',
  'Az alábbi vélemények minta tartalmak, élesítés előtt valós visszajelzésekkel cseréljük.',
  true
)
on conflict (id) do nothing;

insert into public.testimonials (
  name,
  role,
  testimonial_text,
  rating,
  is_sample,
  sort_order,
  is_visible
)
select
  seed.name,
  seed.role,
  seed.testimonial_text,
  seed.rating,
  true,
  seed.sort_order,
  true
from (
  values
    (
      'Kovács Anna',
      'Ügyvezető, minta vállalkozás',
      'A PandaDesign csapata figyelmes és profi volt, az új weboldalunk sokkal áttekinthetőbb lett, és több érdeklődő is érkezik rajta keresztül.',
      5,
      10
    ),
    (
      'Nagy Péter',
      'Tulajdonos, minta étterem',
      'Gyorsan, világosan kommunikáltak, és a menünk mostantól mobilon is jól kezelhető. Az online foglalás bevezetése óta több a vendégünk.',
      5,
      20
    ),
    (
      'Szabó Eszter',
      'Marketingvezető, minta cég',
      'A projekt minden szakaszában tudtuk, hol tartunk. Az új oldal gyors, letisztult, és könnyen tudjuk mi magunk is szerkeszteni.',
      5,
      30
    )
) as seed(
  name,
  role,
  testimonial_text,
  rating,
  sort_order
)
where not exists (
  select 1
  from public.testimonials
);

select
  id,
  eyebrow,
  title,
  description,
  is_visible,
  updated_at
from public.testimonial_section_settings;

select
  id,
  name,
  role,
  testimonial_text,
  rating,
  is_sample,
  sort_order,
  is_visible,
  updated_at
from public.testimonials
order by sort_order asc;
