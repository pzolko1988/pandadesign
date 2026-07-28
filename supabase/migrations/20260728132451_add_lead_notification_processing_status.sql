begin;

alter table public.contact_leads
  drop constraint if exists
    contact_leads_notification_status_check;

alter table public.contact_leads
  add constraint
    contact_leads_notification_status_check
  check (
    notification_status in (
      'pending',
      'processing',
      'sent',
      'failed',
      'skipped'
    )
  );

comment on column public.contact_leads.notification_status is
  'Lead értesítés állapota: pending, processing, sent, failed vagy skipped.';

commit;