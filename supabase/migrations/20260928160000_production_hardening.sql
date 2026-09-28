-- PandaDesign production hardening
-- 2026-09-28
--
-- Non-destructive changes:
-- - canonical base URL normalization
-- - missing FK indexes reported by Supabase Performance Advisor
-- - RLS init-plan optimizations
-- - equivalent merge of duplicate permissive SELECT policies

update public.site_settings
set base_url = 'https://www.pandadesign.hu'
where id = 1
  and base_url is distinct from 'https://www.pandadesign.hu';

create index if not exists blog_post_revisions_created_by_idx
  on public.blog_post_revisions (created_by);

create index if not exists blog_posts_created_by_idx
  on public.blog_posts (created_by);

create index if not exists blog_posts_updated_by_idx
  on public.blog_posts (updated_by);

create index if not exists contact_lead_notes_created_by_idx
  on public.contact_lead_notes (created_by);

create index if not exists legal_page_drafts_created_by_idx
  on public.legal_page_drafts (created_by);

create index if not exists legal_page_drafts_updated_by_idx
  on public.legal_page_drafts (updated_by);

create index if not exists legal_page_revisions_created_by_idx
  on public.legal_page_revisions (created_by);

create index if not exists legal_pages_created_by_idx
  on public.legal_pages (created_by);

create index if not exists legal_pages_updated_by_idx
  on public.legal_pages (updated_by);

create index if not exists project_revisions_created_by_idx
  on public.project_revisions (created_by);

create index if not exists projects_created_by_idx
  on public.projects (created_by);

create index if not exists projects_updated_by_idx
  on public.projects (updated_by);

drop policy if exists "Admin can read own record" on public.admin_users;
create policy "Admin can read own record"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can insert lead notes" on public.contact_lead_notes;
create policy "Admins can insert lead notes"
on public.contact_lead_notes
for insert
to authenticated
with check (
  (select public.is_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Admins can update lead notes" on public.contact_lead_notes;
create policy "Admins can update lead notes"
on public.contact_lead_notes
for update
to authenticated
using (
  (select public.is_admin())
  and created_by = (select auth.uid())
)
with check (
  (select public.is_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Admins can insert blog posts" on public.blog_posts;
create policy "Admins can insert blog posts"
on public.blog_posts
for insert
to authenticated
with check (
  (select public.is_admin())
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts"
on public.blog_posts
for update
to authenticated
using ((select public.is_admin()))
with check (
  (select public.is_admin())
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists "Admins can read all legal pages" on public.legal_pages;
drop policy if exists "Authenticated users can read published legal pages"
  on public.legal_pages;

create policy "Authenticated users can read legal pages"
on public.legal_pages
for select
to authenticated
using (
  status = 'published'
  or (select public.is_admin())
);
