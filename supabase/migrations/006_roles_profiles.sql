-- ============================================
-- AKILIX DATABASE
-- Migration: 006_roles_profiles.sql
-- Purpose:
-- Creates Roles and Profiles tables
-- Enables Row Level Security
-- Creates automatic timestamp updates
-- Creates automatic profile creation
-- ============================================

create extension if not exists "pgcrypto";

-- ============================================
-- ROLES
-- ============================================

create table if not exists roles (

    id uuid primary key default gen_random_uuid(),

    name text not null unique,

    description text,

    created_at timestamptz not null default now()

);

insert into roles (name, description)

values

('Student','Learner using Akilix'),

('Teacher','Teacher or Lecturer'),

('Parent','Parent or Guardian'),

('Institution','School, College or University'),

('Administrator','Platform Administrator')

on conflict (name) do nothing;

-- ============================================
-- PROFILES
-- ============================================

create table if not exists profiles (

    id uuid primary key references auth.users(id) on delete cascade,

    email text unique not null,

    full_name text,

    username text unique,

    avatar_url text,

    phone text,

    role_id uuid references roles(id),

    country_id uuid references countries(id),

    curriculum_id uuid references curriculums(id),

    education_system_id uuid references education_systems(id),

    level_id uuid references levels(id),

    learning_level_id uuid references learning_levels(id),

    institution_id uuid,

    bio text,

    is_verified boolean default false,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_profiles_role
on profiles(role_id);

create index if not exists idx_profiles_country
on profiles(country_id);

create index if not exists idx_profiles_curriculum
on profiles(curriculum_id);

create index if not exists idx_profiles_education_system
on profiles(education_system_id);

create index if not exists idx_profiles_level
on profiles(level_id);

create index if not exists idx_profiles_learning_level
on profiles(learning_level_id);

-- ============================================
-- UPDATED_AT FUNCTION
-- ============================================

create or replace function update_updated_at_column()

returns trigger

language plpgsql

as $$

begin

new.updated_at = now();

return new;

end;

$$;

drop trigger if exists trg_profiles_updated_at on profiles;

create trigger trg_profiles_updated_at

before update on profiles

for each row

execute function update_updated_at_column();

-- ============================================
-- ENABLE RLS
-- ============================================

alter table profiles enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

create policy "Users can view their own profile"

on profiles

for select

using (

auth.uid() = id

);

create policy "Users can insert their own profile"

on profiles

for insert

with check (

auth.uid() = id

);

create policy "Users can update their own profile"

on profiles

for update

using (

auth.uid() = id

);

-- ============================================
-- AUTO CREATE PROFILE
-- ============================================

create or replace function public.handle_new_user()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

begin

insert into public.profiles (

id,

email

)

values (

new.id,

new.email

);

return new;

end;

$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created

after insert on auth.users

for each row

execute function public.handle_new_user();