-- PandaDesign legal document CMS

create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  version text not null default '1.0',
  status text not null default 'draft',
  effective_from date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint legal_pages_status_check
    check (status in ('draft', 'published')),
  constraint legal_pages_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists legal_pages_slug_idx
  on public.legal_pages (slug);

create index if not exists legal_pages_status_idx
  on public.legal_pages (status);

create index if not exists legal_pages_updated_at_idx
  on public.legal_pages (updated_at desc);

create index if not exists legal_pages_published_at_idx
  on public.legal_pages (published_at desc);

create table if not exists public.legal_page_drafts (
  legal_page_id uuid primary key
    references public.legal_pages(id)
    on delete cascade,
  slug text not null,
  title text not null,
  content text not null default '',
  version text not null default '1.0',
  effective_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint legal_page_drafts_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists legal_page_drafts_updated_at_idx
  on public.legal_page_drafts (updated_at desc);

create table if not exists public.legal_page_revisions (
  id uuid primary key default gen_random_uuid(),
  legal_page_id uuid not null
    references public.legal_pages(id)
    on delete cascade,
  slug text not null,
  title text not null,
  content text not null,
  version text not null,
  status text not null,
  effective_from date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint legal_page_revisions_status_check
    check (status in ('draft', 'published'))
);

create index if not exists legal_page_revisions_page_idx
  on public.legal_page_revisions (legal_page_id);

create index if not exists legal_page_revisions_created_at_idx
  on public.legal_page_revisions (created_at desc);

create index if not exists legal_page_revisions_version_idx
  on public.legal_page_revisions (version);

create or replace function public.update_legal_page_updated_at()
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

drop trigger if exists set_legal_page_updated_at
  on public.legal_pages;

create trigger set_legal_page_updated_at
before update on public.legal_pages
for each row
execute function public.update_legal_page_updated_at();

drop trigger if exists set_legal_page_draft_updated_at
  on public.legal_page_drafts;

create trigger set_legal_page_draft_updated_at
before update on public.legal_page_drafts
for each row
execute function public.update_legal_page_updated_at();

create or replace function public.capture_legal_page_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if row(
    old.slug,
    old.title,
    old.content,
    old.version,
    old.status,
    old.effective_from,
    old.published_at
  ) is not distinct from row(
    new.slug,
    new.title,
    new.content,
    new.version,
    new.status,
    new.effective_from,
    new.published_at
  ) then
    return new;
  end if;

  insert into public.legal_page_revisions (
    legal_page_id,
    slug,
    title,
    content,
    version,
    status,
    effective_from,
    published_at,
    created_by
  )
  values (
    old.id,
    old.slug,
    old.title,
    old.content,
    old.version,
    old.status,
    old.effective_from,
    old.published_at,
    coalesce(auth.uid(), old.updated_by, old.created_by)
  );

  return new;
end;
$$;

drop trigger if exists capture_legal_page_revision_trigger
  on public.legal_pages;

create trigger capture_legal_page_revision_trigger
before update on public.legal_pages
for each row
execute function public.capture_legal_page_revision();

create or replace function public.capture_legal_page_draft_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if row(
    old.slug,
    old.title,
    old.content,
    old.version,
    old.effective_from
  ) is not distinct from row(
    new.slug,
    new.title,
    new.content,
    new.version,
    new.effective_from
  ) then
    return new;
  end if;

  insert into public.legal_page_revisions (
    legal_page_id,
    slug,
    title,
    content,
    version,
    status,
    effective_from,
    published_at,
    created_by
  )
  values (
    old.legal_page_id,
    old.slug,
    old.title,
    old.content,
    old.version,
    'draft',
    old.effective_from,
    null,
    coalesce(auth.uid(), old.updated_by, old.created_by)
  );

  return new;
end;
$$;

drop trigger if exists capture_legal_page_draft_revision_trigger
  on public.legal_page_drafts;

create trigger capture_legal_page_draft_revision_trigger
before update on public.legal_page_drafts
for each row
execute function public.capture_legal_page_draft_revision();

alter table public.legal_pages enable row level security;
alter table public.legal_page_drafts enable row level security;
alter table public.legal_page_revisions enable row level security;

grant select on table public.legal_pages to anon, authenticated;
grant insert, update, delete on table public.legal_pages to authenticated;

grant select, insert, update, delete
  on table public.legal_page_drafts
  to authenticated;

grant select, insert, delete
  on table public.legal_page_revisions
  to authenticated;

drop policy if exists "Anonymous can read published legal pages"
  on public.legal_pages;

create policy "Anonymous can read published legal pages"
on public.legal_pages
for select
to anon
using (status = 'published');

drop policy if exists "Authenticated users can read published legal pages"
  on public.legal_pages;

create policy "Authenticated users can read published legal pages"
on public.legal_pages
for select
to authenticated
using (status = 'published');

drop policy if exists "Admins can read all legal pages"
  on public.legal_pages;

create policy "Admins can read all legal pages"
on public.legal_pages
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert legal pages"
  on public.legal_pages;

create policy "Admins can insert legal pages"
on public.legal_pages
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update legal pages"
  on public.legal_pages;

create policy "Admins can update legal pages"
on public.legal_pages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete legal pages"
  on public.legal_pages;

create policy "Admins can delete legal pages"
on public.legal_pages
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read legal drafts"
  on public.legal_page_drafts;

create policy "Admins can read legal drafts"
on public.legal_page_drafts
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert legal drafts"
  on public.legal_page_drafts;

create policy "Admins can insert legal drafts"
on public.legal_page_drafts
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update legal drafts"
  on public.legal_page_drafts;

create policy "Admins can update legal drafts"
on public.legal_page_drafts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete legal drafts"
  on public.legal_page_drafts;

create policy "Admins can delete legal drafts"
on public.legal_page_drafts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read legal revisions"
  on public.legal_page_revisions;

create policy "Admins can read legal revisions"
on public.legal_page_revisions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert legal revisions"
  on public.legal_page_revisions;

create policy "Admins can insert legal revisions"
on public.legal_page_revisions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can delete legal revisions"
  on public.legal_page_revisions;

create policy "Admins can delete legal revisions"
on public.legal_page_revisions
for delete
to authenticated
using (public.is_admin());

create or replace function public.save_legal_page_draft(
  p_page_id uuid,
  p_title text,
  p_slug text,
  p_content text,
  p_version text,
  p_effective_from date default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slug text := lower(trim(p_slug));
begin
  if not public.is_admin() then
    raise exception 'Nincs jogosultság jogi dokumentum mentéséhez.';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'A dokumentum címe nem lehet üres.';
  end if;

  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'A slug csak kisbetűket, számokat és kötőjelet tartalmazhat.';
  end if;

  if nullif(trim(p_version), '') is null then
    raise exception 'A verziószám nem lehet üres.';
  end if;

  update public.legal_page_drafts
  set
    title = trim(p_title),
    slug = v_slug,
    content = coalesce(p_content, ''),
    version = trim(p_version),
    effective_from = p_effective_from,
    updated_by = auth.uid()
  where legal_page_id = p_page_id;

  if not found then
    insert into public.legal_page_drafts (
      legal_page_id,
      title,
      slug,
      content,
      version,
      effective_from,
      created_by,
      updated_by
    )
    select
      page.id,
      trim(p_title),
      v_slug,
      coalesce(p_content, ''),
      trim(p_version),
      p_effective_from,
      auth.uid(),
      auth.uid()
    from public.legal_pages as page
    where page.id = p_page_id;

    if not found then
      raise exception 'A jogi dokumentum nem található.';
    end if;
  end if;

  return p_page_id;
end;
$$;

create or replace function public.publish_legal_page(
  p_page_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_draft public.legal_page_drafts%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Nincs jogosultság jogi dokumentum közzétételéhez.';
  end if;

  select *
  into v_draft
  from public.legal_page_drafts
  where legal_page_id = p_page_id
  for update;

  if not found then
    raise exception 'A dokumentum piszkozata nem található.';
  end if;

  if nullif(trim(v_draft.content), '') is null
     or trim(v_draft.content) in ('<p></p>', '<p><br></p>') then
    raise exception 'Üres jogi dokumentum nem tehető közzé.';
  end if;

  update public.legal_pages
  set
    slug = v_draft.slug,
    title = v_draft.title,
    content = v_draft.content,
    version = v_draft.version,
    status = 'published',
    effective_from = v_draft.effective_from,
    published_at = now(),
    updated_by = auth.uid()
  where id = p_page_id;

  if not found then
    raise exception 'A jogi dokumentum nem található.';
  end if;

  return p_page_id;
end;
$$;

create or replace function public.restore_legal_page_revision(
  p_revision_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_revision public.legal_page_revisions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Nincs jogosultság korábbi verzió visszaállításához.';
  end if;

  select revision.*
  into v_revision
  from public.legal_page_revisions as revision
  where revision.id = p_revision_id;

  if not found then
    raise exception 'A kiválasztott verzió nem található.';
  end if;

  update public.legal_page_drafts
  set
    slug = v_revision.slug,
    title = v_revision.title,
    content = v_revision.content,
    version = v_revision.version,
    effective_from = v_revision.effective_from,
    updated_by = auth.uid()
  where legal_page_id = v_revision.legal_page_id;

  if not found then
    insert into public.legal_page_drafts (
      legal_page_id,
      slug,
      title,
      content,
      version,
      effective_from,
      created_by,
      updated_by
    )
    values (
      v_revision.legal_page_id,
      v_revision.slug,
      v_revision.title,
      v_revision.content,
      v_revision.version,
      v_revision.effective_from,
      auth.uid(),
      auth.uid()
    );
  end if;

  return v_revision.legal_page_id;
end;
$$;

revoke all on function public.save_legal_page_draft(
  uuid,
  text,
  text,
  text,
  text,
  date
) from public;

revoke all on function public.publish_legal_page(uuid) from public;
revoke all on function public.restore_legal_page_revision(uuid) from public;

grant execute on function public.save_legal_page_draft(
  uuid,
  text,
  text,
  text,
  text,
  date
) to authenticated;

grant execute on function public.publish_legal_page(uuid) to authenticated;
grant execute on function public.restore_legal_page_revision(uuid)
  to authenticated;

revoke all on function public.capture_legal_page_revision() from public;
revoke all on function public.capture_legal_page_draft_revision() from public;

insert into public.legal_pages (
  slug,
  title,
  content,
  version,
  status
)
values
  ('adatkezeles', 'Adatkezelési tájékoztató', '', '1.0', 'draft'),
  ('aszf', 'Általános Szerződési Feltételek', '', '1.0', 'draft'),
  ('impresszum', 'Impresszum', '', '1.0', 'draft'),
  (
    'cookie-tajekoztato',
    'Süti- és cookie-tájékoztató',
    '',
    '1.0',
    'draft'
  )
on conflict (slug) do nothing;

insert into public.legal_page_drafts (
  legal_page_id,
  slug,
  title,
  content,
  version
)
select
  page.id,
  page.slug,
  page.title,
  page.content,
  page.version
from public.legal_pages as page
where page.slug in (
  'adatkezeles',
  'aszf',
  'impresszum',
  'cookie-tajekoztato'
)
on conflict (legal_page_id) do nothing;

update public.site_navigation_items
set url = '/cookie-tajekoztato'
where url in ('/cookie', '/sutik')
  and placement in ('footer', 'both');

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
  'footer',
  'Jogi információk',
  seed.sort_order,
  true,
  false
from (
  values
    ('Adatkezelés', '/adatkezeles', 110),
    ('Általános Szerződési Feltételek', '/aszf', 120),
    ('Impresszum', '/impresszum', 130),
    ('Cookie-tájékoztató', '/cookie-tajekoztato', 140)
) as seed(label, url, sort_order)
where not exists (
  select 1
  from public.site_navigation_items as item
  where item.url = seed.url
);
