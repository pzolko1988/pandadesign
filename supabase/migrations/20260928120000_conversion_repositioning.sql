-- =========================================================
-- PandaDesign – konverziós újrapozicionálás (2026-09-28)
--
-- 1. Séma-bővítések (visszafelé kompatibilis, csak új oszlopok)
-- 2. Ingyenes weboldal-audit beküldő RPC
-- 3. CMS-tartalmak frissítése az új pozicionálásra
--
-- Futtatás: Supabase Dashboard → SQL Editor, vagy `supabase db push`.
-- Többször futtatható (idempotens).
--
-- NEM tartalmaz kitalált ügyfélnevet, véleményt, eredményt vagy számadatot.
-- =========================================================

begin;

-- ---------------------------------------------------------
-- 1. SÉMA
-- ---------------------------------------------------------

alter table public.pricing_packages
  add column if not exists audience text not null default '',
  add column if not exists outcome text not null default '',
  add column if not exists scope_note text not null default '';

alter table public.services
  add column if not exists audience text not null default '',
  add column if not exists highlights jsonb not null default '[]'::jsonb,
  add column if not exists technology text not null default '';

alter table public.projects
  add column if not exists mobile_image_path text,
  add column if not exists features jsonb not null default '[]'::jsonb;

-- Csak az adminban kifejezetten "igazolt"-nak jelölt vélemény jelenhet meg.
alter table public.testimonials
  add column if not exists is_verified boolean not null default false;

alter table public.faq_items
  add column if not exists category text not null default 'general';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'faq_items_category_check'
  ) then
    alter table public.faq_items
      add constraint faq_items_category_check
      check (category in ('general', 'pricing'));
  end if;
end;
$$;

alter table public.contact_leads
  add column if not exists website_url text not null default '';

-- ---------------------------------------------------------
-- 2. INGYENES WEBOLDAL-AUDIT RPC
-- ---------------------------------------------------------

create or replace function public.submit_audit_request(
  p_name text,
  p_email text,
  p_phone text default '',
  p_company text default '',
  p_website_url text default '',
  p_help_topic text default '',
  p_note text default '',
  p_privacy_accepted boolean default false,
  p_marketing_consent boolean default false,
  p_source_page text default '/ingyenes-weboldal-audit',
  p_referrer text default '',
  p_utm_source text default '',
  p_utm_medium text default '',
  p_utm_campaign text default '',
  p_utm_content text default '',
  p_utm_term text default '',
  p_user_agent text default '',
  p_website text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := trim(coalesce(p_phone, ''));
  v_company text := trim(coalesce(p_company, ''));
  v_website_url text := trim(coalesce(p_website_url, ''));
  v_help_topic text := trim(coalesce(p_help_topic, ''));
  v_note text := trim(coalesce(p_note, ''));
  v_message text;
  v_id uuid;
begin
  -- Honeypot mező: robotok töltik ki.
  if trim(coalesce(p_website, '')) <> '' then
    raise exception 'A beküldés nem fogadható el.';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'A név hossza nem megfelelő.';
  end if;

  if char_length(v_email) < 5
     or char_length(v_email) > 254
     or v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'Az e-mail-cím formátuma nem megfelelő.';
  end if;

  if char_length(v_phone) > 30 then
    raise exception 'A telefonszám túl hosszú.';
  end if;

  if char_length(v_company) < 2 or char_length(v_company) > 160 then
    raise exception 'A vállalkozás nevének hossza nem megfelelő.';
  end if;

  if char_length(v_website_url) > 500
     or v_website_url !~* '^https?://[^\s/$.?#][^\s]*\.[^\s]+$' then
    raise exception 'A weboldal címe nem megfelelő.';
  end if;

  if char_length(v_help_topic) < 2 or char_length(v_help_topic) > 120 then
    raise exception 'Kérjük, válaszd ki, miben kérsz segítséget.';
  end if;

  if char_length(v_note) > 2000 then
    raise exception 'A megjegyzés túl hosszú.';
  end if;

  if not coalesce(p_privacy_accepted, false) then
    raise exception 'Az adatkezelési tájékoztató elfogadása kötelező.';
  end if;

  -- Egyszerű rate limit: azonos e-mail-címről 60 másodpercen belül egy kérés.
  if exists (
    select 1
    from public.contact_leads
    where lower(email) = v_email
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Kérjük, várj egy percet az újabb beküldés előtt.';
  end if;

  v_message := concat_ws(
    E'\n',
    'Ingyenes weboldal-audit kérés',
    'Weboldal: ' || v_website_url,
    'Miben kér segítséget: ' || v_help_topic,
    case when v_note <> '' then 'Megjegyzés: ' || v_note end
  );

  insert into public.contact_leads (
    name,
    email,
    phone,
    company,
    service_type,
    budget_range,
    message,
    website_url,
    privacy_accepted,
    privacy_accepted_at,
    privacy_policy_version,
    marketing_consent,
    marketing_consent_at,
    source_page,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    user_agent
  )
  values (
    v_name,
    v_email,
    v_phone,
    v_company,
    'Ingyenes weboldal-audit',
    'Nem releváns',
    v_message,
    v_website_url,
    true,
    now(),
    '2026-09-28',
    coalesce(p_marketing_consent, false),
    case when coalesce(p_marketing_consent, false) then now() else null end,
    left(trim(coalesce(p_source_page, '/ingyenes-weboldal-audit')), 500),
    left(trim(coalesce(p_referrer, '')), 1000),
    left(trim(coalesce(p_utm_source, '')), 250),
    left(trim(coalesce(p_utm_medium, '')), 250),
    left(trim(coalesce(p_utm_campaign, '')), 250),
    left(trim(coalesce(p_utm_content, '')), 250),
    left(trim(coalesce(p_utm_term, '')), 250),
    left(trim(coalesce(p_user_agent, '')), 1000)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_audit_request(
  text, text, text, text, text, text, text, boolean, boolean,
  text, text, text, text, text, text, text, text, text
) from public;

grant execute on function public.submit_audit_request(
  text, text, text, text, text, text, text, boolean, boolean,
  text, text, text, text, text, text, text, text, text
) to anon, authenticated;

-- ---------------------------------------------------------
-- 3. TARTALOM
-- ---------------------------------------------------------

-- 3.1 Hero (version: 2 → a frontend csak ezt a változatot fogadja el)
update public.page_sections
set content = jsonb_build_object(
      'version', 2,
      'eyebrow', 'Weboldal készítés vállalkozásoknak',
      'title', 'Ügyfélszerző weboldalak magyar vállalkozásoknak',
      'description', 'Nem csak szép weboldalt kapsz. Olyan gyors, mérhető és továbbfejleszthető online rendszert építünk, amely érdeklődőket szerez és támogatja a vállalkozásod növekedését.',
      'primaryButtonText', 'Ingyenes weboldal-audit',
      'primaryButtonUrl', '/ingyenes-weboldal-audit',
      'secondaryButtonText', 'Munkáink megtekintése',
      'secondaryButtonUrl', '/referenciak'
    ),
    updated_at = now()
where page_slug = 'home' and section_key = 'hero';

-- 3.2 Szolgáltatások – üzleti probléma szerint
update public.services
set is_visible = false, updated_at = now()
where slug in (
  'ceges-weboldalak',
  'landing-oldalak',
  'webshopok',
  'ujratervezes',
  'wordpress-karbantartas',
  'egyedi-fejlesztes'
);

with new_services (slug, title, description, audience, highlights, technology, icon_key, link_url, sort_order) as (
  values
    ('ugyfelszerzo-weboldal', 'Ügyfélszerző weboldal',
     'Céges weboldal, amely bizalmat épít, és egyértelmű utat ad az ajánlatkéréshez.',
     'Szolgáltató vállalkozásoknak',
     '["Bizalomépítés","Ajánlatkérés","Kapcsolatfelvétel","SEO-alapok","Mérhetőség"]'::jsonb,
     'Egyedi fejlesztés vagy WordPress – a projekt igényei alapján választunk.',
     'layers', '/ceges-weboldal-keszites', 10),
    ('landing-kampanyoldal', 'Landing / kampányoldal',
     'Egyetlen ajánlatra fókuszáló oldal, amelyből a hirdetésre kattintó látogató érdeklődő lesz.',
     'Google Ads, Meta Ads és célzott kampányokhoz',
     '["Egyetlen ajánlat","Erős CTA","Mérhető konverzió"]'::jsonb,
     'Gyors betöltésre optimalizált, könnyű felépítés.',
     'sparkles', '/landing-oldal-keszites', 20),
    ('webshop', 'Webshop',
     'Webáruház termékkatalógussal, fizetéssel és átlátható rendeléskezeléssel.',
     'Online értékesítéshez',
     '["Termékértékesítés","Checkout","Fizetés","Rendeléskezelés","Mérhetőség"]'::jsonb,
     'WooCommerce vagy egyedi megoldás – a termékkör és a folyamatok alapján.',
     'shopping-bag', '/webshop-keszites', 30),
    ('egyedi-uzleti-rendszer', 'Egyedi üzleti rendszer',
     'Webes rendszer a saját folyamataidra: kevesebb kézi munka, átláthatóbb működés.',
     'Ha a megszokott eszközök már szűknek bizonyulnak',
     '["CRM","Ügyfélportál","Admin felület","Ajánlatkezelés","Workflow és automatizáció","Belső üzleti rendszer"]'::jsonb,
     'Modern webes stack, adatbázissal és jogosultságkezeléssel.',
     'code', '/webalkalmazas-fejlesztes', 40)
),
updated as (
  update public.services s
  set title = n.title,
      description = n.description,
      audience = n.audience,
      highlights = n.highlights,
      technology = n.technology,
      icon_key = n.icon_key,
      link_url = n.link_url,
      sort_order = n.sort_order,
      is_visible = true,
      updated_at = now()
  from new_services n
  where s.slug = n.slug
  returning s.slug
)
insert into public.services (slug, title, description, audience, highlights, technology, icon_key, link_url, sort_order, is_visible)
select n.slug, n.title, n.description, n.audience, n.highlights, n.technology, n.icon_key, n.link_url, n.sort_order, true
from new_services n
where n.slug not in (select slug from updated)
  and not exists (select 1 from public.services s where s.slug = n.slug);

-- 3.3 Árcsomagok – Basic / Medium helyett üzleti csomagnevek
update public.pricing_packages
set is_visible = false, is_featured = false, updated_at = now()
where slug in ('basic', 'medium', 'landing');

with new_packages (slug, name, description, audience, outcome, scope_note, price_label, currency, price_suffix, badge_text, cta_text, cta_url, features, sort_order, is_featured) as (
  values
    ('landing-sprint', 'Landing Sprint', 'Célzott kampányoldal / szolgáltatáslanding',
     'Ha egy konkrét szolgáltatást vagy kampányt szeretnél gyorsan, mérhetően elindítani.',
     'Egy fókuszált oldal, amely a hirdetési forgalmat ajánlatkéréssé alakítja.',
     'Egy oldal, egy ajánlat, egy fő konverziós cél.',
     '99 000', 'Ft', '-tól', '', 'Ajánlatot kérek', '/kapcsolat?csomag=landing-sprint',
     '["Egyoldalas, egy ajánlatra fókuszáló felépítés","Konverzióra tervezett szerkezet és CTA-k","Ajánlatkérő / kapcsolatfelvételi űrlap","Mobilra optimalizált kialakítás","SEO-alapok","Analitika és konverziómérés beállítása"]'::jsonb,
     10, false),
    ('ugyfelszerzo-web', 'Ügyfélszerző Web', 'Professzionális céges weboldal',
     'Szolgáltató vállalkozásoknak, akiknek a weboldal a fő bizalomépítő és ajánlatkérési csatorna.',
     'Céges weboldal, amely bemutat, bizalmat épít és érdeklődőket gyűjt.',
     'Többoldalas céges weboldal; a pontos oldalszámot és tartalmat az ajánlat rögzíti.',
     '199 000', 'Ft', '-tól', 'Ajánlott', 'Ajánlatot kérek', '/kapcsolat?csomag=ugyfelszerzo-web',
     '["Többoldalas céges weboldal","Szolgáltatásoldalak ajánlatkérő CTA-kkal","Kapcsolat- és ajánlatkérő űrlap","Mobilra optimalizált kialakítás","SEO-alapok","Analitika és konverziómérés","Süti-hozzájárulás kezelése","Könnyen kezelhető adminfelület","Betanítás és átadás"]'::jsonb,
     20, true),
    ('business-lead', 'Business / Lead', 'Komplexebb lead rendszer, több funkcióval',
     'Ha több szolgáltatásod, több érdeklődési utad van, és a beérkező megkereséseket rendszerben kezelnéd.',
     'Weboldal és lead-kezelő rendszer egyben: gyűjt, rendszerez és értesít.',
     'Az Ügyfélszerző Web tartalma, kiegészítve lead-kezeléssel és bővített méréssel.',
     '299 000', 'Ft', '-tól', '', 'Ajánlatot kérek', '/kapcsolat?csomag=business-lead',
     '["Az Ügyfélszerző Web minden eleme","Több ajánlatkérési út (pl. audit, kalkulátor, foglalás)","Beérkező megkeresések kezelése adminfelületen","E-mail-értesítés új érdeklődőről","Blog / tudástár modul","Bővített mérés: CTA- és űrlapesemények"]'::jsonb,
     30, false),
    ('webshop', 'Webshop', 'E-commerce rendszer',
     'Ha termékeket szeretnél online értékesíteni.',
     'Működő webáruház a termékkatalógustól a rendeléskezelésig.',
     'A termékszámot, a fizetési és szállítási módokat az ajánlat rögzíti.',
     '449 000', 'Ft', '-tól', '', 'Ajánlatot kérek', '/kapcsolat?csomag=webshop',
     '["Termékkatalógus","Kosár és checkout","Online fizetés integráció","Szállítási opciók","Rendeléskezelés","Analitika és konverziómérés","Webshop betanítás"]'::jsonb,
     40, false),
    ('egyedi-webapp', 'Egyedi Webapp', 'Személyre szabott ajánlat',
     'Ha CRM-re, ügyfélportálra, ajánlatkezelőre vagy belső rendszerre van szükséged.',
     'A saját folyamataidra szabott webes rendszer.',
     'Igényfelmérés után részletes, írásos ajánlatot adunk.',
     'Egyedi ajánlat', '', '', '', 'Egyeztetést kérek', '/kapcsolat?csomag=egyedi-webapp',
     '["Igényfelmérés és folyamattervezés","Egyedi adminfelület és jogosultságok","Integrációk és automatizációk","Továbbfejleszthető architektúra"]'::jsonb,
     50, false)
),
updated as (
  update public.pricing_packages p
  set name = n.name,
      description = n.description,
      audience = n.audience,
      outcome = n.outcome,
      scope_note = n.scope_note,
      price_label = n.price_label,
      currency = n.currency,
      price_suffix = n.price_suffix,
      badge_text = n.badge_text,
      cta_text = n.cta_text,
      cta_url = n.cta_url,
      features = n.features,
      sort_order = n.sort_order,
      is_featured = n.is_featured,
      is_visible = true,
      updated_at = now()
  from new_packages n
  where p.slug = n.slug
  returning p.slug
)
insert into public.pricing_packages (slug, name, description, audience, outcome, scope_note, price_label, currency, price_suffix, badge_text, cta_text, cta_url, features, sort_order, is_featured, is_visible)
select n.slug, n.name, n.description, n.audience, n.outcome, n.scope_note, n.price_label, n.currency, n.price_suffix, n.badge_text, n.cta_text, n.cta_url, n.features, n.sort_order, n.is_featured, true
from new_packages n
where n.slug not in (select slug from updated)
  and not exists (select 1 from public.pricing_packages p where p.slug = n.slug);

-- 3.4 Vélemények – a meglévő két bejegyzés szövege megegyezik a korábbi
-- minta tartalommal, ezért nem jelenhet meg. Igazolt vélemény az adminban
-- az "Igazolt, valós vélemény" jelöléssel tehető közzé.
update public.testimonials
set is_visible = false, updated_at = now()
where is_verified = false;

-- 3.4b Referencia – a "Fogorvosi rendelő" kiemelt képe egy generált
-- PandaDesign-oldal makett kitalált statisztikákkal és referenciákkal,
-- nem a projekt képernyőképe. Valódi képernyőkép feltöltéséig rejtve marad.
update public.projects
set is_visible = false
where slug = 'fogorvosi-rendelo'
  and image_path = 'f1c91ab0-0f89-4f76-8a7b-975e37edc0a7.png';

-- 3.4c Valódi referenciák – csak korábban ténylegesen elkészült,
-- ellenőrzött PandaDesign projektek. Nincs kitalált eredményszám.
update public.projects
set is_visible = false,
    updated_at = now()
where is_concept = true;

insert into public.projects (
  slug,
  title,
  industry,
  category,
  description,
  project_url,
  sort_order,
  is_concept,
  is_visible,
  client_name,
  location,
  completed_year,
  duration_label,
  challenge,
  solution,
  results,
  features,
  services,
  technologies,
  seo_title,
  seo_description,
  cta_title,
  cta_text,
  cta_button_text,
  status,
  published_at
)
values
  (
    'klimaflow',
    'KlímaFlow',
    'Klíma- és hőszivattyú-szolgáltatás',
    'Webapp / CRM',
    'Klímás vállalkozásokra szabott webes rendszer, amely az érdeklődéstől a felmérésen és ajánlaton át a munkáig és karbantartásig egy folyamatba rendezi az adatokat.',
    'https://klima-rendszer.hu',
    10,
    false,
    true,
    '',
    '',
    '2026',
    '',
    'Az érdeklődők, helyszíni felmérések, ajánlatok, munkák és karbantartások könnyen külön csatornákra szakadnak. A cél egyetlen követhető folyamat volt, amelyben ugyanaz az adat halad tovább a következő munkafázisba.',
    'Reszponzív webes rendszert készítettünk nyilvános ajánlatkéréssel, érdeklődőkezeléssel, felméréssel, ajánlatkészítéssel, utánkövetéssel, munkakezeléssel, karbantartási modullal, AI-segítséggel és vezetői áttekintéssel.',
    ARRAY[
      'Az érdeklődőből felmérés, ajánlat, munka, ügyfél és karbantartás követhető folyamatban kezelhető.',
      'A nyilvános ajánlatkérésből a rendszerben kezelhető érdeklődő lesz.',
      'A demó böngészőből, külön telepítés nélkül használható.'
    ]::text[],
    '["Érdeklődőkezelés","Helyszíni felmérések","Árajánlatkészítés","Utánkövetés","Munkák","Karbantartások","AI asszisztens","Vezetői dashboard"]'::jsonb,
    ARRAY['UX/UI tervezés','Frontend fejlesztés','Webapp fejlesztés','CRM folyamat','SEO és mérés']::text[],
    ARRAY['TanStack Start','React 19','TypeScript','Supabase','Cloudflare Workers','Resend']::text[],
    'KlímaFlow – webapp és CRM referencia | PandaDesign',
    'Klímás vállalkozásokra szabott webes rendszer érdeklődőkezeléssel, felméréssel, ajánlatokkal, munkákkal, karbantartással és AI-funkciókkal.',
    'Hasonló üzleti rendszert szeretnél?',
    'Nézzük meg, hogyan lehet a saját folyamataidat egy átlátható, továbbfejleszthető rendszerbe rendezni.',
    'Ingyenes weboldal-audit',
    'published',
    now()
  ),
  (
    'berbeadva',
    'Bérbeadva',
    '',
    'Weboldal',
    'Valós PandaDesign referencia: a Bérbeadva projekt élő, publikus weboldala.',
    'https://berbeadva.hu',
    20,
    false,
    true,
    '',
    '',
    '2026',
    '',
    'A feladat egy valódi, nyilvánosan elérhető Bérbeadva webes projekt elkészítése és átadása volt.',
    'A projekt működő, publikus weboldalként érhető el a berbeadva.hu címen. A részletes funkciólistát csak ellenőrzött projektadat alapján bővítjük.',
    ARRAY[
      'Élő, nyilvánosan elérhető projekt a berbeadva.hu címen.'
    ]::text[],
    '[]'::jsonb,
    ARRAY['Weboldal készítés']::text[],
    ARRAY[]::text[],
    'Bérbeadva – referencia | PandaDesign',
    'A PandaDesign valós Bérbeadva referenciája. Az élő projekt a berbeadva.hu címen érhető el.',
    'Hasonló weboldalt szeretnél?',
    'Beszéljük át a saját projekted célját, és csak ellenőrizhető, szükséges funkciókból építsük fel a rendszert.',
    'Ingyenes weboldal-audit',
    'published',
    now()
  ),
  (
    'tetojavitas-mesterfokon',
    'Tetőjavítás Mesterfokon',
    'Tetőfedés / építőipar',
    'Ügyfélszerző weboldal',
    'Reszponzív szolgáltatói weboldal több lépéses ajánlatkéréssel, referencia- és tudástár modullal, valamint védett adminfelülettel.',
    'https://tetojavitasmesterfokon.hu',
    30,
    false,
    true,
    '',
    '',
    '2026',
    '',
    'A tetőjavítási érdeklődéseket strukturáltan kellett összegyűjteni a munka, az épület, a helyszín, a sürgősség és a fotók adataival, miközben a szolgáltatások és referenciák szerkeszthetők maradnak.',
    'TanStack Start és React 19 alapon készült rendszer Cloudflare Workers, D1 és R2 háttérrel. A publikus oldalhoz 8 lépéses ajánlatkérő, szolgáltatás- és referenciaoldalak, tudástár és jogi oldalak, a háttérhez pedig védett admin és leadkezelés tartozik.',
    ARRAY[
      'A több lépéses ajánlatkérés strukturált leadként menti a megkeresést.',
      'A referencia-képek Cloudflare R2 tárhelyre tölthetők.',
      'A publikus oldal és a védett, noindex admin külön útvonalakon működik.'
    ]::text[],
    '["8 lépéses ajánlatkérő","Fotófeltöltés","Leadkezelő admin","Árajánlatkezelés","Referenciák","Tudástár","SEO alapok","Mobiloptimalizálás"]'::jsonb,
    ARRAY['UX/UI tervezés','Frontend fejlesztés','Backend fejlesztés','Lead rendszer','SEO alapok']::text[],
    ARRAY['TanStack Start','React 19','TypeScript','Cloudflare Workers','Cloudflare D1','Cloudflare R2']::text[],
    'Tetőjavítás Mesterfokon – referencia | PandaDesign',
    'Ügyfélszerző tetőfedő weboldal 8 lépéses ajánlatkéréssel, referenciákkal, tudástárral és védett adminfelülettel.',
    'Szeretnél hasonló ügyfélszerző rendszert?',
    'Nézzük meg, hogyan lehet a saját szolgáltatásodhoz egyszerűbb ajánlatkérést és átlátható leadfolyamatot építeni.',
    'Ingyenes weboldal-audit',
    'published',
    now()
  )
on conflict (slug) do update
set title = excluded.title,
    industry = excluded.industry,
    category = excluded.category,
    description = excluded.description,
    project_url = excluded.project_url,
    sort_order = excluded.sort_order,
    is_concept = false,
    is_visible = true,
    client_name = excluded.client_name,
    location = excluded.location,
    completed_year = excluded.completed_year,
    duration_label = excluded.duration_label,
    challenge = excluded.challenge,
    solution = excluded.solution,
    results = excluded.results,
    features = excluded.features,
    services = excluded.services,
    technologies = excluded.technologies,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    cta_title = excluded.cta_title,
    cta_text = excluded.cta_text,
    cta_button_text = excluded.cta_button_text,
    status = 'published',
    published_at = coalesce(projects.published_at, now()),
    updated_at = now();

-- 3.5 „Mit kapsz velünk?” blokk (a korábbi „Miért a PandaDesign?” helyett)
update public.why_section_settings
set eyebrow = 'Mit kapsz velünk?',
    title = 'Amire minden projektnél számíthatsz',
    description = '',
    is_visible = true,
    updated_at = now()
where id = 1;

update public.why_items set is_visible = false, updated_at = now();

insert into public.why_items (title, description, icon_key, sort_order, is_visible)
select v.title, v.description, v.icon_key, v.sort_order, true
from (
  values
    ('Közvetlen kommunikáció', 'Azzal beszélsz, aki a projekten dolgozik – nincs közvetítői lánc.', 'message-square', 110),
    ('Saját rendszer és hozzáférések', 'Minden hozzáférést megkapsz, a rendszer a te tulajdonod.', 'settings', 120),
    ('Átlátható projektfolyamat', 'Minden szakaszban látod, hol tart a munka és mi következik.', 'check', 130),
    ('Mobilra optimalizált kialakítás', 'Telefonon, táblagépen és asztali gépen is jól használható.', 'smartphone', 140),
    ('Mérhető eredmények', 'Analitika és konverziómérés, hogy lásd, mi működik.', 'zap', 150),
    ('Továbbfejleszthető rendszer', 'Később bővíthető új funkciókkal, újrakezdés nélkül.', 'refresh', 160)
) as v(title, description, icon_key, sort_order)
where not exists (
  select 1 from public.why_items w where w.title = v.title and w.sort_order = v.sort_order
);

update public.why_items
set is_visible = true
where sort_order between 110 and 160;

-- 3.6 Záró CTA → ingyenes audit
update public.final_cta_settings
set badge_text = 'Ingyenes weboldal-audit',
    title = 'Kérd az ingyenes 15 perces weboldal-auditot',
    description = 'Megmutatjuk azt a 3 legfontosabb pontot, amely jelenleg visszafoghatja a weboldalad ügyfélszerzését. Kötelezettség nélkül.',
    button_text = 'Kérem az ingyenes auditot',
    button_url = '/ingyenes-weboldal-audit',
    icon_key = 'sparkles',
    is_visible = true,
    updated_at = now()
where id = 1;

-- 3.7 Fejléc CTA és navigáció
update public.site_chrome_settings
set header_cta_text = 'Ingyenes weboldal-audit',
    header_cta_url = '/ingyenes-weboldal-audit',
    header_cta_visible = true,
    updated_at = now()
where id = 1;

update public.site_navigation_items set sort_order = 30, updated_at = now()
where url = '/referenciak' and placement in ('header', 'both');

update public.site_navigation_items set sort_order = 40, updated_at = now()
where url = '/arak' and placement in ('header', 'both');

-- A Blog menüpont automatikusan rejtve marad, amíg nincs legalább 3
-- publikált cikk (lásd src/lib/site-navigation.ts).

-- 3.8 Globális SEO és márkaszövegek
update public.site_settings
set tagline = 'Ügyfélszerző weboldalak vállalkozásoknak',
    default_meta_title = 'Weboldal készítés vállalkozásoknak | PandaDesign',
    default_meta_description = 'Ügyfélszerző weboldalak magyar vállalkozásoknak: gyors, mobilra optimalizált, mérhető és továbbfejleszthető rendszer, amely a te tulajdonod.',
    footer_text = 'Ügyfélszerző weboldalak magyar vállalkozásoknak – gyorsan, mérhetően, a te tulajdonodban.',
    updated_at = now()
where id = 1;

-- 3.9 Árazási GYIK (scope). Csak üzletileg meghatározott állítás aktív.
-- Az üzleti döntést igénylő kérdések INAKTÍV piszkozatként kerülnek be –
-- az adminban (GYIK) véglegesíthetők és aktiválhatók.
insert into public.faq_items (question, answer, sort_order, is_active, category)
select v.question, v.answer, v.sort_order, v.is_active, 'pricing'
from (
  values
    ('Ki adja a szövegeket és a képeket?',
     'Alapesetben a tartalmat te biztosítod, mi segítünk a szerkezet kialakításában és abban, hogy mit érdemes kiemelni. Szövegírás és képválogatás külön kérhető, ezt az ajánlatban tüntetjük fel.',
     1010, true),
    ('A domain és a tárhely kinek a nevén lesz?',
     'A domain a te nevedre kerül, és a tárhely-hozzáférések is nálad lesznek. Ha még nincs domained vagy tárhelyed, segítünk a kiválasztásban és a beállításban. Hogy ezek díja része-e a projektnek, azt az árajánlat egyértelműen rögzíti.',
     1020, true),
    ('Benne van az analitika és a konverziómérés?',
     'Igen, a csomagok tartalmazzák az analitika és a konverziómérés beállítását. A mérés a süti-hozzájárulás szabályai szerint működik: hozzájárulás nélkül nem futnak analitikai sütik.',
     1030, true),
    ('Mit jelent pontosan a „SEO-alapok”?',
     'Technikai alapbeállításokat: egyedi oldalcímek és leírások, helyes címsor-szerkezet, sitemap és robots beállítás, mobilbarát és gyors betöltésű felépítés, képek alt szövegei. Nem jelent garantált helyezést, és nem tartalmaz folyamatos SEO-munkát vagy linképítést – ez külön szolgáltatás.',
     1040, true),
    ('Kell süti-hozzájárulás (cookie consent) a weboldalamra?',
     'Ha a weboldal analitikai vagy marketing sütiket használ, igen. Ilyenkor hozzájárulás-kezelőt építünk be, hogy a mérés csak a látogató engedélyével induljon el.',
     1050, true),
    ('Mennyi idő alatt készül el?',
     'Egy egyszerűbb oldal jellemzően néhány hét alatt elkészül, az összetettebb rendszerek hosszabb időt igényelnek. A pontos ütemezést az egyeztetéskor, írásban rögzítjük – és nagyban függ attól is, mikor áll rendelkezésre a tartalom.',
     1060, true),
    ('Mi van, ha később új funkció kell?',
     'Bővíthető rendszert építünk, így később is hozzáadható például foglalás, CRM, automatizáció, webshop vagy ügyfélportál. A plusz funkciókat egyedi ajánlat alapján készítjük el.',
     1070, true),
    ('Kié lesz a weboldal és milyen hozzáféréseket kapok?',
     'A domain, a tartalom és a beérkező adatok a te vállalkozásodhoz tartoznak. Átadáskor megkapod az admin-, tárhely- és analitikai hozzáféréseket, így nem függsz tőlünk.',
     1080, true),
    ('Mi történik az átadás után?',
     'Betanítást adunk az adminfelület használatához. Karbantartást, frissítéseket és további fejlesztést külön megállapodás alapján vállalunk.',
     1090, true),
    -- ÜZLETI DÖNTÉS SZÜKSÉGES – inaktív piszkozatok:
    ('Hány módosítási kör tartozik a csomagokba?',
     'PISZKOZAT – töltsd ki a csomagokba tartozó módosítási körök számát, majd aktiváld.',
     1100, false),
    ('Az ár tartalmazza az ÁFA-t?',
     'PISZKOZAT – add meg a vállalkozás ÁFA-státuszának megfelelő, jogilag helyes megfogalmazást, majd aktiváld.',
     1110, false),
    ('Meddig tart az átadás utáni támogatás?',
     'PISZKOZAT – add meg a díjmentes támogatási időszak hosszát és tartalmát (ha van), majd aktiváld.',
     1120, false)
) as v(question, answer, sort_order, is_active)
where not exists (
  select 1 from public.faq_items f where f.question = v.question
);

-- 3.10 Blog – csak VÁZLAT (status = 'draft'), nem publikus.
-- A cikkeket szakmailag megírva, az adminban kell publikálni.
insert into public.blog_posts (title, slug, excerpt, content_html, status, seo_title, seo_description)
select v.title, v.slug, v.excerpt, v.content_html, 'draft', v.title, v.excerpt
from (
  values
    ('Mennyibe kerül egy weboldal 2026-ban?',
     'mennyibe-kerul-egy-weboldal-2026',
     'Mitől függ egy weboldal ára, és miért nem összehasonlítható két árajánlat első ránézésre?',
     '<p><em>VÁZLAT – publikálás előtt megírandó.</em></p><h2>Mitől függ az ár?</h2><ul><li>Oldalszám és tartalom</li><li>Egyedi funkciók (foglalás, webshop, integráció)</li><li>Ki adja a szöveget és a képeket</li></ul><h2>Mit érdemes összehasonlítani két ajánlatban?</h2><ul><li>Tulajdonjog és hozzáférések</li><li>Mérés és SEO-alapok</li><li>Átadás utáni támogatás</li></ul><h2>PandaDesign induló árak</h2><p>Hivatkozás az /arak oldalra.</p>'),
    ('WordPress vagy egyedi weboldal?',
     'wordpress-vagy-egyedi-weboldal',
     'Mikor jó választás a WordPress, és mikor éri meg egyedi fejlesztésben gondolkodni?',
     '<p><em>VÁZLAT – publikálás előtt megírandó.</em></p><h2>Mikor jó a WordPress?</h2><ul><li>Sok, saját kezűleg szerkesztett tartalom</li><li>Széles bővítmény-ökoszisztéma</li></ul><h2>Mikor éri meg az egyedi fejlesztés?</h2><ul><li>Sebesség és biztonság</li><li>Egyedi folyamatok, integrációk</li></ul><h2>Hogyan döntsünk?</h2><p>Döntési szempontok táblázatban.</p>'),
    ('Mitől hoz érdeklődőket egy céges weboldal?',
     'mitol-hoz-erdeklodoket-egy-ceges-weboldal',
     'Az a weboldal, amely szép, még nem feltétlenül hoz megkeresést. Mi a különbség?',
     '<p><em>VÁZLAT – publikálás előtt megírandó.</em></p><h2>Világos üzenet 5 másodperc alatt</h2><h2>Egyértelmű következő lépés (CTA)</h2><h2>Bizalomépítő elemek</h2><h2>Mobilnézet és sebesség</h2><h2>Mérés: honnan jönnek a megkeresések?</h2>')
) as v(title, slug, excerpt, content_html)
where not exists (
  select 1 from public.blog_posts b where b.slug = v.slug
);

commit;
