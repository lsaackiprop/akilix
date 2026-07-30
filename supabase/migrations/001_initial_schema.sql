-- ============================================
-- AKILIX DATABASE
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- EDUCATION SYSTEMS
-- ============================================

create table if not exists education_systems (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz default now()
);

-- ============================================
-- LEVELS
-- ============================================

create table if not exists levels (
    id uuid primary key default gen_random_uuid(),
    education_system_id uuid not null references education_systems(id) on delete cascade,
    name text not null,
    slug text not null unique,
    display_order integer not null,
    created_at timestamptz default now()
);

-- ============================================
-- LEARNING AREAS
-- ============================================

create table if not exists learning_areas (
    id uuid primary key default gen_random_uuid(),
    level_id uuid not null references levels(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_levels_system
on levels (education_system_id);

create index if not exists idx_learning_area_level
on learning_areas (level_id);