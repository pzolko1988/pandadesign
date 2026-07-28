-- =========================================================
-- PandaDesign – Blog CMS
-- =========================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),

  title text not null
    check (char_length(trim(title)) between 3 and 180),

  slug text not null
    check (
      char_length(slug) between 3 and 180
      and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  excerpt text not null default ''
    check (char_length(excerpt) <= 500),

  content_html text not null default '',
  content_json jsonb not null default
    '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,

  featured_image_path text,

  author_name text not null default 'PandaDesign',

  status text not null default 'draft'
    check (status in ('draft', 'published')),

  published_at timestamptz,

  seo_title text not null default ''
    check (char_length(seo_title) <= 180),

  seo_description text not null default ''
    check (char_length(seo_description) <= 500),

  created_by uuid
    references auth.users(id)
    on delete set null,

  updated_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists blog_posts_slug_unique_idx
  on public.blog_posts (lower(slug));

create index if not exists blog_posts_publication_idx
  on public.blog_posts (
    status,
    published_at desc
  );

create index if not exists blog_posts_updated_idx
  on public.blog_posts (updated_at desc);

-- =========================================================
-- Automatikus időbélyegek
-- =========================================================

create or replace function public.update_blog_post_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();

  if new.status = 'published'
     and (
       tg_op = 'INSERT'
       or old.status <> 'published'
       or new.published_at is null
     ) then
    new.published_at = coalesce(new.published_at, now());
  end if;

  if new.status = 'draft' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_blog_post_timestamps
  on public.blog_posts;

create trigger set_blog_post_timestamps
before insert or update on public.blog_posts
for each row
execute function public.update_blog_post_timestamps();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.blog_posts enable row level security;

grant select
  on table public.blog_posts
  to anon;

grant select, insert, update, delete
  on table public.blog_posts
  to authenticated;

drop policy if exists "Public can read published blog posts"
  on public.blog_posts;

create policy "Public can read published blog posts"
on public.blog_posts
for select
to anon
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

drop policy if exists "Admins can read all blog posts"
  on public.blog_posts;

create policy "Admins can read all blog posts"
on public.blog_posts
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert blog posts"
  on public.blog_posts;

create policy "Admins can insert blog posts"
on public.blog_posts
for insert
to authenticated
with check (
  public.is_admin()
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

drop policy if exists "Admins can update blog posts"
  on public.blog_posts;

create policy "Admins can update blog posts"
on public.blog_posts
for update
to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
);

drop policy if exists "Admins can delete blog posts"
  on public.blog_posts;

create policy "Admins can delete blog posts"
on public.blog_posts
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Supabase Storage – blogképek
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'blog-media',
  'blog-media',
  true,
  8388608,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read blog media"
  on storage.objects;

create policy "Public can read blog media"
on storage.objects
for select
to public
using (bucket_id = 'blog-media');

drop policy if exists "Admins can upload blog media"
  on storage.objects;

create policy "Admins can upload blog media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-media'
  and public.is_admin()
);

drop policy if exists "Admins can update blog media"
  on storage.objects;

create policy "Admins can update blog media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-media'
  and public.is_admin()
)
with check (
  bucket_id = 'blog-media'
  and public.is_admin()
);

drop policy if exists "Admins can delete blog media"
  on storage.objects;

create policy "Admins can delete blog media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-media'
  and public.is_admin()
);

select
  id,
  title,
  slug,
  status,
  published_at,
  updated_at
from public.blog_posts
order by updated_at desc;
