-- ============================================
-- AKILIX DATABASE
-- Migration: 004_learning_levels.sql
-- Creates the learning levels for CBE
-- ============================================

create table if not exists learning_levels (
    id uuid primary key default gen_random_uuid(),
    level_id uuid not null references levels(id) on delete cascade,
    name text not null,
    slug text not null unique,
    display_order integer not null,
    created_at timestamptz default now()
);

create index if not exists idx_learning_levels_level
on learning_levels(level_id);

-- ============================================
-- PRE-PRIMARY
-- ============================================

insert into learning_levels (level_id, name, slug, display_order)

select
    l.id,
    v.name,
    v.slug,
    v.display_order

from levels l

cross join (

values
('PP1','pp1',1),
('PP2','pp2',2)

) as v(name,slug,display_order)

where l.slug='pre-primary'
and not exists (
    select 1 from learning_levels where slug=v.slug
);

-- ============================================
-- PRIMARY
-- ============================================

insert into learning_levels (level_id, name, slug, display_order)

select
    l.id,
    v.name,
    v.slug,
    v.display_order

from levels l

cross join (

values
('Grade 1','grade-1',1),
('Grade 2','grade-2',2),
('Grade 3','grade-3',3),
('Grade 4','grade-4',4),
('Grade 5','grade-5',5),
('Grade 6','grade-6',6)

) as v(name,slug,display_order)

where l.slug='primary-school'
and not exists (
    select 1 from learning_levels where slug=v.slug
);

-- ============================================
-- JUNIOR SCHOOL
-- ============================================

insert into learning_levels (level_id, name, slug, display_order)

select
    l.id,
    v.name,
    v.slug,
    v.display_order

from levels l

cross join (

values
('Grade 7','grade-7',1),
('Grade 8','grade-8',2),
('Grade 9','grade-9',3)

) as v(name,slug,display_order)

where l.slug='junior-school'
and not exists (
    select 1 from learning_levels where slug=v.slug
);

-- ============================================
-- SENIOR SCHOOL
-- ============================================

insert into learning_levels (level_id, name, slug, display_order)

select
    l.id,
    v.name,
    v.slug,
    v.display_order

from levels l

cross join (

values
('Grade 10','grade-10',1),
('Grade 11','grade-11',2),
('Grade 12','grade-12',3)

) as v(name,slug,display_order)

where l.slug='senior-school'
and not exists (
    select 1 from learning_levels where slug=v.slug
);