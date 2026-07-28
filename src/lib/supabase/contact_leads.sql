-- =========================================================
-- PandaDesign – Kapcsolatfelvételi leadkezelő
-- =========================================================

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(trim(name)) between 2 and 120),

  email text not null
    check (char_length(trim(email)) between 5 and 254),

  phone text not null default '',
  company text not null default '',

  service_type text not null default 'Egyéb',
  budget_range text not null default 'Még nem tudom',

  message text not null
    check (char_length(trim(message)) between 10 and 5000),

  status text not null default 'new'
    check (
      status in (
        'new',
        'contacted',
        'qualified',
        'proposal_sent',
        'won',
        'lost',
        'spam'
      )
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high'
      )
    ),

  privacy_accepted boolean not null default true,
  privacy_accepted_at timestamptz not null default now(),
  privacy_policy_version text not null default '2026-07-27',

  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,

  source_page text not null default '/kapcsolat',
  referrer text not null default '',

  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  utm_term text not null default '',

  user_agent text not null default '',

  viewed_at timestamptz,
  last_contacted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_lead_notes (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null
    references public.contact_leads(id)
    on delete cascade,

  note text not null
    check (char_length(trim(note)) between 2 and 5000),

  created_by uuid not null
    references auth.users(id)
    on delete restrict,

  created_at timestamptz not null default now()
);

create index if not exists contact_leads_created_at_idx
  on public.contact_leads (created_at desc);

create index if not exists contact_leads_status_created_idx
  on public.contact_leads (status, created_at desc);

create index if not exists contact_leads_priority_created_idx
  on public.contact_leads (priority, created_at desc);

create index if not exists contact_leads_email_idx
  on public.contact_leads (lower(email));

create index if not exists contact_lead_notes_lead_created_idx
  on public.contact_lead_notes (lead_id, created_at desc);

-- =========================================================
-- Automatikus updated_at frissítés
-- =========================================================

create or replace function public.update_contact_lead_updated_at()
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

drop trigger if exists set_contact_lead_updated_at
  on public.contact_leads;

create trigger set_contact_lead_updated_at
before update on public.contact_leads
for each row
execute function public.update_contact_lead_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.contact_leads enable row level security;
alter table public.contact_lead_notes enable row level security;

-- Közvetlen publikus táblaműveletek tiltva maradnak.
-- A publikus űrlap kizárólag az ellenőrzött RPC-függvényt használja.

revoke all on table public.contact_leads
  from anon;

revoke all on table public.contact_lead_notes
  from anon;

grant select, update, delete
  on table public.contact_leads
  to authenticated;

grant select, insert, update, delete
  on table public.contact_lead_notes
  to authenticated;

drop policy if exists "Admins can read contact leads"
  on public.contact_leads;

create policy "Admins can read contact leads"
on public.contact_leads
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update contact leads"
  on public.contact_leads;

create policy "Admins can update contact leads"
on public.contact_leads
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete contact leads"
  on public.contact_leads;

create policy "Admins can delete contact leads"
on public.contact_leads
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read lead notes"
  on public.contact_lead_notes;

create policy "Admins can read lead notes"
on public.contact_lead_notes
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert lead notes"
  on public.contact_lead_notes;

create policy "Admins can insert lead notes"
on public.contact_lead_notes
for insert
to authenticated
with check (
  public.is_admin()
  and created_by = auth.uid()
);

drop policy if exists "Admins can update lead notes"
  on public.contact_lead_notes;

create policy "Admins can update lead notes"
on public.contact_lead_notes
for update
to authenticated
using (
  public.is_admin()
  and created_by = auth.uid()
)
with check (
  public.is_admin()
  and created_by = auth.uid()
);

drop policy if exists "Admins can delete lead notes"
  on public.contact_lead_notes;

create policy "Admins can delete lead notes"
on public.contact_lead_notes
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Biztonságos publikus leadbeküldés
-- =========================================================

create or replace function public.submit_contact_lead(
  p_name text,
  p_email text,
  p_phone text default '',
  p_company text default '',
  p_service_type text default 'Egyéb',
  p_budget_range text default 'Még nem tudom',
  p_message text default '',
  p_privacy_accepted boolean default false,
  p_marketing_consent boolean default false,
  p_source_page text default '/kapcsolat',
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
  v_service_type text := trim(coalesce(p_service_type, ''));
  v_budget_range text := trim(coalesce(p_budget_range, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_id uuid;
begin
  -- Honeypot: robotok gyakran kitöltik ezt a rejtett mezőt.
  if trim(coalesce(p_website, '')) <> '' then
    raise exception 'A beküldés nem fogadható el.';
  end if;

  if char_length(v_name) < 2
     or char_length(v_name) > 120 then
    raise exception 'A név hossza nem megfelelő.';
  end if;

  if char_length(v_email) < 5
     or char_length(v_email) > 254
     or v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'Az e-mail-cím formátuma nem megfelelő.';
  end if;

  if char_length(v_phone) > 80 then
    raise exception 'A telefonszám túl hosszú.';
  end if;

  if char_length(v_company) > 160 then
    raise exception 'A cégnév túl hosszú.';
  end if;

  if char_length(v_service_type) > 120 then
    raise exception 'A szolgáltatástípus túl hosszú.';
  end if;

  if char_length(v_budget_range) > 120 then
    raise exception 'A költségkeret túl hosszú.';
  end if;

  if char_length(v_message) < 10
     or char_length(v_message) > 5000 then
    raise exception 'Az üzenet hossza nem megfelelő.';
  end if;

  if not coalesce(p_privacy_accepted, false) then
    raise exception 'Az adatkezelési tájékoztató elfogadása kötelező.';
  end if;

  -- Egyszerű duplikáció- és spamvédelem:
  -- ugyanazzal az e-mail-címmel 60 másodpercen belül
  -- nem hozható létre újabb lead.
  if exists (
    select 1
    from public.contact_leads
    where lower(email) = v_email
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Kérjük, várj egy percet az újabb beküldés előtt.';
  end if;

  insert into public.contact_leads (
    name,
    email,
    phone,
    company,
    service_type,
    budget_range,
    message,
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
    coalesce(nullif(v_service_type, ''), 'Egyéb'),
    coalesce(nullif(v_budget_range, ''), 'Még nem tudom'),
    v_message,
    true,
    now(),
    '2026-07-27',
    coalesce(p_marketing_consent, false),
    case
      when coalesce(p_marketing_consent, false)
      then now()
      else null
    end,
    left(trim(coalesce(p_source_page, '/kapcsolat')), 500),
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

revoke all on function public.submit_contact_lead(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.submit_contact_lead(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

select
  id,
  name,
  email,
  status,
  priority,
  created_at
from public.contact_leads
order by created_at desc;
