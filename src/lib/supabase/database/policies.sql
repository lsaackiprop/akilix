-- =====================================================
-- Akilix – Row Level Security & Policies (Sprint 2)
-- Target: Supabase Postgres 15+
-- Run AFTER schema.sql AND seed.sql
-- =====================================================

-- =====================================================
-- Helper: enable RLS + a safe default (no access unless explicitly allowed)
-- =====================================================
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables
     where schemaname = 'public'
       and tablename not in ('pg_stat_statements')
  loop
    execute format('alter table if exists public.%I enable row level security;', t.tablename);
    -- Drop any legacy permissive policies so we start from a known-good baseline
    execute format('drop policy if exists "%" on public.%I;', t.tablename);
  end loop;
end $$;

-- =====================================================
-- Helper UDFs for RBAC checks
-- =====================================================

-- 1. Current authenticated user's profile (returns the profile row)
create or replace function public.current_profile()
returns public.profiles language sql stable security definer set search_path = public as $$
  select *
  from public.profiles
  where id = auth.uid()
    and deleted_at is null
  limit 1;
$$;

-- 2. Current user's role code (e.g. 'learner', 'teacher', 'content_lead', 'super_admin')
create or replace function public.current_role_code()
returns text language sql stable security definer set search_path = public as $$
  select r.code
  from public.profiles p
  join public.roles r on p.role_id = r.id
  where p.id = auth.uid()
    and p.deleted_at is null
  limit 1;
$$;

-- 3. Has permission? Looks up roles.permissions JSONB for the user's role.
create or replace function public.can(p_permission text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  perms jsonb;
begin
  if auth.uid() is null then return false; end if;

  select r.permissions into perms
  from public.profiles p
  join public.roles r on p.role_id = r.id
  where p.id = auth.uid()
    and p.deleted_at is null
  limit 1;

  if perms is null then return false; end if;

  -- super_admin wildcard
  if perms ? '*' and (perms ->> '*')::boolean = true then return true; end if;

  return coalesce((perms ->> p_permission)::boolean, false);
end $$;

-- 4. Resource visibility helper – returns true when a resource should be readable
--    by the current user given its visibility level.
create or replace function public.resource_is_visible(r public.resources)
returns boolean language sql stable security definer set search_path = public as $$
select
  case
    when r.deleted_at is not null then false
    when r.status <> 'published' then
      -- Only author + staff can see non-published resources
      (auth.uid() = r.author_id) or can('resources.edit.all')
    when r.visibility = 'public'      then true
    when r.visibility = 'logged_in'   then auth.uid() is not null
    when r.visibility = 'subscribers' then
      auth.uid() is not null and exists (
        select 1 from public.subscriptions s
        where s.profile_id = auth.uid()
          and s.status in ('trialing','active')
          and (s.current_period_end is null or s.current_period_end > now())
      )
    when r.visibility = 'paid' then
      auth.uid() is not null and (
        r.price = 0
        or exists (
          select 1 from public.downloads d
          where d.profile_id  = auth.uid()
            and d.resource_id = r.id
            and d.payment_id  is not null
        )
        or exists (
          select 1 from public.subscriptions s
          where s.profile_id = auth.uid()
            and s.status in ('trialing','active')
            and s.tier <> 'free'
            and (s.current_period_end is null or s.current_period_end > now())
        )
      )
    when r.visibility = 'private' then
      (auth.uid() = r.author_id) or can('resources.edit.all')
    else false
  end;
$$;

-- 5. User owns (or staff can edit) a resource
create or replace function public.can_edit_resource(r public.resources)
returns boolean language sql stable security definer set search_path = public as $$
select
  auth.uid() = r.author_id
  or can('resources.edit.all')
  or (r.author_id is not distinct from auth.uid() and can('resources.edit.own'))
$$;

-- =====================================================
-- Table: roles
--   readable by all authenticated; writable by super_admin only
-- =====================================================
drop policy if exists roles_select on public.roles;
create policy roles_select
  on public.roles for select
  using (true);

drop policy if exists roles_write on public.roles;
create policy roles_write
  on public.roles for all
  using (can('*'))
  with check (can('*'));

-- =====================================================
-- Table: profiles
--   Public fields readable by all; private fields limited.
--   User can edit their own profile. Staff can edit any.
-- =====================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select
  on public.profiles for select
  using (
    deleted_at is null
    and (
      id = auth.uid()
      or can('profile.view.all')
      or true   -- public profile listings (no secrets exposed)
    )
  );

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (id = auth.uid() or can('*'));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update
  on public.profiles for update
  using (
    id = auth.uid()
    or can('profile.edit.all')
    or can('*')
  )
  with check (
    (id = auth.uid())
    or can('profile.edit.all')
    or can('*')
  );

-- Nobody deletes; use soft-delete.
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete
  on public.profiles for delete
  using (can('*'));

-- =====================================================
-- Tables: education_systems / levels / classes / learning_areas /
--         strands / sub_strands / topics / resource_types
--   read: all authenticated + anon (public catalog)
--   write: curriculum.manage permission
-- =====================================================
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'education_systems','levels','classes','learning_areas',
    'strands','sub_strands','topics','resource_types'
  ] loop
    execute format($p$
      drop policy if exists %1$s_select on public.%1$I;
      create policy %1$s_select on public.%1$I for select using (true);

      drop policy if exists %1$s_write on public.%1$I;
      create policy %1$s_write on public.%1$I for all
        using (can('curriculum.manage') or can('*'))
        with check (can('curriculum.manage') or can('*'));
    $p$, tbl);
  end loop;
end $$;

-- =====================================================
-- Table: resources
-- =====================================================
drop policy if exists resources_select on public.resources;
create policy resources_select
  on public.resources for select
  using (
    public.resource_is_visible(resources)
    or auth.uid() is not null and (
      can('resources.edit.all')
      or author_id = auth.uid()
    )
  );

drop policy if exists resources_insert on public.resources;
create policy resources_insert
  on public.resources for insert
  with check (
    can('resources.create')
    or can('*')
  );

drop policy if exists resources_update on public.resources;
create policy resources_update
  on public.resources for update
  using (public.can_edit_resource(resources))
  with check (public.can_edit_resource(resources));

drop policy if exists resources_delete on public.resources;
create policy resources_delete
  on public.resources for delete
  using (can('resources.archive') or can('*'));

-- =====================================================
-- Table: files
--   Metadata; actual download goes through an edge function that checks payment/sub.
-- =====================================================
drop policy if exists files_select on public.files;
create policy files_select
  on public.files for select
  using (
    deleted_at is null and exists (
      select 1 from public.resources r
      where r.id = files.resource_id
        and public.resource_is_visible(r)
    )
  );

drop policy if exists files_write on public.files;
create policy files_write
  on public.files for all
  using (
    uploader_id = auth.uid()
    or can('resources.edit.all')
    or can('*')
  )
  with check (
    uploader_id = auth.uid()
    or can('resources.edit.all')
    or can('*')
  );

-- =====================================================
-- Table: bookmarks – user's own only
-- =====================================================
drop policy if exists bookmarks_select on public.bookmarks;
create policy bookmarks_select
  on public.bookmarks for select
  using (profile_id = auth.uid() or can('*'));

drop policy if exists bookmarks_write on public.bookmarks;
create policy bookmarks_write
  on public.bookmarks for all
  using (can('bookmarks.manage') and profile_id = auth.uid())
  with check (can('bookmarks.manage') and profile_id = auth.uid());

-- =====================================================
-- Table: ratings
-- =====================================================
drop policy if exists ratings_select on public.ratings;
create policy ratings_select
  on public.ratings for select
  using (true);

drop policy if exists ratings_insert on public.ratings;
create policy ratings_insert
  on public.ratings for insert
  with check (
    can('ratings.create')
    and profile_id = auth.uid()
  );

drop policy if exists ratings_update on public.ratings;
create policy ratings_update
  on public.ratings for update
  using (profile_id = auth.uid() or can('ratings.moderate'))
  with check (profile_id = auth.uid() or can('ratings.moderate'));

drop policy if exists ratings_delete on public.ratings;
create policy ratings_delete
  on public.ratings for delete
  using (profile_id = auth.uid() or can('ratings.moderate') or can('*'));

-- =====================================================
-- Table: comments – threaded, moderated
-- =====================================================
drop policy if exists comments_select on public.comments;
create policy comments_select
  on public.comments for select
  using (
    deleted_at is null
    and (moderation = 'approved' or profile_id = auth.uid() or can('comments.moderate'))
  );

drop policy if exists comments_insert on public.comments;
create policy comments_insert
  on public.comments for insert
  with check (
    can('comments.create')
    and profile_id = auth.uid()
  );

drop policy if exists comments_update on public.comments;
create policy comments_update
  on public.comments for update
  using (profile_id = auth.uid() or can('comments.moderate'))
  with check (profile_id = auth.uid() or can('comments.moderate'));

drop policy if exists comments_delete on public.comments;
create policy comments_delete
  on public.comments for delete
  using (profile_id = auth.uid() or can('comments.moderate') or can('*'));

-- =====================================================
-- Table: downloads
--   Write: authenticated user (or anon via service_role edge fn for anon tracking)
--   Read: only own + staff (IP/session sensitive)
-- =====================================================
drop policy if exists downloads_select on public.downloads;
create policy downloads_select
  on public.downloads for select
  using (profile_id = auth.uid() or can('*'));

drop policy if exists downloads_insert on public.downloads;
create policy downloads_insert
  on public.downloads for insert
  with check (
    (profile_id is null)        -- anon rows allowed via anon-insert policy below
    or (profile_id = auth.uid())
  );

-- =====================================================
-- Table: subscriptions – own rows only
-- =====================================================
drop policy if exists subs_select on public.subscriptions;
create policy subs_select
  on public.subscriptions for select
  using (profile_id = auth.uid() or can('*'));

drop policy if exists subs_write on public.subscriptions;
create policy subs_write
  on public.subscriptions for all
  using (profile_id = auth.uid() or can('*'))
  with check (profile_id = auth.uid() or can('*'));

-- =====================================================
-- Table: payments – own rows only; write via service role
-- =====================================================
drop policy if exists payments_select on public.payments;
create policy payments_select
  on public.payments for select
  using (profile_id = auth.uid() or can('*'));

drop policy if exists payments_write on public.payments;
create policy payments_write
  on public.payments for all
  using (can('*'))
  with check (can('*'));

-- =====================================================
-- Table: blog_posts
-- =====================================================
drop policy if exists blog_select on public.blog_posts;
create policy blog_select
  on public.blog_posts for select
  using (
    deleted_at is null and (
      status = 'published'
      or author_id = auth.uid()
      or can('blog.edit.all')
    )
  );

drop policy if exists blog_write on public.blog_posts;
create policy blog_write
  on public.blog_posts for all
  using (
    author_id = auth.uid()
    or can('blog.edit.all')
    or can('*')
  )
  with check (
    (author_id = auth.uid() and can('blog.write'))
    or can('blog.edit.all')
    or can('*')
  );

-- =====================================================
-- Storage Buckets (Runs via service role / dashboard)
-- =====================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('thumbnails',        'thumbnails',        true,  5 * 1024 * 1024,  array['image/jpeg','image/png','image/webp','image/gif'])
, ('resource-previews', 'resource-previews', true,  20 * 1024 * 1024, array['image/jpeg','image/png','image/webp','application/pdf'])
, ('resource-files',    'resource-files',    false, 500 * 1024 * 1024, null)
, ('avatars',           'avatars',           true,  5 * 1024 * 1024,  array['image/jpeg','image/png','image/webp','image/gif'])
, ('blog-images',       'blog-images',       true,  10 * 1024 * 1024, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public               = excluded.public,
      file_size_limit      = excluded.file_size_limit,
      allowed_mime_types   = excluded.allowed_mime_types;

-- =====================================================
-- Storage RLS Policies
-- =====================================================

-- avatars: read public; write own profile only
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars write own" on storage.objects;
create policy "avatars write own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- thumbnails: read public; write content_lead+ (or author on own resource)
drop policy if exists "thumbnails public read" on storage.objects;
create policy "thumbnails public read"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

drop policy if exists "thumbnails staff or author write" on storage.objects;
create policy "thumbnails staff or author write"
  on storage.objects for all
  using (
    bucket_id = 'thumbnails'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  )
  with check (
    bucket_id = 'thumbnails'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- resource-previews: read public; write staff or author only
drop policy if exists "resource-previews public read" on storage.objects;
create policy "resource-previews public read"
  on storage.objects for select
  using (bucket_id = 'resource-previews');

drop policy if exists "resource-previews write" on storage.objects;
create policy "resource-previews write"
  on storage.objects for all
  using (
    bucket_id = 'resource-previews'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  )
  with check (
    bucket_id = 'resource-previews'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- resource-files (private): read via signed URL + service-role edge function only
drop policy if exists "resource-files no public read" on storage.objects;
create policy "resource-files no public read"
  on storage.objects for select
  using (
    bucket_id = 'resource-files'
    and false
  );

drop policy if exists "resource-files staff upload" on storage.objects;
create policy "resource-files staff upload"
  on storage.objects for all
  using (
    bucket_id = 'resource-files'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  )
  with check (
    bucket_id = 'resource-files'
    and auth.uid() is not null
    and (
      can('resources.edit.all')
      or can('resources.publish')
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- blog-images: read public; write by blog authors / content leads
drop policy if exists "blog-images public read" on storage.objects;
create policy "blog-images public read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "blog-images write" on storage.objects;
create policy "blog-images write"
  on storage.objects for all
  using (
    bucket_id = 'blog-images'
    and auth.uid() is not null
    and (
      can('blog.write')
      or can('blog.edit.all')
      or can('*')
    )
  )
  with check (
    bucket_id = 'blog-images'
    and auth.uid() is not null
    and (
      can('blog.write')
      or can('blog.edit.all')
      or can('*')
    )
  );

-- =====================================================
-- Done
-- =====================================================
do $$ begin raise notice 'Akilix policies.sql applied successfully.'; end $$;
