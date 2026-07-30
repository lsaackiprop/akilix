-- ============================================
-- AKILIX DATABASE
-- Migration: 002_seed_education_systems.sql
-- Adds Countries and Curriculums
-- ============================================

-- ============================================
-- COUNTRIES
-- ============================================

create table if not exists countries (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    code text not null unique,
    created_at timestamptz default now()
);

-- ============================================
-- CURRICULUMS
-- ============================================

create table if not exists curriculums (
    id uuid primary key default gen_random_uuid(),
    country_id uuid not null references countries(id) on delete cascade,
    name text not null,
    short_name text,
    created_at timestamptz default now()
);

create index if not exists idx_curriculums_country
on curriculums(country_id);

-- ============================================
-- SEED DATA
-- ============================================

insert into countries (name, code)
values ('Kenya', 'KE')
on conflict (code) do nothing;

insert into curriculums (country_id, name, short_name)
select
    id,
    'Competency-Based Education',
    'CBE'
from countries
where code = 'KE'
on conflict do nothing;