-- =========================================================
-- PandaDesign – Előnézet és verzióelőzmények
-- Blog + részletes projektek
-- =========================================================

-- ---------------------------------------------------------
-- 1. Előnézeti mezők és publikálási mezők
-- ---------------------------------------------------------

alter table public.blog_posts
  add column if not exists preview_token uuid;

alter table public.blog_posts
  add column if not exists preview_expires_at timestamptz;

create unique index if not exists blog_posts_preview_token_unique_idx
  on public.blog_posts (preview_token)
  where preview_token is not null;

alter table public.projects
  add column if not exists status text not null default 'draft';

alter table public.projects
  add column if not exists published_at timestamptz;

alter table public.projects
  add column if not exists preview_token uuid;

alter table public.projects
  add column if not exists preview_expires_at timestamptz;

alter table public.projects
  add column if not exists created_by uuid
    references auth.users(id)
    on delete set null;

alter table public.projects
  add column if not exists updated_by uuid
    references auth.users(id)
    on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_status_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_status_check
      check (status in ('draft', 'published'));
  end if;
end;
$$;

create unique index if not exists projects_preview_token_unique_idx
  on public.projects (preview_token)
  where preview_token is not null;

update public.projects
set
  status = case
    when is_visible then 'published'
    else 'draft'
  end,
  published_at = case
    when is_visible then coalesce(published_at, updated_at, now())
    else null
  end;

-- ---------------------------------------------------------
-- 2. Projektpublikálás szinkronizálása
-- ---------------------------------------------------------

create or replace function public.synchronize_project_publication()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_visible then
    new.status = 'published';

    if tg_op = 'INSERT'
       or old.is_visible is distinct from true
       or new.published_at is null then
      new.published_at =
        coalesce(new.published_at, now());
    end if;
  else
    new.status = 'draft';
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists synchronize_project_publication_trigger
  on public.projects;

create trigger synchronize_project_publication_trigger
before insert or update on public.projects
for each row
execute function public.synchronize_project_publication();

-- ---------------------------------------------------------
-- 3. Verziótáblák
-- ---------------------------------------------------------

create table if not exists public.blog_post_revisions (
  id bigserial primary key,

  blog_post_id uuid not null
    references public.blog_posts(id)
    on delete cascade,

  revision_number integer not null,
  snapshot jsonb not null,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique (blog_post_id, revision_number)
);

create index if not exists blog_post_revisions_post_idx
  on public.blog_post_revisions (
    blog_post_id,
    revision_number desc
  );

create table if not exists public.project_revisions (
  id bigserial primary key,

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  revision_number integer not null,
  snapshot jsonb not null,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique (project_id, revision_number)
);

create index if not exists project_revisions_project_idx
  on public.project_revisions (
    project_id,
    revision_number desc
  );

alter table public.blog_post_revisions
  enable row level security;

alter table public.project_revisions
  enable row level security;

grant select
  on table public.blog_post_revisions
  to authenticated;

grant select
  on table public.project_revisions
  to authenticated;

drop policy if exists "Admins can read blog revisions"
  on public.blog_post_revisions;

create policy "Admins can read blog revisions"
on public.blog_post_revisions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can read project revisions"
  on public.project_revisions;

create policy "Admins can read project revisions"
on public.project_revisions
for select
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------
-- 4. Snapshot-segédfüggvények
-- ---------------------------------------------------------

create or replace function public.blog_post_snapshot(
  p_post public.blog_posts
)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'title', p_post.title,
    'slug', p_post.slug,
    'excerpt', p_post.excerpt,
    'content_html', p_post.content_html,
    'content_json', p_post.content_json,
    'featured_image_path', p_post.featured_image_path,
    'author_name', p_post.author_name,
    'status', p_post.status,
    'published_at', p_post.published_at,
    'seo_title', p_post.seo_title,
    'seo_description', p_post.seo_description
  );
$$;

create or replace function public.project_snapshot(
  p_project public.projects
)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'slug', p_project.slug,
    'title', p_project.title,
    'industry', p_project.industry,
    'category', p_project.category,
    'description', p_project.description,
    'image_path', p_project.image_path,
    'project_url', p_project.project_url,
    'sort_order', p_project.sort_order,
    'is_concept', p_project.is_concept,
    'is_visible', p_project.is_visible,
    'status', p_project.status,
    'published_at', p_project.published_at,
    'client_name', p_project.client_name,
    'location', p_project.location,
    'completed_year', p_project.completed_year,
    'duration_label', p_project.duration_label,
    'challenge', p_project.challenge,
    'solution', p_project.solution,
    'results', p_project.results,
    'services', p_project.services,
    'technologies', p_project.technologies,
    'content_html', p_project.content_html,
    'content_json', p_project.content_json,
    'gallery_paths', p_project.gallery_paths,
    'seo_title', p_project.seo_title,
    'seo_description', p_project.seo_description,
    'cta_title', p_project.cta_title,
    'cta_text', p_project.cta_text,
    'cta_button_text', p_project.cta_button_text
  );
$$;

-- ---------------------------------------------------------
-- 5. Automatikus verziómentés
-- ---------------------------------------------------------

create or replace function public.capture_blog_post_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_snapshot jsonb;
  v_previous_snapshot jsonb;
  v_revision_number integer;
begin
  v_snapshot := public.blog_post_snapshot(new);

  if tg_op = 'UPDATE' then
    v_previous_snapshot :=
      public.blog_post_snapshot(old);

    if v_snapshot = v_previous_snapshot then
      return new;
    end if;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(new.id::text)
  );

  select coalesce(max(revision_number), 0) + 1
  into v_revision_number
  from public.blog_post_revisions
  where blog_post_id = new.id;

  insert into public.blog_post_revisions (
    blog_post_id,
    revision_number,
    snapshot,
    created_by
  )
  values (
    new.id,
    v_revision_number,
    v_snapshot,
    coalesce(
      new.updated_by,
      new.created_by,
      auth.uid()
    )
  );

  return new;
end;
$$;

drop trigger if exists capture_blog_post_revision_trigger
  on public.blog_posts;

create trigger capture_blog_post_revision_trigger
after insert or update on public.blog_posts
for each row
execute function public.capture_blog_post_revision();

create or replace function public.capture_project_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_snapshot jsonb;
  v_previous_snapshot jsonb;
  v_revision_number integer;
begin
  v_snapshot := public.project_snapshot(new);

  if tg_op = 'UPDATE' then
    v_previous_snapshot :=
      public.project_snapshot(old);

    if v_snapshot = v_previous_snapshot then
      return new;
    end if;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(new.id::text)
  );

  select coalesce(max(revision_number), 0) + 1
  into v_revision_number
  from public.project_revisions
  where project_id = new.id;

  insert into public.project_revisions (
    project_id,
    revision_number,
    snapshot,
    created_by
  )
  values (
    new.id,
    v_revision_number,
    v_snapshot,
    coalesce(
      new.updated_by,
      new.created_by,
      auth.uid()
    )
  );

  return new;
end;
$$;

drop trigger if exists capture_project_revision_trigger
  on public.projects;

create trigger capture_project_revision_trigger
after insert or update on public.projects
for each row
execute function public.capture_project_revision();

-- ---------------------------------------------------------
-- 6. Kezdő verziók a már meglévő tartalomhoz
-- ---------------------------------------------------------

insert into public.blog_post_revisions (
  blog_post_id,
  revision_number,
  snapshot,
  created_by
)
select
  post.id,
  1,
  public.blog_post_snapshot(post),
  coalesce(post.updated_by, post.created_by)
from public.blog_posts as post
where not exists (
  select 1
  from public.blog_post_revisions as revision
  where revision.blog_post_id = post.id
);

insert into public.project_revisions (
  project_id,
  revision_number,
  snapshot,
  created_by
)
select
  project.id,
  1,
  public.project_snapshot(project),
  coalesce(project.updated_by, project.created_by)
from public.projects as project
where not exists (
  select 1
  from public.project_revisions as revision
  where revision.project_id = project.id
);

-- ---------------------------------------------------------
-- 7. Titkos, időkorlátos előnézeti tokenek
-- ---------------------------------------------------------

create or replace function public.generate_blog_preview_token(
  p_post_id uuid,
  p_valid_hours integer default 168
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_token uuid := gen_random_uuid();
begin
  if not public.is_admin() then
    raise exception
      'Nincs jogosultság előnézeti link létrehozásához.';
  end if;

  if p_valid_hours < 1 or p_valid_hours > 720 then
    raise exception
      'Az érvényesség 1 és 720 óra között lehet.';
  end if;

  update public.blog_posts
  set
    preview_token = v_token,
    preview_expires_at =
      now() + make_interval(hours => p_valid_hours),
    updated_by = auth.uid()
  where id = p_post_id;

  if not found then
    raise exception 'A blogbejegyzés nem található.';
  end if;

  return v_token::text;
end;
$$;

create or replace function public.generate_project_preview_token(
  p_project_id uuid,
  p_valid_hours integer default 168
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_token uuid := gen_random_uuid();
begin
  if not public.is_admin() then
    raise exception
      'Nincs jogosultság előnézeti link létrehozásához.';
  end if;

  if p_valid_hours < 1 or p_valid_hours > 720 then
    raise exception
      'Az érvényesség 1 és 720 óra között lehet.';
  end if;

  update public.projects
  set
    preview_token = v_token,
    preview_expires_at =
      now() + make_interval(hours => p_valid_hours),
    updated_by = auth.uid()
  where id = p_project_id;

  if not found then
    raise exception 'A projekt nem található.';
  end if;

  return v_token::text;
end;
$$;

create or replace function public.revoke_blog_preview_token(
  p_post_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Nincs jogosultság.';
  end if;

  update public.blog_posts
  set
    preview_token = null,
    preview_expires_at = null,
    updated_by = auth.uid()
  where id = p_post_id;
end;
$$;

create or replace function public.revoke_project_preview_token(
  p_project_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Nincs jogosultság.';
  end if;

  update public.projects
  set
    preview_token = null,
    preview_expires_at = null,
    updated_by = auth.uid()
  where id = p_project_id;
end;
$$;

-- ---------------------------------------------------------
-- 8. Publikus előnézeti lekérések
-- ---------------------------------------------------------

create or replace function public.get_blog_post_preview(
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', post.id,
    'title', post.title,
    'slug', post.slug,
    'excerpt', post.excerpt,
    'content_html', post.content_html,
    'featured_image_path', post.featured_image_path,
    'author_name', post.author_name,
    'status', post.status,
    'published_at', post.published_at,
    'seo_title', post.seo_title,
    'seo_description', post.seo_description,
    'preview_expires_at', post.preview_expires_at
  )
  into v_result
  from public.blog_posts as post
  where post.preview_token::text = trim(p_token)
    and post.preview_expires_at > now();

  return v_result;
end;
$$;

create or replace function public.get_project_preview(
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', project.id,
    'slug', project.slug,
    'title', project.title,
    'industry', project.industry,
    'category', project.category,
    'description', project.description,
    'image_path', project.image_path,
    'project_url', project.project_url,
    'is_concept', project.is_concept,
    'status', project.status,
    'client_name', project.client_name,
    'location', project.location,
    'completed_year', project.completed_year,
    'duration_label', project.duration_label,
    'challenge', project.challenge,
    'solution', project.solution,
    'results', project.results,
    'services', project.services,
    'technologies', project.technologies,
    'content_html', project.content_html,
    'gallery_paths', project.gallery_paths,
    'seo_title', project.seo_title,
    'seo_description', project.seo_description,
    'cta_title', project.cta_title,
    'cta_text', project.cta_text,
    'cta_button_text', project.cta_button_text,
    'preview_expires_at', project.preview_expires_at
  )
  into v_result
  from public.projects as project
  where project.preview_token::text = trim(p_token)
    and project.preview_expires_at > now();

  return v_result;
end;
$$;

-- ---------------------------------------------------------
-- 9. Verzió visszaállítása
-- ---------------------------------------------------------

create or replace function public.restore_blog_post_revision(
  p_revision_id bigint
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_revision public.blog_post_revisions%rowtype;
  v_snapshot jsonb;
begin
  if not public.is_admin() then
    raise exception
      'Nincs jogosultság korábbi verzió visszaállításához.';
  end if;

  select *
  into v_revision
  from public.blog_post_revisions
  where id = p_revision_id;

  if not found then
    raise exception 'A kiválasztott verzió nem található.';
  end if;

  v_snapshot := v_revision.snapshot;

  update public.blog_posts
  set
    title = v_snapshot->>'title',
    slug = v_snapshot->>'slug',
    excerpt = coalesce(v_snapshot->>'excerpt', ''),
    content_html =
      coalesce(v_snapshot->>'content_html', '<p></p>'),
    content_json =
      coalesce(
        v_snapshot->'content_json',
        '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
      ),
    featured_image_path =
      nullif(v_snapshot->>'featured_image_path', ''),
    author_name =
      coalesce(v_snapshot->>'author_name', 'PandaDesign'),
    status =
      coalesce(v_snapshot->>'status', 'draft'),
    published_at =
      case
        when v_snapshot->>'published_at' is null
        then null
        else (v_snapshot->>'published_at')::timestamptz
      end,
    seo_title =
      coalesce(v_snapshot->>'seo_title', ''),
    seo_description =
      coalesce(v_snapshot->>'seo_description', ''),
    updated_by = auth.uid()
  where id = v_revision.blog_post_id;

  return v_revision.blog_post_id;
end;
$$;

create or replace function public.restore_project_revision(
  p_revision_id bigint
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_revision public.project_revisions%rowtype;
  v_snapshot jsonb;
begin
  if not public.is_admin() then
    raise exception
      'Nincs jogosultság korábbi verzió visszaállításához.';
  end if;

  select *
  into v_revision
  from public.project_revisions
  where id = p_revision_id;

  if not found then
    raise exception 'A kiválasztott verzió nem található.';
  end if;

  v_snapshot := v_revision.snapshot;

  update public.projects
  set
    slug = v_snapshot->>'slug',
    title = v_snapshot->>'title',
    industry =
      coalesce(v_snapshot->>'industry', ''),
    category =
      coalesce(v_snapshot->>'category', 'Egyéb'),
    description =
      coalesce(v_snapshot->>'description', ''),
    image_path =
      nullif(v_snapshot->>'image_path', ''),
    project_url =
      coalesce(v_snapshot->>'project_url', ''),
    sort_order =
      coalesce(
        (v_snapshot->>'sort_order')::integer,
        0
      ),
    is_concept =
      coalesce(
        (v_snapshot->>'is_concept')::boolean,
        false
      ),
    is_visible =
      coalesce(
        (v_snapshot->>'is_visible')::boolean,
        false
      ),
    client_name =
      coalesce(v_snapshot->>'client_name', ''),
    location =
      coalesce(v_snapshot->>'location', ''),
    completed_year =
      coalesce(v_snapshot->>'completed_year', ''),
    duration_label =
      coalesce(v_snapshot->>'duration_label', ''),
    challenge =
      coalesce(v_snapshot->>'challenge', ''),
    solution =
      coalesce(v_snapshot->>'solution', ''),
    results =
      coalesce(
        array(
          select jsonb_array_elements_text(
            coalesce(v_snapshot->'results', '[]'::jsonb)
          )
        ),
        '{}'
      ),
    services =
      coalesce(
        array(
          select jsonb_array_elements_text(
            coalesce(v_snapshot->'services', '[]'::jsonb)
          )
        ),
        '{}'
      ),
    technologies =
      coalesce(
        array(
          select jsonb_array_elements_text(
            coalesce(v_snapshot->'technologies', '[]'::jsonb)
          )
        ),
        '{}'
      ),
    content_html =
      coalesce(v_snapshot->>'content_html', '<p></p>'),
    content_json =
      coalesce(
        v_snapshot->'content_json',
        '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
      ),
    gallery_paths =
      coalesce(
        array(
          select jsonb_array_elements_text(
            coalesce(v_snapshot->'gallery_paths', '[]'::jsonb)
          )
        ),
        '{}'
      ),
    seo_title =
      coalesce(v_snapshot->>'seo_title', ''),
    seo_description =
      coalesce(v_snapshot->>'seo_description', ''),
    cta_title =
      coalesce(
        v_snapshot->>'cta_title',
        'Hasonló weboldalra van szükséged?'
      ),
    cta_text =
      coalesce(
        v_snapshot->>'cta_text',
        'Beszéljük át az elképzelésedet egy díjmentes konzultáción.'
      ),
    cta_button_text =
      coalesce(
        v_snapshot->>'cta_button_text',
        'Ajánlatot kérek'
      ),
    updated_by = auth.uid()
  where id = v_revision.project_id;

  return v_revision.project_id;
end;
$$;

-- ---------------------------------------------------------
-- 10. Függvényjogosultságok
-- ---------------------------------------------------------

revoke all on function
  public.generate_blog_preview_token(uuid, integer)
from public;

revoke all on function
  public.generate_project_preview_token(uuid, integer)
from public;

revoke all on function
  public.revoke_blog_preview_token(uuid)
from public;

revoke all on function
  public.revoke_project_preview_token(uuid)
from public;

revoke all on function
  public.restore_blog_post_revision(bigint)
from public;

revoke all on function
  public.restore_project_revision(bigint)
from public;

grant execute on function
  public.generate_blog_preview_token(uuid, integer)
to authenticated;

grant execute on function
  public.generate_project_preview_token(uuid, integer)
to authenticated;

grant execute on function
  public.revoke_blog_preview_token(uuid)
to authenticated;

grant execute on function
  public.revoke_project_preview_token(uuid)
to authenticated;

grant execute on function
  public.restore_blog_post_revision(bigint)
to authenticated;

grant execute on function
  public.restore_project_revision(bigint)
to authenticated;

grant execute on function
  public.get_blog_post_preview(text)
to anon, authenticated;

grant execute on function
  public.get_project_preview(text)
to anon, authenticated;

-- ---------------------------------------------------------
-- Ellenőrző lekérdezések
-- ---------------------------------------------------------

select
  id,
  title,
  status,
  preview_expires_at
from public.blog_posts
order by updated_at desc;

select
  id,
  title,
  status,
  preview_expires_at
from public.projects
order by updated_at desc;
