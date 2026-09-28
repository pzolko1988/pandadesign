alter table public.site_settings
  add column if not exists lead_autoreply_enabled boolean not null default true;

update public.site_settings
set lead_autoreply_enabled = true
where id = 1;
