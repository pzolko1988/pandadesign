-- Split public and authenticated SELECT policies so anonymous SSR reads
-- never need EXECUTE permission on public.is_admin().

drop policy if exists "Visible FAQ items are public and admins read all"
  on public.faq_items;
create policy "Public can read active FAQ items"
  on public.faq_items
  for select
  to anon
  using (is_active = true);
create policy "Authenticated can read FAQ items"
  on public.faq_items
  for select
  to authenticated
  using (is_active = true or (select public.is_admin()));

drop policy if exists "Visible pricing packages are public and admins read all"
  on public.pricing_packages;
create policy "Public can read visible pricing packages"
  on public.pricing_packages
  for select
  to anon
  using (is_visible = true);
create policy "Authenticated can read pricing packages"
  on public.pricing_packages
  for select
  to authenticated
  using (is_visible = true or (select public.is_admin()));

drop policy if exists "Visible process steps are public and admins read all"
  on public.process_steps;
create policy "Public can read visible process steps"
  on public.process_steps
  for select
  to anon
  using (is_visible = true);
create policy "Authenticated can read process steps"
  on public.process_steps
  for select
  to authenticated
  using (is_visible = true or (select public.is_admin()));

drop policy if exists "Visible projects are public and admins read all"
  on public.projects;
create policy "Public can read visible projects"
  on public.projects
  for select
  to anon
  using (is_visible = true);
create policy "Authenticated can read projects"
  on public.projects
  for select
  to authenticated
  using (is_visible = true or (select public.is_admin()));

drop policy if exists "Visible services are public and admins read all"
  on public.services;
create policy "Public can read visible services"
  on public.services
  for select
  to anon
  using (is_visible = true);
create policy "Authenticated can read services"
  on public.services
  for select
  to authenticated
  using (is_visible = true or (select public.is_admin()));

drop policy if exists "Public can read visible navigation items"
  on public.site_navigation_items;
create policy "Public can read visible navigation items"
  on public.site_navigation_items
  for select
  to anon
  using (is_visible = true);
create policy "Authenticated can read navigation items"
  on public.site_navigation_items
  for select
  to authenticated
  using (is_visible = true or (select public.is_admin()));
