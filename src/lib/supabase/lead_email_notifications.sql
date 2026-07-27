-- =========================================================
-- PandaDesign – Lead e-mail-értesítési állapotok
-- =========================================================

alter table public.contact_leads
  add column if not exists notification_status text;

alter table public.contact_leads
  add column if not exists notification_sent_at timestamptz;

alter table public.contact_leads
  add column if not exists notification_last_attempt_at timestamptz;

alter table public.contact_leads
  add column if not exists notification_attempts integer;

alter table public.contact_leads
  add column if not exists notification_email_id text;

alter table public.contact_leads
  add column if not exists notification_error text;

alter table public.contact_leads
  add column if not exists autoreply_status text;

alter table public.contact_leads
  add column if not exists autoreply_sent_at timestamptz;

alter table public.contact_leads
  add column if not exists autoreply_email_id text;

alter table public.contact_leads
  add column if not exists autoreply_error text;

-- A modul telepítése előtt létrejött leadek nem kaptak
-- automatikus értesítést, ezért ezek "skipped" állapotúak.
update public.contact_leads
set
  notification_status = 'skipped',
  notification_attempts = 0,
  autoreply_status = 'disabled'
where notification_status is null;

alter table public.contact_leads
  alter column notification_status
  set default 'pending';

alter table public.contact_leads
  alter column notification_status
  set not null;

alter table public.contact_leads
  alter column notification_attempts
  set default 0;

alter table public.contact_leads
  alter column notification_attempts
  set not null;

alter table public.contact_leads
  alter column autoreply_status
  set default 'disabled';

alter table public.contact_leads
  alter column autoreply_status
  set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'contact_leads_notification_status_check'
      and conrelid =
        'public.contact_leads'::regclass
  ) then
    alter table public.contact_leads
      add constraint
        contact_leads_notification_status_check
      check (
        notification_status in (
          'pending',
          'sent',
          'failed',
          'skipped'
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'contact_leads_notification_attempts_check'
      and conrelid =
        'public.contact_leads'::regclass
  ) then
    alter table public.contact_leads
      add constraint
        contact_leads_notification_attempts_check
      check (notification_attempts >= 0);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'contact_leads_autoreply_status_check'
      and conrelid =
        'public.contact_leads'::regclass
  ) then
    alter table public.contact_leads
      add constraint
        contact_leads_autoreply_status_check
      check (
        autoreply_status in (
          'disabled',
          'pending',
          'sent',
          'failed',
          'skipped'
        )
      );
  end if;
end;
$$;

create index if not exists
  contact_leads_notification_status_idx
on public.contact_leads (
  notification_status,
  created_at desc
);

select
  id,
  name,
  email,
  notification_status,
  notification_attempts,
  autoreply_status,
  created_at
from public.contact_leads
order by created_at desc;
