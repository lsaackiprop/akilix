-- =====================================================
-- Akilix – Production Schema (Sprint 2, Phase 9)
-- Target: Supabase Postgres 15+
-- =====================================================
-- Extensions --------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "moddatetime";

-- =====================================================
-- Part 1 – Enums & Domains (stable, low-volatility)
-- =====================================================

do $$ begin
  -- Subscription lifecycle
  create type subscription_status as enum ('trialing','active','past_due','canceled','inactive','expired');
  exception when duplicate_object then null;
end $$;

do $$ begin
  -- MPESA / payment state machine
  create type payment_status as enum ('pending','initiated','customer_redirected','confirmed','failed','timed_out','refunded','reversed');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_channel as enum ('mpesa_c2b','mpesa_stk','card','bank','wallet','manual');
  exception when duplicate_object then null;
end $$;

do $$ begin
  -- Resource workflow
  create type resource_status as enum ('draft','review','published','unlisted','archived','rejected');
  exception when duplicate_object then null;
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
  -- Subscription tiers (aligned with PricingSection)
  create type plan_tier as enum ('free','basic','premium','enterprise');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type gender as enum ('male','female','prefer_not_to_say');
  exception when duplicate_object then null;
end $$;

-- Rating score domain (1..5 integer)
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
    -- citext may not be created; fall back to text + lowercase trigger
    create domain slug as text check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  exception when duplicate_object then null;
end $$;

-- =====================================================
-- Helper: updated_at trigger (run per table)
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Helper: keep profile.id == auth.id on new user (trigger on auth.users, below)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where code = 'learner' limit 1;
  insert into public.profiles (id, role_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(default_role_id, (select id from public.roles limit 1)),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'New Learner'),
    new.raw_user_meta_data ->> 'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end $$;

-- =====================================================
-- Part 2 – Reference/Lookup Tables (inserted by seed.sql)
-- =====================================================

-- 2.1 roles
create table if not exists public.roles (
  id           uuid primary key default uuid_generate_v4(),
  code         slug not null unique,                 -- learner, teacher, parent, school_admin, content_lead, moderator, super_admin
  label        text not null unique,
  description  text,
  permissions  jsonb not null default '{}'::jsonb,   -- granular RBAC bits { "resources.publish": true, ... }
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists roles_code_idx on public.roles (code);
drop trigger if exists trg_roles_updated_at on public.roles;
create trigger trg_roles_updated_at before update on public.roles for each row execute procedure handle_updated_at();

-- =====================================================
-- Part 3 – User Identity (1:1 with auth.users)
-- =====================================================

-- 3.1 profiles ("users" in user's list – extends auth.users, never creates auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade on update cascade,
  role_id       uuid not null references public.roles (id) on delete restrict on update cascade,
  display_name  text,
  first_name    text,
  last_name     text,
  gender        gender,
  phone_number  text,                 -- Kenyan E.164: +254...
  phone_verified boolean not null default false,
  bio           text,
  avatar_url    text,                 -- path in storage.avatars bucket, e.g. "<uuid>/avatar.png"
  cover_url     text,
  location      text,                 -- free text: "Nairobi" / "Kisumu"
  school_name   text,                 -- for learners: "Moi Primary, Kabarak"
  teaching_subjects text[] not null default '{}',   -- teacher only: [Mathematics,English,Kiswahili]
  teaching_levels text[] not null default '{}',     -- teacher only: ["Grade 4","Grade 5"]
  website       text,
  social_links  jsonb not null default '{}'::jsonb,  -- { twitter, linkedin, youtube }
  stripe_customer_id text,
  mpesa_wallet_number text,           -- last used M-Pesa number for 1-tap topup
  timezone      text not null default 'Africa/Nairobi',
  locale        text not null default 'en-KE',
  onboarding_completed boolean not null default false,
  newsletter_opt_in boolean not null default false,
  deleted_at    timestamptz,          -- soft delete
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists profiles_role_idx   on public.profiles (role_id);
create index if not exists profiles_name_trgm  on public.profiles using gin (display_name gin_trgm_ops);
create index if not exists profiles_school_idx on public.profiles (school_name);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure handle_updated_at();

-- Attach handle_new_user to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- Part 4 – CBC Curriculum Hierarchy (education systems)
-- =====================================================

-- 4.1 education_systems – CBC, TVET, University, IGCSE, KCPE/KCSE legacy, etc.
create table if not exists public.education_systems (
  id           uuid primary key default uuid_generate_v4(),
  code         slug not null unique,           -- cbc, tvet, university, igcse, kcse_legacy
  name         text not null unique,
  short_name   text not null,                  -- CBC, TVET, Uni...
  country_code text not null default 'KE',
  description  text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_es_updated_at on public.education_systems;
create trigger trg_es_updated_at before update on public.education_systems for each row execute procedure handle_updated_at();

-- 4.2 levels – PP1, Grade 1, ..., Grade 12, Diploma Y1, BSc Y1, etc.
create table if not exists public.levels (
  id                uuid primary key default uuid_generate_v4(),
  education_system_id uuid not null references public.education_systems(id) on delete cascade on update cascade,
  code              slug not null,
  name              text not null,
  short_name        text not null,
  numeric_grade     smallint,                        -- 1..12 for CBC, 1..4 for Uni
  color_hex         text default '#16A34A',          -- emerald-600 default
  icon              text,                            -- Lucide icon name
  sort_order        int not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (education_system_id, code)
);
create index if not exists levels_es_idx on public.levels (education_system_id);
create index if not exists levels_active_idx on public.levels (is_active, sort_order);
drop trigger if exists trg_levels_updated_at on public.levels;
create trigger trg_levels_updated_at before update on public.levels for each row execute procedure handle_updated_at();

-- 4.3 classes – specific term/year grouping (optional grouping e.g. "Grade 4 Red", "Form 2 East")
create table if not exists public.classes (
  id            uuid primary key default uuid_generate_v4(),
  level_id      uuid not null references public.levels(id) on delete cascade on update cascade,
  code          slug not null,
  name          text not null,
  academic_year text not null default to_char(now(), 'YYYY'),
  stream        text,                              -- "North", "South", "A", "B"
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (level_id, code, academic_year)
);
create index if not exists classes_level_idx on public.classes (level_id);
drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes for each row execute procedure handle_updated_at();

-- 4.4 learning_areas (subjects): Maths, English, Kiswahili, Science & Tech, CRE, etc.
create table if not exists public.learning_areas (
  id                uuid primary key default uuid_generate_v4(),
  level_id          uuid not null references public.levels(id) on delete cascade on update cascade,
  code              slug not null,
  name              text not null,
  short_name        text,
  description       text,
  color_hex         text default '#2563EB',
  icon              text,                           -- Lucide icon name
  thumbnail_url     text,                           -- storage.thumbnails bucket path
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

-- 4.5 strands – 1st level under learning area (CBC grouping)
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

-- 4.6 sub_strands – 2nd level under strand
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

-- 4.7 topics – leaf node, what a resource attaches to
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

-- =====================================================
-- Part 5 – Resource Library
-- =====================================================

-- 5.1 resource_types – Notes, Past Paper, Marking Scheme, Scheme of Work, Lesson Plan, Exam, Video, Audio, Quiz, Book
create table if not exists public.resource_types (
  id          uuid primary key default uuid_generate_v4(),
  code        slug not null unique,
  name        text not null unique,
  short_name  text,
  description text,
  icon        text,                         -- Lucide icon name
  color_hex   text default '#7C3AED',       -- violet-600 default
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_rt_updated_at on public.resource_types;
create trigger trg_rt_updated_at before update on public.resource_types for each row execute procedure handle_updated_at();

-- 5.2 resources – the main catalog table
create table if not exists public.resources (
  id                  uuid primary key default uuid_generate_v4(),
  slug                slug not null,
  title               text not null,
  summary             text,                        -- 1-liner for cards
  description         text,                        -- rich markdown/html body
  content             text,                        -- full body (markdown)
  resource_type_id    uuid not null references public.resource_types(id) on delete restrict on update cascade,
  author_id           uuid not null references public.profiles(id) on delete restrict on update cascade,
  -- Curriculum anchors – nullable, but at least learning_area_id is expected
  education_system_id uuid references public.education_systems(id) on delete set null on update cascade,
  level_id            uuid references public.levels(id)            on delete set null on update cascade,
  class_id            uuid references public.classes(id)           on delete set null on update cascade,
  learning_area_id    uuid references public.learning_areas(id)    on delete set null on update cascade,
  strand_id           uuid references public.strands(id)           on delete set null on update cascade,
  sub_strand_id       uuid references public.sub_strands(id)       on delete set null on update cascade,
  topic_id            uuid references public.topics(id)            on delete set null on update cascade,
  -- Free-text curriculum tags (for flexible cross-curriculum search)
  curriculum_tags     text[] not null default '{}',
  subject_tags        text[] not null default '{}',
  -- Display
  thumbnail_url       text,                        -- storage.thumbnails path
  preview_url         text,                        -- storage.resource-previews path (PDF first pages, watermarked)
  cover_url           text,
  -- Access control
  status              resource_status not null default 'draft',
  visibility          visibility_level not null default 'public',
  price               currency_kes not null default 0,   -- 0 = free
  is_featured         boolean not null default false,
  is_trending         boolean not null default false,
  -- Aggregates (kept in sync via triggers)
  view_count          bigint not null default 0 check (view_count >= 0),
  download_count      bigint not null default 0 check (download_count >= 0),
  rating_avg          numeric(3,2),                       -- cached 1.00 – 5.00
  rating_count        bigint not null default 0,
  comment_count       bigint not null default 0,
  bookmark_count      bigint not null default 0,
  -- Meta
  pages               int,                                 -- for documents
  duration_seconds    int,                                 -- for audio/video
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
  deleted_at          timestamptz,                    -- soft delete
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

-- 5.3 files – every attachment under a resource (a resource may have N files:
--            PDF + answers PDF + audio mp3 + docx, etc.)
create table if not exists public.files (
  id            uuid primary key default uuid_generate_v4(),
  resource_id   uuid not null references public.resources(id) on delete cascade on update cascade,
  uploader_id   uuid not null references public.profiles(id)  on delete restrict on update cascade,
  bucket_name   text not null,                                 -- resource-files (or thumbnails/previews – keep self-describing)
  storage_path  text not null,                                 -- e.g. "<resource_uuid>/document.pdf"
  object_name   text not null,                                 -- user-facing filename
  mime_type     text,
  size_bytes    bigint not null check (size_bytes >= 0),
  sha256_hash   text,                                          -- content integrity
  version       text not null default '1',                     -- if we re-upload revised papers
  is_primary    boolean not null default false,                -- which file is the "main download"
  is_preview    boolean not null default false,                -- watermarked preview copy
  page_count    int,
  width_px      int,
  height_px     int,
  duration_sec  int,
  password_hash text,                                          -- if protected (e.g., marking schemes released later)
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

-- =====================================================
-- Part 6 – Engagement: bookmarks, ratings, comments, downloads
-- =====================================================

-- 6.1 bookmarks
create table if not exists public.bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id)  on delete cascade on update cascade,
  resource_id uuid not null references public.resources(id) on delete cascade on update cascade,
  folder      text default 'Favorites',                     -- simple folder label
  created_at  timestamptz not null default now(),
  unique (profile_id, resource_id)
);
create index if not exists bookmarks_profile_idx on public.bookmarks (profile_id);
create index if not exists bookmarks_resource_idx on public.bookmarks (resource_id);

-- Trigger: maintain resources.bookmark_count
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

drop trigger if exists trg_bookmarks_sync on public.bookmarks;
create trigger trg_bookmarks_sync after insert or delete on public.bookmarks for each row execute function public.sync_bookmark_count();

-- 6.2 ratings (1..5 stars, 1 per user+resource)
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

-- Trigger: maintain resources.rating_avg + rating_count
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

drop trigger if exists trg_ratings_sync on public.ratings;
create trigger trg_ratings_sync after insert or update or delete on public.ratings for each row execute function public.sync_rating_aggregates();

-- 6.3 comments (threaded via parent_comment_id)
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

-- Trigger: maintain resources.comment_count
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

drop trigger if exists trg_comments_sync on public.comments;
create trigger trg_comments_sync after insert or update or delete on public.comments for each row execute function public.sync_comment_count();

-- 6.4 downloads (track every legitimate download – after free/payment/sub check)
create table if not exists public.downloads (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid references public.profiles(id) on delete set null on update cascade,  -- nullable (anon downloads still tracked via session_id)
  resource_id    uuid not null references public.resources(id) on delete cascade on update cascade,
  file_id        uuid references public.files(id)     on delete set null on update cascade,
  session_id     text,                               -- linkable to auth.session if needed
  ip_address     inet,
  user_agent     text,
  payment_id     uuid,                               -- if paid → payment row
  subscription_id uuid,                              -- if subscription → subscription row
  created_at     timestamptz not null default now()
);
create index if not exists downloads_profile_idx  on public.downloads (profile_id, created_at desc);
create index if not exists downloads_resource_idx on public.downloads (resource_id, created_at desc);
create index if not exists downloads_created_idx  on public.downloads (created_at desc);

-- Trigger: increment resources.download_count
create or replace function public.inc_download_count()
returns trigger language plpgsql as $$
begin
  update public.resources set download_count = download_count + 1 where id = new.resource_id;
  return new;
end $$;

drop trigger if exists trg_downloads_inc on public.downloads;
create trigger trg_downloads_inc after insert on public.downloads for each row execute function public.inc_download_count();

-- =====================================================
-- Part 7 – Commerce: subscriptions, payments
-- =====================================================

-- 7.1 subscriptions
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
  mpesa_msisdn       text,                             -- last used number, for 1-tap renew
  external_id        text,                             -- e.g. Stripe/Chargily subscription id
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists subs_profile_idx on public.subscriptions (profile_id, current_period_end desc);
create index if not exists subs_status_idx  on public.subscriptions (status, current_period_end);
drop trigger if exists trg_subs_updated_at on public.subscriptions;
create trigger trg_subs_updated_at before update on public.subscriptions for each row execute procedure handle_updated_at();

-- 7.2 payments (MPESA Daraja + future providers)
create table if not exists public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references public.profiles(id) on delete cascade on update cascade,
  subscription_id     uuid references public.subscriptions(id)     on delete set null on update cascade,
  channel             payment_channel not null default 'mpesa_stk',
  amount              currency_kes not null,
  currency            text not null default 'KES',
  status              payment_status not null default 'pending',
  -- MPESA Daraja payload mapping
  msisdn              text,                                   -- customer phone (initiating)
  merchant_request_id text,                                   -- Daraja MerchantRequestID
  checkout_request_id text,                                   -- Daraja CheckoutRequestID
  mpesa_receipt       text,                                   -- e.g. "OEI2AK4Q16"
  transaction_date    timestamptz,                            -- from M-Pesa payload
  callback_payload    jsonb,                                  -- full stkpush callback JSON
  short_code          text,
  account_reference   text,                                   -- e.g. user id / order id
  transaction_desc    text,
  -- Failures
  failure_code        text,
  failure_message     text,
  retries             int not null default 0,
  -- Reversal
  reversed_at         timestamptz,
  reversal_receipt    text,
  external_id         text,                                   -- Stripe charge id etc.
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

-- =====================================================
-- Part 8 – Blog / Content Marketing
-- =====================================================

-- 8.1 blog_posts
create table if not exists public.blog_posts (
  id             uuid primary key default uuid_generate_v4(),
  slug           slug not null unique,
  title          text not null,
  excerpt        text,
  content        text not null,                  -- markdown body
  cover_url      text,                           -- storage.blog-images bucket path
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

-- =====================================================
-- Part 9 – Grant basic usage to authenticated (before row-level policies kick in)
-- =====================================================
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables    in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert                 on all tables in schema public to anon;
alter default privileges in schema public grant all      on tables to postgres, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select, insert                          on tables to anon;
grant usage, select on all sequences in schema public to authenticated, anon;
alter default privileges in schema public grant usage, select on sequences to authenticated, anon;
