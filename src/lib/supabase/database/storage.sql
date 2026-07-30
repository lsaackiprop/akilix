-- =====================================================
-- Akilix – Storage Buckets & Policies (Sprint 2)
-- Target: Supabase Storage (Postgres 15+)
-- =====================================================
-- Note: policies.sql already contains the same bucket setup.
-- This file exists so buckets can be (re)applied standalone.
-- Run order: schema.sql -> seed.sql -> storage.sql -> policies.sql
-- =====================================================

-- =====================================================
-- 1. Buckets
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
-- 2. Bucket RLS Policies
-- =====================================================

-- -----------------------------------------------------
-- avatars  (public read, write only by owner into own folder)
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- thumbnails (public read; staff or resource-author uploads,
--             stored under <resource_uuid>/filename.ext)
-- -----------------------------------------------------
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
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
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
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------
-- resource-previews (public read; staff or author upload)
-- -----------------------------------------------------
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
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
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
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------
-- resource-files (private – read via signed URL only;
--                 upload by staff or resource author)
-- -----------------------------------------------------
drop policy if exists "resource-files no public read" on storage.objects;
create policy "resource-files no public read"
  on storage.objects for select
  using (bucket_id = 'resource-files' and false);

drop policy if exists "resource-files staff upload" on storage.objects;
create policy "resource-files staff upload"
  on storage.objects for all
  using (
    bucket_id = 'resource-files'
    and auth.uid() is not null
    and (
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
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
      (select coalesce((permissions->>'resources.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'resources.publish')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or exists (
        select 1 from public.resources r
        where r.id::text = (storage.foldername(name))[1]
          and r.author_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------
-- blog-images (public read; write by blog writers/editors)
-- -----------------------------------------------------
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
      (select coalesce((permissions->>'blog.write')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'blog.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'*')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
    )
  )
  with check (
    bucket_id = 'blog-images'
    and auth.uid() is not null
    and (
      (select coalesce((permissions->>'blog.write')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'blog.edit.all')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
      or
      (select coalesce((permissions->>'*')::boolean, false)
         from public.roles r join public.profiles p on p.role_id = r.id where p.id = auth.uid())
    )
  );

-- =====================================================
-- Done
-- =====================================================
do $$ begin raise notice 'Akilix storage.sql applied successfully.'; end $$;
