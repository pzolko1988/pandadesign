-- =========================================================
-- PandaDesign – GYIK elemek
-- =========================================================

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),

  question text not null
    check (char_length(trim(question)) >= 3),

  answer text not null
    check (char_length(trim(answer)) >= 3),

  sort_order integer not null default 0
    check (sort_order >= 0),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gyorsabb rendezett lekérdezéshez
create index if not exists faq_items_sort_order_idx
  on public.faq_items (sort_order);

-- Gyorsabb publikus lekérdezéshez
create index if not exists faq_items_active_sort_idx
  on public.faq_items (is_active, sort_order);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_faq_item_updated_at()
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

drop trigger if exists set_faq_item_updated_at
  on public.faq_items;

create trigger set_faq_item_updated_at
before update on public.faq_items
for each row
execute function public.update_faq_item_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.faq_items enable row level security;

-- A látogatók csak az aktív elemeket olvashatják
drop policy if exists "Public can read active FAQ items"
  on public.faq_items;

create policy "Public can read active FAQ items"
on public.faq_items
for select
to anon
using (is_active = true);

-- A bejelentkezett admin minden elemet láthat
drop policy if exists "Authenticated users can read FAQ items"
  on public.faq_items;

create policy "Authenticated users can read FAQ items"
on public.faq_items
for select
to authenticated
using (true);

-- Új elem létrehozása
drop policy if exists "Authenticated users can insert FAQ items"
  on public.faq_items;

create policy "Authenticated users can insert FAQ items"
on public.faq_items
for insert
to authenticated
with check (true);

-- Elem módosítása
drop policy if exists "Authenticated users can update FAQ items"
  on public.faq_items;

create policy "Authenticated users can update FAQ items"
on public.faq_items
for update
to authenticated
using (true)
with check (true);

-- Elem törlése
drop policy if exists "Authenticated users can delete FAQ items"
  on public.faq_items;

create policy "Authenticated users can delete FAQ items"
on public.faq_items
for delete
to authenticated
using (true);

-- =========================================================
-- Alapértelmezett GYIK-elemek
-- Csak akkor fut le, ha a tábla még üres
-- =========================================================

insert into public.faq_items (
  question,
  answer,
  sort_order,
  is_active
)
select
  seed.question,
  seed.answer,
  seed.sort_order,
  true
from (
  values
    (
      'Mennyi idő alatt készül el egy weboldal?',
      'Egy egyszerű bemutatkozó weboldal általában néhány hét alatt elkészül. Az összetettebb, egyedi funkciókat vagy adminisztrációs rendszert tartalmazó projektek hosszabb fejlesztési időt igényelhetnek.',
      10
    ),
    (
      'A weboldalt később én is tudom szerkeszteni?',
      'Igen. A szükséges tartalmakhoz könnyen kezelhető adminisztrációs felületet biztosítunk, amelyen keresztül programozói tudás nélkül módosíthatók a szövegek, képek és egyéb adatok.',
      20
    ),
    (
      'Mobiltelefonon is megfelelően fog működni?',
      'Igen. Minden weboldalt reszponzív módon készítünk el, így a megjelenés és a használhatóság mobiltelefonon, táblagépen és asztali számítógépen is megfelelő lesz.',
      30
    ),
    (
      'Vállaltok egyedi fejlesztéseket is?',
      'Igen. A bemutatkozó weboldalak mellett egyedi adminisztrációs felületek, foglalási rendszerek, ügyfélportálok és más üzleti funkciók fejlesztése is megoldható.',
      40
    ),
    (
      'Segítetek a tárhely és a domain beállításában?',
      'Igen. Igény esetén segítünk a megfelelő szolgáltatások kiválasztásában, valamint a domain, a tárhely, az SSL-tanúsítvány és az alapvető technikai beállítások elvégzésében.',
      50
    )
) as seed(question, answer, sort_order)
where not exists (
  select 1
  from public.faq_items
);

-- Ellenőrző lekérdezés
select
  id,
  question,
  sort_order,
  is_active,
  updated_at
from public.faq_items
order by sort_order asc;
