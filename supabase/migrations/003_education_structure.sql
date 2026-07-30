-- ============================================
-- AKILIX DATABASE
-- Migration: 003_education_structure.sql
-- ============================================

-- ============================================
-- Link education systems to curriculums
-- ============================================

alter table education_systems
add column if not exists curriculum_id uuid;

alter table education_systems
add constraint fk_education_system_curriculum
foreign key (curriculum_id)
references curriculums(id)
on delete cascade;

-- ============================================
-- Seed Education Systems
-- ============================================

insert into education_systems (
    curriculum_id,
    name,
    description
)
select
    c.id,
    'Competency-Based Education',
    'Kenya Competency-Based Education Pathway'
from curriculums c
where c.short_name='CBE'
and not exists (
    select 1
    from education_systems
    where name='Competency-Based Education'
);

-- ============================================
-- Seed Levels
-- ============================================

insert into levels (
    education_system_id,
    name,
    slug,
    display_order
)

select
    es.id,
    v.name,
    v.slug,
    v.display_order

from education_systems es

cross join (

values
('Pre-Primary','pre-primary',1),
('Primary School','primary-school',2),
('Junior School','junior-school',3),
('Senior School','senior-school',4),
('TVET','tvet',5),
('University','university',6)

) as v(name,slug,display_order)

where es.name='Competency-Based Education'
and not exists (
    select 1
    from levels l
    where l.slug=v.slug
);