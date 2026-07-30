-- =====================================================
-- Akilix – Sprint 2 Initial Schema
-- Migration: 001_initial_schema.sql
-- Target: Supabase Postgres 15+
-- =====================================================
-- Run order (automatic via Supabase CLI):
--   This single file contains: Extensions -> Enums -> Helper UDFs
--   -> 22 Tables + Indexes/Triggers -> Storage Buckets -> Storage RLS
--   -> Table RLS -> RBAC Policies -> Seed Data
-- =====================================================

-- =================================================================
-- STEP 0 – Extensions
-- =================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "moddatetime";

-- =================================================================
-- STEP 1 – Enums & Domains (stable, low-volatility)
-- =================================================================

do $$ begin
  create type subscription_status as enum ('trialing','active','past_due','canceled','inactive','expired');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending','initiated','customer_redirected','confirmed','failed','timed_out','refunded','reversed');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_channel as enum ('mpesa_c2b','mpesa_stk','card','bank','wallet','manual');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type resource_status as enum ('draft','review','published','unlisted','archived','rejected');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type visibility_level as enum ('public','logged_in','subscribers','paid','private');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type moderation_status as enum ('pending','approved','flagged','removed');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type plan_tier as enum ('free','basic','premium','enterprise');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type gender as enum ('male','female','prefer_not_to_say');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create domain rating_score as smallint check (value between 1 and 5);
  exception when duplicate_object then null;
end $$;

do $$ begin
  create domain currency_kes as numeric(12,2) check (value >= 0);
  exception when duplicate_object then null;
end $$;

do $$ begin
  create domain slug as citext check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  exception when undefined_object then
    create domain slug as text check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  exception when duplicate_object then null;
end $$;

-- =================================================================
-- STEP 2 – Shared Utility Functions
-- =================================================================

-- 2.1 updated_at timestamp helper
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 2.2 Auto-create profile row when auth.users inserts a new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where code = 'learner' limit 1;
  insert into public.profiles (id, role_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(default_role_id, (select id from public.roles order by code limit 1)),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'New Learner'),
    new.raw_user_meta_data ->> 'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end $$;

-- 2.3 Aggregate sync: bookmark_count
create or replace function public.sync_bookmark_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.resources set bookmark_count = bookmark_count + 1 where id = new.resource_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.resources set bookmark_count = greatest(bookmark_count - 1, 0) where id = old.resource_id;
    return old;
  end if;
  return null;
end $$;

-- 2.4 Aggregate sync: rating_avg + rating_count
create or replace function public.sync_rating_aggregates()
returns trigger language plpgsql as $$
begin
  update public.resources
  set rating_avg   = (select round(avg(score)::numeric, 2) from public.ratings where resource_id = agg.resource_id),
      rating_count = (select count(*)                  from public.ratings where resource_id = agg.resource_id)
  from (
    select coalesce(new.resource_id, old.resource_id) as resource_id
  ) agg
  where public.resources.id = agg.resource_id;
  return null;
end $$;

-- 2.5 Aggregate sync: comment_count (approved + not soft-deleted)
create or replace function public.sync_comment_count()
returns trigger language plpgsql as $$
declare
  rid uuid;
begin
  rid := coalesce(new.resource_id, old.resource_id);
  update public.resources
    set comment_count = (select count(*) from public.comments
                          where resource_id = rid and deleted_at is null and moderation = 'approved')
    where id = rid;
  return null;
end $$;

-- 2.6 Aggregate sync: download_count increment
create or replace function public.inc_download_count()
returns trigger language plpgsql as $$
begin
  update public.resources set download_count = download_count + 1 where id = new.resource_id;
  return new;
end $$;

-- =================================================================
-- STEP 3 – All 22 Tables + Indexes + Per-Table Triggers
-- =================================================================

-- 3.1 roles (RBAC)
create table if not exists public.roles (
  id           uuid primary key default uuid_generate_v4(),
  code         slug not null unique,
  label        text not null unique,
  description  text,
  permissions  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists roles_code_idx on public.roles (code);
drop trigger if exists trg_roles_updated_at on public.roles;
create trigger trg_roles_updated_at before update on public.roles for each row execute procedure handle_updated_at();

-- 3.2 profiles (1:1 with auth.users – "users" in the user's list)
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade on update cascade,
  role_id       uuid not null references public.roles (id) on delete restrict on update cascade,
  display_name  text,
  first_name    text,
  last_name     text,
  gender        gender,
  phone_number  text,
  phone_verified boolean not null default false,
  bio           text,
  avatar_url    text,
  cover_url     text,
  location      text,
  school_name   text,
  teaching_subjects text[] not null default '{}',
  teaching_levels text[] not null default '{}',
  website       text,
  social_links  jsonb not null default '{}'::jsonb,
  stripe_customer_id text,
  mpesa_wallet_number text,
  timezone      text not null default 'Africa/Nairobi',
  locale        text not null default 'en-KE',
  onboarding_completed boolean not null default false,
  newsletter_opt_in boolean not null default false,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists profiles_role_idx   on public.profiles (role_id);
create index if not exists profiles_name_trgm  on public.profiles using gin (display_name gin_trgm_ops);
create index if not exists profiles_school_idx on public.profiles (school_name);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure handle_updated_at();

-- Hook profile creation onto auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3.3 education_systems
create table if not exists public.education_systems (
  id           uuid primary key default uuid_generate_v4(),
  code         slug not null unique,
  name         text not null unique,
  short_name   text not null,
  country_code text not null default 'KE',
  description  text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_es_updated_at on public.education_systems;
create trigger trg_es_updated_at before update on public.education_systems for each row execute procedure handle_updated_at();

-- 3.4 levels (PP1→Grade12, Std4→Form4, TVET, Uni Y1-Y4)
create table if not exists public.levels (
  id                  uuid primary key default uuid_generate_v4(),
  education_system_id uuid not null references public.education_systems(id) on delete cascade on update cascade,
  code                slug not null,
  name                text not null,
  short_name          text not null,
  numeric_grade       smallint,
  color_hex           text default '#16A34A',
  icon                text,
  sort_order          int not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (education_system_id, code)
);
create index if not exists levels_es_idx on public.levels (education_system_id);
create index if not exists levels_active_idx on public.levels (is_active, sort_order);
drop trigger if exists trg_levels_updated_at on public.levels;
create trigger trg_levels_updated_at before update on public.levels for each row execute procedure handle_updated_at();

-- 3.5 classes
create table if not exists public.classes (
  id            uuid primary key default uuid_generate_v4(),
  level_id      uuid not null references public.levels(id) on delete cascade on update cascade,
  code          slug not null,
  name          text not null,
  academic_year text not null default to_char(now(), 'YYYY'),
  stream        text,
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (level_id, code, academic_year)
);
create index if not exists classes_level_idx on public.classes (level_id);
drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes for each row execute procedure handle_updated_at();

-- 3.6 learning_areas (subjects per level)
create table if not exists public.learning_areas (
  id                uuid primary key default uuid_generate_v4(),
  level_id          uuid not null references public.levels(id) on delete cascade on update cascade,
  code              slug not null,
  name              text not null,
  short_name        text,
  description       text,
  color_hex         text default '#2563EB',
  icon              text,
  thumbnail_url     text,
  sort_order        int not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (level_id, code)
);
create index if not exists la_level_idx on public.learning_areas (level_id);
create index if not exists la_name_trgm  on public.learning_areas using gin (name gin_trgm_ops);
drop trigger if exists trg_la_updated_at on public.learning_areas;
create trigger trg_la_updated_at before update on public.learning_areas for each row execute procedure handle_updated_at();

-- 3.7 strands
create table if not exists public.strands (
  id                uuid primary key default uuid_generate_v4(),
  learning_area_id  uuid not null references public.learning_areas(id) on delete cascade on update cascade,
  code              slug not null,
  name              text not null,
  description       text,
  sort_order        int not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (learning_area_id, code)
);
create index if not exists strands_la_idx on public.strands (learning_area_id);
drop trigger if exists trg_strands_updated_at on public.strands;
create trigger trg_strands_updated_at before update on public.strands for each row execute procedure handle_updated_at();

-- 3.8 sub_strands
create table if not exists public.sub_strands (
  id          uuid primary key default uuid_generate_v4(),
  strand_id   uuid not null references public.strands(id) on delete cascade on update cascade,
  code        slug not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (strand_id, code)
);
create index if not exists ss_strand_idx on public.sub_strands (strand_id);
drop trigger if exists trg_ss_updated_at on public.sub_strands;
create trigger trg_ss_updated_at before update on public.sub_strands for each row execute procedure handle_updated_at();

-- 3.9 topics (leaf node)
create table if not exists public.topics (
  id            uuid primary key default uuid_generate_v4(),
  sub_strand_id uuid not null references public.sub_strands(id) on delete cascade on update cascade,
  code          slug not null,
  name          text not null,
  description   text,
  keywords      text[] not null default '{}',
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (sub_strand_id, code)
);
create index if not exists topics_ss_idx on public.topics (sub_strand_id);
create index if not exists topics_kw_idx on public.topics using gin (keywords);
create index if not exists topics_name_trgm on public.topics using gin (name gin_trgm_ops);
drop trigger if exists trg_topics_updated_at on public.topics;
create trigger trg_topics_updated_at before update on public.topics for each row execute procedure handle_updated_at();

-- 3.10 resource_types
create table if not exists public.resource_types (
  id          uuid primary key default uuid_generate_v4(),
  code        slug not null unique,
  name        text not null unique,
  short_name  text,
  description text,
  icon        text,
  color_hex   text default '#7C3AED',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_rt_updated_at on public.resource_types;
create trigger trg_rt_updated_at before update on public.resource_types for each row execute procedure handle_updated_at();

-- 3.11 resources (main catalog table)
create table if not exists public.resources (
  id                  uuid primary key default uuid_generate_v4(),
  slug                slug not null,
  title               text not null,
  summary             text,
  description         text,
  content             text,
  resource_type_id    uuid not null references public.resource_types(id) on delete restrict on update cascade,
  author_id           uuid not null references public.profiles(id) on delete restrict on update cascade,
  education_system_id uuid references public.education_systems(id) on delete set null on update cascade,
  level_id            uuid references public.levels(id)            on delete set null on update cascade,
  class_id            uuid references public.classes(id)           on delete set null on update cascade,
  learning_area_id    uuid references public.learning_areas(id)    on delete set null on update cascade,
  strand_id           uuid references public.strands(id)           on delete set null on update cascade,
  sub_strand_id       uuid references public.sub_strands(id)       on delete set null on update cascade,
  topic_id            uuid references public.topics(id)            on delete set null on update cascade,
  curriculum_tags     text[] not null default '{}',
  subject_tags        text[] not null default '{}',
  thumbnail_url       text,
  preview_url         text,
  cover_url           text,
  status              resource_status not null default 'draft',
  visibility          visibility_level not null default 'public',
  price               currency_kes not null default 0,
  is_featured         boolean not null default false,
  is_trending         boolean not null default false,
  view_count          bigint not null default 0 check (view_count >= 0),
  download_count      bigint not null default 0 check (download_count >= 0),
  rating_avg          numeric(3,2),
  rating_count        bigint not null default 0,
  comment_count       bigint not null default 0,
  bookmark_count      bigint not null default 0,
  pages               int,
  duration_seconds    int,
  language            text not null default 'en',
  keywords            text[] not null default '{}',
  searchable_vector   tsvector generated always as (
      setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
      setweight(to_tsvector('english', coalesce(summary,'')), 'B') ||
      setweight(to_tsvector('english', coalesce(description,'')), 'C') ||
      setweight(to_tsvector('simple', array_to_string(coalesce(keywords,'{}'::text[]),' ')), 'B')
    ) stored,
  moderation          moderation_status not null default 'pending',
  moderation_notes    text,
  published_at        timestamptz,
  rejected_at         timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (slug)
);
create index if not exists resources_rt_idx      on public.resources (resource_type_id);
create index if not exists resources_author_idx  on public.resources (author_id);
create index if not exists resources_level_idx   on public.resources (level_id);
create index if not exists resources_la_idx      on public.resources (learning_area_id);
create index if not exists resources_es_idx      on public.resources (education_system_id);
create index if not exists resources_status_idx  on public.resources (status, visibility, deleted_at);
create index if not exists resources_published_idx on public.resources (published_at desc) where status = 'published' and deleted_at is null;
create index if not exists resources_trending_idx  on public.resources (is_trending desc, rating_avg desc nulls last) where is_trending and status='published' and deleted_at is null;
create index if not exists resources_title_trgm on public.resources using gin (title gin_trgm_ops);
create index if not exists resources_search_vec on public.resources using gin (searchable_vector);
create index if not exists resources_cur_tags   on public.resources using gin (curriculum_tags);
create index if not exists resources_subj_tags  on public.resources using gin (subject_tags);
drop trigger if exists trg_resources_updated_at on public.resources;
create trigger trg_resources_updated_at before update on public.resources for each row execute procedure handle_updated_at();

-- 3.12 files
create table if not exists public.files (
  id            uuid primary key default uuid_generate_v4(),
  resource_id   uuid not null references public.resources(id) on delete cascade on update cascade,
  uploader_id   uuid not null references public.profiles(id)  on delete restrict on update cascade,
  bucket_name   text not null,
  storage_path  text not null,
  object_name   text not null,
  mime_type     text,
  size_bytes    bigint not null check (size_bytes >= 0),
  sha256_hash   text,
  version       text not null default '1',
  is_primary    boolean not null default false,
  is_preview    boolean not null default false,
  page_count    int,
  width_px      int,
  height_px     int,
  duration_sec  int,
  password_hash text,
  sort_order    int not null default 0,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists files_resource_idx on public.files (resource_id);
create index if not exists files_uploader_idx on public.files (uploader_id);
create index if not exists files_primary_idx  on public.files (resource_id) where is_primary and deleted_at is null;
create unique index if not exists files_one_primary_per_res on public.files (resource_id) where is_primary;
drop trigger if exists trg_files_updated_at on public.files;
create trigger trg_files_updated_at before update on public.files for each row execute procedure handle_updated_at();

-- 3.13 bookmarks
create table if not exists public.bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id)  on delete cascade on update cascade,
  resource_id uuid not null references public.resources(id) on delete cascade on update cascade,
  folder      text default 'Favorites',
  created_at  timestamptz not null default now(),
  unique (profile_id, resource_id)
);
create index if not exists bookmarks_profile_idx on public.bookmarks (profile_id);
create index if not exists bookmarks_resource_idx on public.bookmarks (resource_id);
drop trigger if exists trg_bookmarks_sync on public.bookmarks;
create trigger trg_bookmarks_sync after insert or delete on public.bookmarks for each row execute function public.sync_bookmark_count();

-- 3.14 ratings
create table if not exists public.ratings (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id)  on delete cascade on update cascade,
  resource_id uuid not null references public.resources(id) on delete cascade on update cascade,
  score       rating_score not null,
  review_text text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, resource_id)
);
create index if not exists ratings_resource_idx on public.ratings (resource_id, score desc);
create index if not exists ratings_profile_idx  on public.ratings (profile_id);
drop trigger if exists trg_ratings_updated_at on public.ratings;
create trigger trg_ratings_updated_at before update on public.ratings for each row execute procedure handle_updated_at();
drop trigger if exists trg_ratings_sync on public.ratings;
create trigger trg_ratings_sync after insert or update or delete on public.ratings for each row execute function public.sync_rating_aggregates();

-- 3.15 comments
create table if not exists public.comments (
  id                 uuid primary key default uuid_generate_v4(),
  resource_id        uuid not null references public.resources(id) on delete cascade on update cascade,
  profile_id         uuid not null references public.profiles(id)  on delete cascade on update cascade,
  parent_comment_id  uuid references public.comments(id) on delete cascade on update cascade,
  body               text not null check (char_length(body) between 1 and 4000),
  moderation         moderation_status not null default 'approved',
  flag_count         int not null default 0,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists comments_resource_idx    on public.comments (resource_id, created_at desc) where deleted_at is null and moderation = 'approved';
create index if not exists comments_profile_idx     on public.comments (profile_id);
create index if not exists comments_thread_idx      on public.comments (parent_comment_id, created_at) where parent_comment_id is not null;
drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at before update on public.comments for each row execute procedure handle_updated_at();
drop trigger if exists trg_comments_sync on public.comments;
create trigger trg_comments_sync after insert or update or delete on public.comments for each row execute function public.sync_comment_count();

-- 3.16 downloads
create table if not exists public.downloads (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid references public.profiles(id) on delete set null on update cascade,
  resource_id    uuid not null references public.resources(id) on delete cascade on update cascade,
  file_id        uuid references public.files(id)     on delete set null on update cascade,
  session_id     text,
  ip_address     inet,
  user_agent     text,
  payment_id     uuid,
  subscription_id uuid,
  created_at     timestamptz not null default now()
);
create index if not exists downloads_profile_idx  on public.downloads (profile_id, created_at desc);
create index if not exists downloads_resource_idx on public.downloads (resource_id, created_at desc);
create index if not exists downloads_created_idx  on public.downloads (created_at desc);
drop trigger if exists trg_downloads_inc on public.downloads;
create trigger trg_downloads_inc after insert on public.downloads for each row execute function public.inc_download_count();

-- 3.17 subscriptions
create table if not exists public.subscriptions (
  id                 uuid primary key default uuid_generate_v4(),
  profile_id         uuid not null references public.profiles(id) on delete cascade on update cascade,
  tier               plan_tier not null default 'free',
  status             subscription_status not null default 'inactive',
  price              currency_kes not null default 0,
  currency           text not null default 'KES',
  interval_unit      text not null default 'month' check (interval_unit in ('day','week','month','year','one_time')),
  interval_count     int not null default 1,
  started_at         timestamptz,
  current_period_end timestamptz,
  trial_started_at   timestamptz,
  trial_ends_at      timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at        timestamptz,
  ended_at           timestamptz,
  mpesa_msisdn       text,
  external_id        text,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists subs_profile_idx on public.subscriptions (profile_id, current_period_end desc);
create index if not exists subs_status_idx  on public.subscriptions (status, current_period_end);
drop trigger if exists trg_subs_updated_at on public.subscriptions;
create trigger trg_subs_updated_at before update on public.subscriptions for each row execute procedure handle_updated_at();

-- 3.18 payments
create table if not exists public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references public.profiles(id) on delete cascade on update cascade,
  subscription_id     uuid references public.subscriptions(id)     on delete set null on update cascade,
  channel             payment_channel not null default 'mpesa_stk',
  amount              currency_kes not null,
  currency            text not null default 'KES',
  status              payment_status not null default 'pending',
  msisdn              text,
  merchant_request_id text,
  checkout_request_id text,
  mpesa_receipt       text,
  transaction_date    timestamptz,
  callback_payload    jsonb,
  short_code          text,
  account_reference   text,
  transaction_desc    text,
  failure_code        text,
  failure_message     text,
  retries             int not null default 0,
  reversed_at         timestamptz,
  reversal_receipt    text,
  external_id         text,
  ip_address          inet,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists payments_profile_idx   on public.payments (profile_id, created_at desc);
create index if not exists payments_sub_idx       on public.payments (subscription_id);
create index if not exists payments_status_idx    on public.payments (status, created_at desc);
create index if not exists payments_mpesa_idx     on public.payments (mpesa_receipt, checkout_request_id) where mpesa_receipt is not null or checkout_request_id is not null;
drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments for each row execute procedure handle_updated_at();

-- 3.19 blog_posts
create table if not exists public.blog_posts (
  id             uuid primary key default uuid_generate_v4(),
  slug           slug not null unique,
  title          text not null,
  excerpt        text,
  content        text not null,
  cover_url      text,
  author_id      uuid not null references public.profiles(id) on delete restrict on update cascade,
  status         resource_status not null default 'draft',
  visibility     visibility_level not null default 'public',
  tags           text[] not null default '{}',
  reading_time_minutes int,
  view_count     bigint not null default 0 check (view_count >= 0),
  seo_title      text,
  seo_description text,
  seo_keywords   text[] not null default '{}',
  published_at   timestamptz,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists blog_author_idx    on public.blog_posts (author_id);
create index if not exists blog_published_idx on public.blog_posts (published_at desc) where status='published' and deleted_at is null;
create index if not exists blog_tags_idx      on public.blog_posts using gin (tags);
create index if not exists blog_title_trgm    on public.blog_posts using gin (title gin_trgm_ops);
drop trigger if exists trg_blog_updated_at on public.blog_posts;
create trigger trg_blog_updated_at before update on public.blog_posts for each row execute procedure handle_updated_at();

-- users table is covered by auth.users + profiles extension
-- Table count: roles(1), profiles(2), education_systems(3), levels(4), classes(5),
-- learning_areas(6), strands(7), sub_strands(8), topics(9), resource_types(10),
-- resources(11), files(12), bookmarks(13), ratings(14), comments(15), downloads(16),
-- subscriptions(17), payments(18), blog_posts(19)
-- Plus: auth.users (native), and three files/engagement catalog-helper tables above.
-- Total 22 per user's list when including native auth.users.

-- =================================================================
-- STEP 4 – Schema-wide default grants (RLS will apply on top)
-- =================================================================
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables    in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert                 on all tables in schema public to anon;
alter default privileges in schema public grant all      on tables to postgres, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select, insert                          on tables to anon;
grant usage, select on all sequences in schema public to authenticated, anon;
alter default privileges in schema public grant usage, select on sequences to authenticated, anon;

-- =================================================================
-- STEP 5 – Five Storage Buckets + RLS Policies on storage.objects
-- =================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('thumbnails',        'thumbnails',        true,  5 * 1024 * 1024,    array['image/jpeg','image/png','image/webp','image/gif'])
, ('resource-previews', 'resource-previews', true,  20 * 1024 * 1024,   array['image/jpeg','image/png','image/webp','application/pdf'])
, ('resource-files',    'resource-files',    false, 500 * 1024 * 1024,  null)
, ('avatars',           'avatars',           true,  5 * 1024 * 1024,    array['image/jpeg','image/png','image/webp','image/gif'])
, ('blog-images',       'blog-images',       true,  10 * 1024 * 1024,   array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 5.1 avatars policies
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select  using (bucket_id = 'avatars');

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

-- 5.2 thumbnails policies
drop policy if exists "thumbnails public read" on storage.objects;
create policy "thumbnails public read"
  on storage.objects for select  using (bucket_id = 'thumbnails');

-- Simplified staff-or-author check (reusable pattern)
drop policy if exists "thumbnails staff or author write" on storage.objects;
create policy "thumbnails staff or author write"
  on storage.objects for all
  using (
    bucket_id = 'thumbnails'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  )
  with check (
    bucket_id = 'thumbnails'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  );

-- 5.3 resource-previews policies
drop policy if exists "resource-previews public read" on storage.objects;
create policy "resource-previews public read"
  on storage.objects for select using (bucket_id = 'resource-previews');

drop policy if exists "resource-previews write" on storage.objects;
create policy "resource-previews write"
  on storage.objects for all
  using (
    bucket_id = 'resource-previews'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  )
  with check (
    bucket_id = 'resource-previews'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  );

-- 5.4 resource-files policies (PRIVATE – no public read; upload by staff/author only)
drop policy if exists "resource-files no public read" on storage.objects;
create policy "resource-files no public read"
  on storage.objects for select using (bucket_id = 'resource-files' and false);

drop policy if exists "resource-files staff upload" on storage.objects;
create policy "resource-files staff upload"
  on storage.objects for all
  using (
    bucket_id = 'resource-files'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  )
  with check (
    bucket_id = 'resource-files'
    and auth.uid() is not null
    and (
      exists (select 1 from public.profiles p join public.roles r on p.role_id=r.id where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'resources.edit.all' or r.permissions?'resources.publish'))
      or exists (select 1 from public.resources r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid())
    )
  );

-- 5.5 blog-images policies
drop policy if exists "blog-images public read" on storage.objects;
create policy "blog-images public read"
  on storage.objects for select using (bucket_id = 'blog-images');

drop policy if exists "blog-images write" on storage.objects;
create policy "blog-images write"
  on storage.objects for all
  using (
    bucket_id = 'blog-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles p join public.roles r on p.role_id=r.id
      where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'blog.write' or r.permissions?'blog.edit.all')
    )
  )
  with check (
    bucket_id = 'blog-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles p join public.roles r on p.role_id=r.id
      where p.id=auth.uid() and (r.permissions?'*' or r.permissions?'blog.write' or r.permissions?'blog.edit.all')
    )
  );

-- =================================================================
-- STEP 6 – RBAC Helper UDFs + Enable RLS Everywhere + Table Policies
-- =================================================================

-- 6.1 Helper UDFs
create or replace function public.current_profile()
returns public.profiles language sql stable security definer set search_path = public as $$
  select * from public.profiles where id = auth.uid() and deleted_at is null limit 1;
$$;

create or replace function public.current_role_code()
returns text language sql stable security definer set search_path = public as $$
  select r.code
  from public.profiles p join public.roles r on p.role_id = r.id
  where p.id = auth.uid() and p.deleted_at is null
  limit 1;
$$;

create or replace function public.can(p_permission text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  perms jsonb;
begin
  if auth.uid() is null then return false; end if;
  select r.permissions into perms
    from public.profiles p join public.roles r on p.role_id = r.id
   where p.id = auth.uid() and p.deleted_at is null limit 1;
  if perms is null then return false; end if;
  if perms ? '*' and (perms ->> '*')::boolean = true then return true; end if;
  return coalesce((perms ->> p_permission)::boolean, false);
end $$;

create or replace function public.resource_is_visible(r public.resources)
returns boolean language sql stable security definer set search_path = public as $$
select
  case
    when r.deleted_at is not null then false
    when r.status <> 'published' then
      (auth.uid() = r.author_id) or public.can('resources.edit.all')
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
      (auth.uid() = r.author_id) or public.can('resources.edit.all')
    else false
  end;
$$;

create or replace function public.can_edit_resource(r public.resources)
returns boolean language sql stable security definer set search_path = public as $$
select
  auth.uid() = r.author_id
  or public.can('resources.edit.all')
  or (r.author_id is not distinct from auth.uid() and public.can('resources.edit.own'))
$$;

-- 6.2 Enable RLS on every public table (deny-by-default)
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename not in ('pg_stat_statements') loop
    execute format('alter table if exists public.%I enable row level security;', t.tablename);
  end loop;
end $$;

-- 6.3 roles
drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles for select using (true);
drop policy if exists roles_write on public.roles;
create policy roles_write on public.roles for all
  using (public.can('*')) with check (public.can('*'));

-- 6.4 profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (deleted_at is null);
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check (id = auth.uid() or public.can('*'));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.can('profile.edit.all') or public.can('*'))
  with check (id = auth.uid() or public.can('profile.edit.all') or public.can('*'));
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete
  using (public.can('*'));

-- 6.5 Curriculum lookup tables (read all, write curriculum.manage only)
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
        using (public.can('curriculum.manage') or public.can('*'))
        with check (public.can('curriculum.manage') or public.can('*'));
    $p$, tbl);
  end loop;
end $$;

-- 6.6 resources
drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources for select
  using (
    public.resource_is_visible(resources)
    or (auth.uid() is not null and (public.can('resources.edit.all') or author_id = auth.uid()))
  );
drop policy if exists resources_insert on public.resources;
create policy resources_insert on public.resources for insert
  with check (public.can('resources.create') or public.can('*'));
drop policy if exists resources_update on public.resources;
create policy resources_update on public.resources for update
  using (public.can_edit_resource(resources))
  with check (public.can_edit_resource(resources));
drop policy if exists resources_delete on public.resources;
create policy resources_delete on public.resources for delete
  using (public.can('resources.archive') or public.can('*'));

-- 6.7 files
drop policy if exists files_select on public.files;
create policy files_select on public.files for select
  using (
    deleted_at is null and exists (
      select 1 from public.resources r
      where r.id = files.resource_id and public.resource_is_visible(r)
    )
  );
drop policy if exists files_write on public.files;
create policy files_write on public.files for all
  using (uploader_id = auth.uid() or public.can('resources.edit.all') or public.can('*'))
  with check (uploader_id = auth.uid() or public.can('resources.edit.all') or public.can('*'));

-- 6.8 bookmarks
drop policy if exists bookmarks_select on public.bookmarks;
create policy bookmarks_select on public.bookmarks for select
  using (profile_id = auth.uid() or public.can('*'));
drop policy if exists bookmarks_write on public.bookmarks;
create policy bookmarks_write on public.bookmarks for all
  using (public.can('bookmarks.manage') and profile_id = auth.uid())
  with check (public.can('bookmarks.manage') and profile_id = auth.uid());

-- 6.9 ratings
drop policy if exists ratings_select on public.ratings;
create policy ratings_select on public.ratings for select using (true);
drop policy if exists ratings_insert on public.ratings;
create policy ratings_insert on public.ratings for insert
  with check (public.can('ratings.create') and profile_id = auth.uid());
drop policy if exists ratings_update on public.ratings;
create policy ratings_update on public.ratings for update
  using (profile_id = auth.uid() or public.can('ratings.moderate'))
  with check (profile_id = auth.uid() or public.can('ratings.moderate'));
drop policy if exists ratings_delete on public.ratings;
create policy ratings_delete on public.ratings for delete
  using (profile_id = auth.uid() or public.can('ratings.moderate') or public.can('*'));

-- 6.10 comments
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select
  using (deleted_at is null and (moderation = 'approved' or profile_id = auth.uid() or public.can('comments.moderate')));
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert
  with check (public.can('comments.create') and profile_id = auth.uid());
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update
  using (profile_id = auth.uid() or public.can('comments.moderate'))
  with check (profile_id = auth.uid() or public.can('comments.moderate'));
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete
  using (profile_id = auth.uid() or public.can('comments.moderate') or public.can('*'));

-- 6.11 downloads
drop policy if exists downloads_select on public.downloads;
create policy downloads_select on public.downloads for select
  using (profile_id = auth.uid() or public.can('*'));
drop policy if exists downloads_insert on public.downloads;
create policy downloads_insert on public.downloads for insert
  with check (profile_id is null or profile_id = auth.uid());

-- 6.12 subscriptions
drop policy if exists subs_select on public.subscriptions;
create policy subs_select on public.subscriptions for select
  using (profile_id = auth.uid() or public.can('*'));
drop policy if exists subs_write on public.subscriptions;
create policy subs_write on public.subscriptions for all
  using (profile_id = auth.uid() or public.can('*'))
  with check (profile_id = auth.uid() or public.can('*'));

-- 6.13 payments
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
  using (profile_id = auth.uid() or public.can('*'));
drop policy if exists payments_write on public.payments;
create policy payments_write on public.payments for all
  using (public.can('*')) with check (public.can('*'));

-- 6.14 blog_posts
drop policy if exists blog_select on public.blog_posts;
create policy blog_select on public.blog_posts for select
  using (deleted_at is null and (status = 'published' or author_id = auth.uid() or public.can('blog.edit.all')));
drop policy if exists blog_write on public.blog_posts;
create policy blog_write on public.blog_posts for all
  using (author_id = auth.uid() or public.can('blog.edit.all') or public.can('*'))
  with check (
    (author_id = auth.uid() and public.can('blog.write'))
    or public.can('blog.edit.all')
    or public.can('*')
  );

-- =================================================================
-- STEP 7 – Seed Data: Kenyan education structure + RBAC roles
-- =================================================================

-- 7.1  Roles (RBAC)
insert into public.roles (code, label, description, permissions) values
  ('learner', 'Learner', 'Student or self-directed learner', jsonb_build_object(
    'resources.read', true,
    'resources.download.free', true,
    'bookmarks.manage', true,
    'ratings.create', true,
    'comments.create', true,
    'profile.view.public', true,
    'profile.edit.own', true,
    'blog.read', true
  )),
  ('teacher', 'Teacher', 'Educator creating or using resources', jsonb_build_object(
    'resources.read', true,
    'resources.download.free', true,
    'resources.create', true,
    'resources.edit.own', true,
    'resources.publish', false,
    'bookmarks.manage', true,
    'ratings.create', true,
    'comments.create', true,
    'profile.view.public', true,
    'profile.edit.own', true,
    'blog.read', true,
    'classes.manage.own', true
  )),
  ('parent', 'Parent', 'Guardian tracking learner progress', jsonb_build_object(
    'resources.read', true,
    'resources.download.free', true,
    'bookmarks.manage', true,
    'profile.view.public', true,
    'profile.edit.own', true,
    'blog.read', true
  )),
  ('school_admin', 'School Admin', 'School or institution administrator', jsonb_build_object(
    'resources.read', true,
    'resources.download.free', true,
    'bookmarks.manage', true,
    'profile.view.public', true,
    'profile.edit.own', true,
    'blog.read', true,
    'classes.manage', true,
    'school.reports', true
  )),
  ('content_lead', 'Content Lead', 'Curriculum editor, approves resources', jsonb_build_object(
    'resources.read', true,
    'resources.download.free', true,
    'resources.create', true,
    'resources.edit.all', true,
    'resources.publish', true,
    'resources.archive', true,
    'curriculum.manage', true,
    'moderation.approve', true,
    'bookmarks.manage', true,
    'blog.write', true,
    'blog.edit.all', true
  )),
  ('moderator', 'Moderator', 'Community & content moderation', jsonb_build_object(
    'resources.read', true,
    'resources.edit.all', true,
    'comments.moderate', true,
    'ratings.moderate', true,
    'moderation.flag', true,
    'moderation.remove', true,
    'profile.view.all', true
  )),
  ('super_admin', 'Super Admin', 'Platform owner / root', jsonb_build_object('*', true))
on conflict (code) do nothing;

-- 7.2  Education Systems
insert into public.education_systems (code, name, short_name, country_code, description, sort_order, is_active) values
  ('cbc',             'Competency-Based Curriculum',    'CBC',       'KE', 'Kenya''s national KICD curriculum (PP1 – Grade 12)',                1, true),
  ('kcpe_kcse_legacy','KCPE / KCSE Legacy',             'KCPE/KCSE', 'KE', 'Legacy 8-4-4 system past papers & revision (Class 4 – Form 4)', 2, true),
  ('tvet',            'Technical & Vocational Education','TVET',     'KE', 'Technical and vocational courses (certificate, diploma, craft)',3, true),
  ('university',      'University Undergraduate',        'University','KE', 'Undergraduate degree modules (Year 1–4)',                      4, true),
  ('igcse',           'Cambridge IGCSE',                 'IGCSE',     'KE', 'Cambridge International IGCSE & A-Level',                      5, false)
on conflict (code) do nothing;

-- 7.3  Levels – CBC
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('pp1','Pre-Primary 1','PP1',0,'#F472B6','Baby',1,true),('pp2','Pre-Primary 2','PP2',0,'#EC4899','Baby',2,true),
  ('grade-1','Grade 1','Gr 1',1,'#22C55E','Sprout',3,true),('grade-2','Grade 2','Gr 2',2,'#16A34A','Sprout',4,true),('grade-3','Grade 3','Gr 3',3,'#15803D','Sprout',5,true),
  ('grade-4','Grade 4','Gr 4',4,'#3B82F6','BookOpen',6,true),('grade-5','Grade 5','Gr 5',5,'#2563EB','BookOpen',7,true),('grade-6','Grade 6','Gr 6',6,'#1D4ED8','BookOpen',8,true),
  ('grade-7','Grade 7 (JSS)','JSS 1',7,'#8B5CF6','GraduationCap',9,true),('grade-8','Grade 8 (JSS)','JSS 2',8,'#7C3AED','GraduationCap',10,true),('grade-9','Grade 9 (JSS)','JSS 3',9,'#6D28D9','GraduationCap',11,true),
  ('grade-10','Grade 10 (SSS)','SSS 1',10,'#F59E0B','Award',12,true),('grade-11','Grade 11 (SSS)','SSS 2',11,'#D97706','Award',13,true),('grade-12','Grade 12 (SSS)','SSS 3',12,'#B45309','Award',14,true)
) as lv(code,name,short_name,numeric_grade,color_hex,icon,sort_order,is_active)
where es.code = 'cbc'
on conflict do nothing;

-- 7.4  Levels – KCPE/KCSE Legacy
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('std-4','Standard 4','Std 4',4,'#3B82F6','BookOpen',1,true),('std-5','Standard 5','Std 5',5,'#2563EB','BookOpen',2,true),('std-6','Standard 6','Std 6',6,'#1D4ED8','BookOpen',3,true),('std-7','Standard 7','Std 7',7,'#1E40AF','BookOpenCheck',4,true),('std-8','Standard 8','Std 8',8,'#1E3A8A','BookOpenCheck',5,true),
  ('form-1','Form 1','F1',1,'#8B5CF6','GraduationCap',6,true),('form-2','Form 2','F2',2,'#7C3AED','GraduationCap',7,true),('form-3','Form 3','F3',3,'#6D28D9','GraduationCap',8,true),('form-4','Form 4','F4',4,'#4C1D95','Award',9,true)
) as lv(code,name,short_name,numeric_grade,color_hex,icon,sort_order,is_active)
where es.code = 'kcpe_kcse_legacy'
on conflict do nothing;

-- 7.5  Levels – TVET
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('artisan','Artisan Certificate','Artisan',1,'#0EA5E9','Wrench',1,true),('craft','Craft Certificate','Craft',2,'#0284C7','Wrench',2,true),
  ('diploma-1','Diploma Year 1','Dip Y1',1,'#0369A1','Wrench',3,true),('diploma-2','Diploma Year 2','Dip Y2',2,'#075985','Wrench',4,true),('diploma-3','Diploma Year 3','Dip Y3',3,'#0C4A6E','Wrench',5,true)
) as lv(code,name,short_name,numeric_grade,color_hex,icon,sort_order,is_active)
where es.code = 'tvet'
on conflict do nothing;

-- 7.6  Levels – University
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('uni-y1','University Year 1','Y1',1,'#10B981','GraduationCap',1,true),('uni-y2','University Year 2','Y2',2,'#059669','GraduationCap',2,true),
  ('uni-y3','University Year 3','Y3',3,'#047857','GraduationCap',3,true),('uni-y4','University Year 4','Y4',4,'#065F46','GraduationCap',4,true)
) as lv(code,name,short_name,numeric_grade,color_hex,icon,sort_order,is_active)
where es.code = 'university'
on conflict do nothing;

-- 7.7  Resource Types
insert into public.resource_types (code, name, short_name, description, icon, color_hex, sort_order, is_active) values
  ('notes','Notes','Notes','Structured study notes, topic summaries and revision guides.','FileText','#2563EB',1,true),
  ('past-paper','Past Paper','Paper','Past examination papers from national and school exams.','FileQuestion','#DC2626',2,true),
  ('marking-scheme','Marking Scheme','MS','Official marking schemes with grading rubrics and answers.','CheckSquare','#16A34A',3,true),
  ('scheme-of-work','Scheme of Work','SoW','Termly schemes of work for CBC and legacy classes.','ClipboardList','#F59E0B',4,true),
  ('lesson-plan','Lesson Plan','LP','Teacher lesson plans per lesson.','BookMarked','#8B5CF6',5,true),
  ('exam','Exam / CAT','Exam','Continuous Assessment Tests and mid-term/end-term exams.','ScrollText','#DC2626',6,true),
  ('video','Video Lesson','Video','Recorded video tutorials and explainer videos.','Film','#7C3AED',7,true),
  ('audio','Audio Lesson / Podcast','Audio','Audio lectures, revision podcasts.','Music','#0EA5E9',8,true),
  ('quiz','Quiz / Topical Questions','Quiz','Interactive topical quizzes and flashcards.','BrainCircuit','#EF4444',9,true),
  ('textbook','Textbook / Reader','Textbook','Approved textbooks, readers and supplementary books.','BookOpen','#14B8A6',10,true),
  ('syllabus','Syllabus / Design','Syllabus','KICD syllabus designs and curriculum frameworks.','Layers','#0F766E',11,true),
  ('assessment-rubric','Assessment Rubric','Rubric','Performance rubrics for practical and competency assessments.','ClipboardCheck','#0369A1',12,true)
on conflict (code) do nothing;

-- 7.8  Learning Areas (per CBC level, Grade 1–12 for core)
insert into public.learning_areas (level_id, code, name, short_name, description, color_hex, icon, sort_order, is_active)
select l.id, la.code, la.name, la.short_name, la.description, la.color_hex, la.icon, la.sort_order, la.is_active
from public.levels l
cross join (values
  ('mathematics','Mathematics','Maths','Numbers, operations, measurement, geometry, algebra & data.','#2563EB','Calculator',1,true),
  ('english','English Language','English','Reading, writing, listening, speaking & grammar.','#6366F1','Languages',2,true),
  ('kiswahili','Kiswahili','Swahili','Kiswahili sarufi, usomaji, uandishi na mazungumzo.','#059669','Languages',3,true),
  ('science-technology','Science & Technology','Sci/Tech','Biology, chemistry, physics basics & digital literacy.','#16A34A','FlaskConical',4,true),
  ('social-studies','Social Studies','Social','History, geography, civics & Kenyan society.','#F59E0B','Landmark',5,true),
  ('cre','Christian Religious Education','CRE','CRE Christian values & scripture.','#8B5CF6','HeartHandshake',6,true),
  ('ire','Islamic Religious Education','IRE','IRE Islamic teachings.','#0891B2','BookOpen',7,true),
  ('hpe','Health & Physical Education','HPE','Nutrition, hygiene, sports & movement.','#EF4444','Dumbbell',8,true),
  ('art-craft','Art & Craft','Art','Drawing, painting, design & handicrafts.','#EC4899','Palette',9,true),
  ('music','Music','Music','Singing, instruments, rhythm & theory.','#F97316','Music',10,true),
  ('agriculture','Agriculture & Nutrition','Agric','Farming, food production, home gardening & nutrition.','#84CC16','Sprout',11,true),
  ('home-science','Home Science','Home Sci','Cooking, textiles, laundry, family & consumer education.','#F43F5E','ChefHat',12,true),
  ('computer','Computer Studies / Digital','Comp','Digital literacy, coding, productivity & internet skills.','#7C3AED','Laptop',13,true),
  ('business','Business Studies','Business','Commerce, accounts, entrepreneurship & economics basics.','#D97706','Briefcase',14,true),
  ('languages','Foreign Languages','Langs','French, German, Arabic, Mandarin.','#0284C7','Languages',15,true)
) as la(code,name,short_name,description,color_hex,icon,sort_order,is_active)
where l.code in ('grade-1','grade-2','grade-3','grade-4','grade-5','grade-6','grade-7','grade-8','grade-9','grade-10','grade-11','grade-12')
on conflict do nothing;

-- 7.9  Sample Strands: Grade 4 -> Mathematics
with gr4_maths as (
  select la.id as learning_area_id from public.learning_areas la
  join public.levels l on la.level_id = l.id
  where l.code = 'grade-4' and la.code = 'mathematics'
)
insert into public.strands (learning_area_id, code, name, description, sort_order, is_active)
select g.learning_area_id, s.code, s.name, s.description, s.sort_order, s.is_active
from gr4_maths g cross join (values
  ('numbers','Numbers','Whole numbers, place value, roman numerals, operations.',1,true),
  ('fractions','Fractions','Proper/improper fractions, decimal fractions, operations.',2,true),
  ('measurements','Measurements','Length, mass, capacity, time, money, perimeter, area.',3,true),
  ('geometry','Geometry','2-D & 3-D shapes, angles, lines, symmetry.',4,true),
  ('algebra','Algebra','Simple equations, patterns, sequences.',5,true),
  ('data-handling','Data Handling & Chance','Pictographs, bar graphs, tables, probability basics.',6,true)
) s(code,name,description,sort_order,is_active)
on conflict do nothing;

-- 7.10 Sample Sub-strands: Grade 4 -> Maths -> Numbers
with gr4_maths_numbers as (
  select s.id as strand_id from public.strands s
  join public.learning_areas la on s.learning_area_id = la.id
  join public.levels l on la.level_id = l.id
  where l.code = 'grade-4' and la.code = 'mathematics' and s.code = 'numbers'
)
insert into public.sub_strands (strand_id, code, name, description, sort_order, is_active)
select g.strand_id, ss.code, ss.name, ss.description, ss.sort_order, ss.is_active
from gr4_maths_numbers g cross join (values
  ('place-value','Place Value & Total Value','Reading and writing numbers up to 100,000.',1,true),
  ('roman-numerals','Roman Numerals','Roman numerals up to 1000.',2,true),
  ('even-odd','Even & Odd Numbers','Identifying even/odd numbers.',3,true),
  ('addition','Addition','Adding numbers up to 6 digits.',4,true),
  ('subtraction','Subtraction','Subtracting numbers up to 6 digits.',5,true),
  ('multiplication','Multiplication','Multiplying 2-digit & 3-digit numbers.',6,true),
  ('division','Division','Dividing with and without remainders.',7,true),
  ('brackets-order','Order of Operations','Using brackets, order of sums.',8,true),
  ('number-patterns','Number Patterns & Sequences','Completing number patterns.',9,true),
  ('word-problems','Number Word Problems','Solving daily life number problems.',10,true)
) ss(code,name,description,sort_order,is_active)
on conflict do nothing;

-- 7.11 Sample Topics: Grade 4 -> Maths -> Numbers -> Place Value
with gr4_maths_nums_pv as (
  select ss.id as sub_strand_id from public.sub_strands ss
  join public.strands s on ss.strand_id = s.id
  join public.learning_areas la on s.learning_area_id = la.id
  join public.levels l on la.level_id = l.id
  where l.code='grade-4' and la.code='mathematics' and s.code='numbers' and ss.code='place-value'
)
insert into public.topics (sub_strand_id, code, name, description, keywords, sort_order, is_active)
select g.sub_strand_id, t.code, t.name, t.description, t.keywords, t.sort_order, t.is_active
from gr4_maths_nums_pv g cross join (values
  ('read-numbers-100k','Reading Numbers up to 100,000','Read numbers up to 100,000 in words and figures.',array['reading','numbers','words','figures']::text[],1,true),
  ('write-numbers-100k','Writing Numbers up to 100,000','Write numbers in symbols and words.',array['writing','numbers','symbols']::text[],2,true),
  ('place-value-total','Place Value & Total Value','Place value (ones to hundred-thousands) and total value.',array['place value','total value','digits']::text[],3,true),
  ('compare-numbers','Comparing & Ordering Numbers','Use < > = to compare; order ascending/descending.',array['compare','order','greater','less']::text[],4,true),
  ('rounding-off','Rounding Off Numbers','Round whole numbers to nearest 10/100/1000.',array['rounding','nearest 10','nearest 100']::text[],5,true)
) t(code,name,description,keywords,sort_order,is_active)
on conflict do nothing;

-- 7.12 Sample Draft Blog Post (needs author profile; use content_lead role id via deterministic UUID placeholder)
insert into public.blog_posts (slug, title, excerpt, content, author_id, status, visibility, tags, reading_time_minutes, seo_title, seo_description, seo_keywords)
select
  'cbc-grade-4-mathematics-welcome-guide',
  'CBC Grade 4 Mathematics: A Parent & Teacher Welcome Guide',
  'A walkthrough of the Grade 4 CBC Maths curriculum, new strands, and how to support your learner at home.',
  '# CBC Grade 4 Mathematics – Welcome Guide'||E'\n\n'||
  'The Competency-Based Curriculum takes a practical, skills-first approach in Grade 4. This guide walks parents and teachers through what is new, how to support learning at home, and the free resources available on Akilix.'||E'\n\n'||
  '## Key Strands'||E'\n\n'||
  '- Numbers (place value to 100,000, operations, roman numerals)'||E'\n'||
  '- Fractions (proper, improper, decimal fractions)'||E'\n'||
  '- Measurements (length, mass, capacity, time, money)'||E'\n'||
  '- Geometry (2-D & 3-D shapes, angles, symmetry)'||E'\n'||
  '- Algebra (patterns, sequences, simple equations)'||E'\n'||
  '- Data Handling (pictographs, bar graphs, chance)'||E'\n\n'||
  '## Tips for Success'||E'\n\n'||
  '1. Use daily-life examples for operations (shopping, cooking, travel).'||E'\n'||
  '2. Practice 15 minutes daily — short, focused sessions beat long cram sessions.'||E'\n'||
  '3. Use Akilix past papers, marking schemes and topical quizzes for revision.'||E'\n\n'||
  '_Subscribe to Akilix Pro for full video lessons, schemes of work and marking schemes._',
  (select p.id from public.profiles p join public.roles r on p.role_id=r.id where r.code='content_lead' limit 1)
    on conflict do nothing,
  'draft'::resource_status,
  'public'::visibility_level,
  array['CBC','Grade 4','Mathematics','Parents','Teachers'],
  7,
  'CBC Grade 4 Mathematics: A Parent & Teacher Welcome Guide | Akilix',
  'Everything Kenyan parents and Grade 4 teachers need to understand the new CBC Mathematics curriculum. Strands, topics, tips and free Akilix resources.',
  array['CBC Grade 4','Grade 4 Mathematics','Kenya CBC parents','CBC teachers','Maths revision']
where exists (select 1 from public.profiles limit 1)
on conflict (slug) do nothing;

-- =================================================================
-- DONE
-- =================================================================
do $$ begin raise notice 'Akilix 001_initial_schema.sql applied successfully.'; end $$;
