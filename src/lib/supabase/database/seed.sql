-- =====================================================
-- Akilix – Seed Data (Sprint 2, Phase 9)
-- Target: Supabase Postgres 15+
-- Run AFTER schema.sql
-- =====================================================

-- =====================================================
-- 1. Roles – RBAC foundation
-- =====================================================
insert into public.roles (code, label, description, permissions) values
  ('learner', 'Learner', 'Student or self-directed learner', '{
    "resources.read": true,
    "resources.download.free": true,
    "bookmarks.manage": true,
    "ratings.create": true,
    "comments.create": true,
    "profile.view.public": true,
    "profile.edit.own": true,
    "blog.read": true
  }'),
  ('teacher', 'Teacher', 'Educator creating or using resources', '{
    "resources.read": true,
    "resources.download.free": true,
    "resources.create": true,
    "resources.edit.own": true,
    "resources.publish": false,
    "bookmarks.manage": true,
    "ratings.create": true,
    "comments.create": true,
    "profile.view.public": true,
    "profile.edit.own": true,
    "blog.read": true,
    "classes.manage.own": true
  }'),
  ('parent', 'Parent', 'Guardian tracking learner progress', '{
    "resources.read": true,
    "resources.download.free": true,
    "bookmarks.manage": true,
    "profile.view.public": true,
    "profile.edit.own": true,
    "blog.read": true
  }'),
  ('school_admin', 'School Admin', 'School or institution administrator', '{
    "resources.read": true,
    "resources.download.free": true,
    "bookmarks.manage": true,
    "profile.view.public": true,
    "profile.edit.own": true,
    "blog.read": true,
    "classes.manage": true,
    "school.reports": true
  }'),
  ('content_lead', 'Content Lead', 'Curriculum editor, approves resources', '{
    "resources.read": true,
    "resources.download.free": true,
    "resources.create": true,
    "resources.edit.all": true,
    "resources.publish": true,
    "resources.archive": true,
    "curriculum.manage": true,
    "moderation.approve": true,
    "bookmarks.manage": true,
    "blog.write": true,
    "blog.edit.all": true
  }'),
  ('moderator', 'Moderator', 'Community & content moderation', '{
    "resources.read": true,
    "resources.edit.all": true,
    "comments.moderate": true,
    "ratings.moderate": true,
    "moderation.flag": true,
    "moderation.remove": true,
    "profile.view.all": true
  }'),
  ('super_admin', 'Super Admin', 'Platform owner / root', '{
    "*": true
  }')
on conflict (code) do nothing;

-- =====================================================
-- 2. Education Systems – Kenya-focused
-- =====================================================
insert into public.education_systems (code, name, short_name, country_code, description, sort_order, is_active) values
  ('cbc', 'Competency-Based Curriculum', 'CBC', 'KE', 'Kenya''s national KICD curriculum (PP1 – Grade 12)', 1, true),
  ('kcpe_kcse_legacy', 'KCPE / KCSE Legacy', 'KCPE/KCSE', 'KE', 'Legacy 8-4-4 system past papers & revision (Class 4 – Form 4)', 2, true),
  ('tvet', 'Technical & Vocational Education', 'TVET', 'KE', 'Technical and vocational courses (certificate, diploma, craft)', 3, true),
  ('university', 'University Undergraduate', 'University', 'KE', 'Undergraduate degree modules (Year 1–4)', 4, true),
  ('igcse', 'Cambridge IGCSE', 'IGCSE', 'KE', 'Cambridge International IGCSE & A-Level for international schools', 5, false)
on conflict (code) do nothing;

-- =====================================================
-- 3. Levels – CBC hierarchy first (PP1→Grade 12)
-- =====================================================
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('pp1',       'Pre-Primary 1',       'PP1',  0, '#F472B6', 'Baby',       1,  true),
  ('pp2',       'Pre-Primary 2',       'PP2',  0, '#EC4899', 'Baby',       2,  true),
  ('grade-1',   'Grade 1',             'Gr 1', 1, '#22C55E', 'Sprout',     3,  true),
  ('grade-2',   'Grade 2',             'Gr 2', 2, '#16A34A', 'Sprout',     4,  true),
  ('grade-3',   'Grade 3',             'Gr 3', 3, '#15803D', 'Sprout',     5,  true),
  ('grade-4',   'Grade 4',             'Gr 4', 4, '#3B82F6', 'BookOpen',   6,  true),
  ('grade-5',   'Grade 5',             'Gr 5', 5, '#2563EB', 'BookOpen',   7,  true),
  ('grade-6',   'Grade 6',             'Gr 6', 6, '#1D4ED8', 'BookOpen',   8,  true),
  ('grade-7',   'Grade 7 (JSS)',       'JSS 1', 7, '#8B5CF6', 'GraduationCap', 9,  true),
  ('grade-8',   'Grade 8 (JSS)',       'JSS 2', 8, '#7C3AED', 'GraduationCap', 10, true),
  ('grade-9',   'Grade 9 (JSS)',       'JSS 3', 9, '#6D28D9', 'GraduationCap', 11, true),
  ('grade-10',  'Grade 10 (SSS)',      'SSS 1', 10, '#F59E0B', 'Award',     12, true),
  ('grade-11',  'Grade 11 (SSS)',      'SSS 2', 11, '#D97706', 'Award',     13, true),
  ('grade-12',  'Grade 12 (SSS)',      'SSS 3', 12, '#B45309', 'Award',     14, true)
) as lv(code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
where es.code = 'cbc'
on conflict do nothing;

-- KCPE/KCSE legacy levels
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('std-4',  'Standard 4',   'Std 4', 4, '#3B82F6', 'BookOpen',      1, true),
  ('std-5',  'Standard 5',   'Std 5', 5, '#2563EB', 'BookOpen',      2, true),
  ('std-6',  'Standard 6',   'Std 6', 6, '#1D4ED8', 'BookOpen',      3, true),
  ('std-7',  'Standard 7',   'Std 7', 7, '#1E40AF', 'BookOpenCheck', 4, true),
  ('std-8',  'Standard 8',   'Std 8', 8, '#1E3A8A', 'BookOpenCheck', 5, true),
  ('form-1', 'Form 1',       'F1',    1, '#8B5CF6', 'GraduationCap', 6, true),
  ('form-2', 'Form 2',       'F2',    2, '#7C3AED', 'GraduationCap', 7, true),
  ('form-3', 'Form 3',       'F3',    3, '#6D28D9', 'GraduationCap', 8, true),
  ('form-4', 'Form 4',       'F4',    4, '#4C1D95', 'Award',         9, true)
) as lv(code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
where es.code = 'kcpe_kcse_legacy'
on conflict do nothing;

-- TVET
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('artisan',      'Artisan Certificate',      'Artisan',   1, '#0EA5E9', 'Wrench',  1, true),
  ('craft',        'Craft Certificate',        'Craft',     2, '#0284C7', 'Wrench',  2, true),
  ('diploma-1',    'Diploma Year 1',           'Dip Y1',    1, '#0369A1', 'Wrench',  3, true),
  ('diploma-2',    'Diploma Year 2',           'Dip Y2',    2, '#075985', 'Wrench',  4, true),
  ('diploma-3',    'Diploma Year 3',           'Dip Y3',    3, '#0C4A6E', 'Wrench',  5, true)
) as lv(code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
where es.code = 'tvet'
on conflict do nothing;

-- University
insert into public.levels (education_system_id, code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
select es.id, lv.code, lv.name, lv.short_name, lv.numeric_grade, lv.color_hex, lv.icon, lv.sort_order, lv.is_active
from public.education_systems es
cross join (values
  ('uni-y1', 'University Year 1', 'Y1', 1, '#10B981', 'GraduationCap', 1, true),
  ('uni-y2', 'University Year 2', 'Y2', 2, '#059669', 'GraduationCap', 2, true),
  ('uni-y3', 'University Year 3', 'Y3', 3, '#047857', 'GraduationCap', 3, true),
  ('uni-y4', 'University Year 4', 'Y4', 4, '#065F46', 'GraduationCap', 4, true)
) as lv(code, name, short_name, numeric_grade, color_hex, icon, sort_order, is_active)
where es.code = 'university'
on conflict do nothing;

-- =====================================================
-- 4. Resource Types
-- =====================================================
insert into public.resource_types (code, name, short_name, description, icon, color_hex, sort_order, is_active) values
  ('notes',              'Notes',                    'Notes',      'Structured study notes, topic summaries and revision guides.', 'FileText',     '#2563EB', 1, true),
  ('past-paper',         'Past Paper',               'Paper',      'Past examination papers from national and school exams.',     'FileQuestion', '#DC2626', 2, true),
  ('marking-scheme',     'Marking Scheme',           'MS',         'Official marking schemes with grading rubrics and answers.',  'CheckSquare',  '#16A34A', 3, true),
  ('scheme-of-work',     'Scheme of Work',           'SoW',        'Termly schemes of work for CBC and legacy classes.',         'ClipboardList','#F59E0B', 4, true),
  ('lesson-plan',        'Lesson Plan',              'LP',         'Teacher lesson plans per lesson.',                            'BookMarked',   '#8B5CF6', 5, true),
  ('exam',               'Exam / CAT',               'Exam',       'Continuous Assessment Tests and mid-term/end-term exams.',    'ScrollText',   '#DC2626', 6, true),
  ('video',              'Video Lesson',             'Video',      'Recorded video tutorials and explainer videos.',              'Film',         '#7C3AED', 7, true),
  ('audio',              'Audio Lesson / Podcast',   'Audio',      'Audio lectures, revision podcasts.',                          'Music',        '#0EA5E9', 8, true),
  ('quiz',               'Quiz / Topical Questions', 'Quiz',       'Interactive topical quizzes and flashcards.',                 'BrainCircuit', '#EF4444', 9, true),
  ('textbook',           'Textbook / Reader',        'Textbook',   'Approved textbooks, readers and supplementary books.',       'BookOpen',     '#14B8A6', 10, true),
  ('syllabus',           'Syllabus / Design',        'Syllabus',   'KICD syllabus designs and curriculum frameworks.',            'Layers',       '#0F766E', 11, true),
  ('assessment-rubric',  'Assessment Rubric',        'Rubric',     'Performance rubrics for practical and competency assessments.','ClipboardCheck','#0369A1', 12, true)
on conflict (code) do nothing;

-- =====================================================
-- 5. Learning Areas (CBC, Grade 1–9 first pass)
--    Attached per level (so Grade 1 Maths ≠ Grade 7 Maths in hierarchy)
-- =====================================================

-- Helper: insert a learning area for every CBC level (Gr 1–9 for core subjects)
insert into public.learning_areas (level_id, code, name, short_name, description, color_hex, icon, sort_order, is_active)
select l.id, la.code, la.name, la.short_name, la.description, la.color_hex, la.icon, la.sort_order, la.is_active
from public.levels l
cross join (values
  ('mathematics',        'Mathematics',                 'Maths',    'Numbers, operations, measurement, geometry, algebra & data.', '#2563EB', 'Calculator',   1, true),
  ('english',            'English Language',            'English',  'Reading, writing, listening, speaking & grammar.',            '#6366F1', 'Languages',    2, true),
  ('kiswahili',          'Kiswahili',                   'Swahili',  'Kiswahili sarufi, usomaji, uandishi na mazungumzo.',          '#059669', 'Languages',    3, true),
  ('science-technology', 'Science & Technology',        'Sci/Tech', 'Biology, chemistry, physics basics & digital literacy.',      '#16A34A', 'FlaskConical',4, true),
  ('social-studies',     'Social Studies',              'Social',   'History, geography, civics & Kenyan society.',                '#F59E0B', 'Landmark',     5, true),
  ('cre',                'Christian Religious Education','CRE',     'CRE Christian values & scripture.',                           '#8B5CF6', 'HeartHandshake',6, true),
  ('ire',                'Islamic Religious Education', 'IRE',      'IRE Islamic teachings.',                                      '#0891B2', 'BookOpen',     7, true),
  ('hpe',                'Health & Physical Education', 'HPE',      'Nutrition, hygiene, sports & movement.',                      '#EF4444', 'Dumbbell',     8, true),
  ('art-craft',          'Art & Craft',                 'Art',      'Drawing, painting, design & handicrafts.',                    '#EC4899', 'Palette',      9, true),
  ('music',              'Music',                       'Music',    'Singing, instruments, rhythm & theory.',                      '#F97316', 'Music',        10, true),
  ('agriculture',        'Agriculture & Nutrition',     'Agric',    'Farming, food production, home gardening & nutrition.',       '#84CC16', 'Sprout',       11, true),
  ('home-science',       'Home Science',                'Home Sci', 'Cooking, textiles, laundry, family & consumer education.',    '#F43F5E', 'ChefHat',      12, true),
  ('computer',           'Computer Studies / Digital',  'Comp',     'Digital literacy, coding, productivity & internet skills.',   '#7C3AED', 'Laptop',       13, true),
  ('business',           'Business Studies',            'Business', 'Commerce, accounts, entrepreneurship & economics basics.',    '#D97706', 'Briefcase',    14, true),
  ('languages',          'Foreign Languages',           'Langs',    'French, German, Arabic, Mandarin.',                           '#0284C7', 'Languages',    15, true)
) as la(code, name, short_name, description, color_hex, icon, sort_order, is_active)
where l.code in ('grade-1','grade-2','grade-3','grade-4','grade-5','grade-6','grade-7','grade-8','grade-9','grade-10','grade-11','grade-12')
on conflict do nothing;

-- =====================================================
-- 6. Example Strands for Grade 4 Mathematics (sample seed)
-- =====================================================
with gr4_maths as (
  select la.id as learning_area_id from public.learning_areas la
  join public.levels l on la.level_id = l.id
  where l.code = 'grade-4' and la.code = 'mathematics'
)
insert into public.strands (learning_area_id, code, name, description, sort_order, is_active)
select g.learning_area_id, s.code, s.name, s.description, s.sort_order, s.is_active
from gr4_maths g
cross join (values
  ('numbers',             'Numbers',                'Whole numbers, place value, roman numerals, operations.',  1, true),
  ('fractions',           'Fractions',              'Proper/improper fractions, decimal fractions, operations.',2, true),
  ('measurements',        'Measurements',           'Length, mass, capacity, time, money, perimeter, area.',    3, true),
  ('geometry',            'Geometry',               '2-D & 3-D shapes, angles, lines, symmetry.',               4, true),
  ('algebra',             'Algebra',                'Simple equations, patterns, sequences.',                   5, true),
  ('data-handling',       'Data Handling & Chance', 'Pictographs, bar graphs, tables, probability basics.',     6, true)
) s(code, name, description, sort_order, is_active)
on conflict do nothing;

-- =====================================================
-- 7. Example Sub-Strands under Grade 4 Maths > Numbers
-- =====================================================
with gr4_maths_numbers as (
  select s.id as strand_id from public.strands s
  join public.learning_areas la on s.learning_area_id = la.id
  join public.levels l on la.level_id = l.id
  where l.code = 'grade-4' and la.code = 'mathematics' and s.code = 'numbers'
)
insert into public.sub_strands (strand_id, code, name, description, sort_order, is_active)
select g.strand_id, ss.code, ss.name, ss.description, ss.sort_order, ss.is_active
from gr4_maths_numbers g
cross join (values
  ('place-value',     'Place Value & Total Value',   'Reading and writing numbers up to 100,000.',                 1, true),
  ('roman-numerals',  'Roman Numerals',              'Roman numerals up to 1000 (I, V, X, L, C, D, M).',           2, true),
  ('even-odd',        'Even & Odd Numbers',          'Identifying and classifying even/odd numbers.',              3, true),
  ('addition',        'Addition',                    'Adding numbers up to 6 digits with/without carrying.',       4, true),
  ('subtraction',     'Subtraction',                 'Subtracting numbers up to 6 digits with/without borrowing.', 5, true),
  ('multiplication',  'Multiplication',              'Multiplying 2-digit & 3-digit numbers.',                     6, true),
  ('division',        'Division',                    'Dividing with and without remainders.',                      7, true),
  ('brackets-order',  'Order of Operations',         'Using brackets, order of operations (order of sums).',       8, true),
  ('number-patterns', 'Number Patterns & Sequences', 'Completing increasing/decreasing number patterns.',          9, true),
  ('word-problems',   'Number Word Problems',        'Solving daily life number problems using all operations.',   10, true)
) ss(code, name, description, sort_order, is_active)
on conflict do nothing;

-- =====================================================
-- 8. Example Topics under Grade 4 > Numbers > Place Value
-- =====================================================
with gr4_maths_nums_pv as (
  select ss.id as sub_strand_id from public.sub_strands ss
  join public.strands s on ss.strand_id = s.id
  join public.learning_areas la on s.learning_area_id = la.id
  join public.levels l on la.level_id = l.id
  where l.code = 'grade-4'
    and la.code = 'mathematics'
    and s.code  = 'numbers'
    and ss.code = 'place-value'
)
insert into public.topics (sub_strand_id, code, name, description, keywords, sort_order, is_active)
select g.sub_strand_id, t.code, t.name, t.description, t.keywords, t.sort_order, t.is_active
from gr4_maths_nums_pv g
cross join (values
  ('read-numbers-100k',     'Reading Numbers up to 100,000',         'Read and state numbers from 0 to 100,000 in words and figures.', array['reading','numbers','words','figures'], 1, true),
  ('write-numbers-100k',    'Writing Numbers up to 100,000',         'Write numbers from 0 to 100,000 in symbols and words.',          array['writing','numbers','symbols'],         2, true),
  ('place-value-total',     'Place Value & Total Value',             'Identify place value (ones to hundred-thousands) and total value.', array['place value','total value','digits'],3, true),
  ('compare-numbers',       'Comparing & Ordering Numbers',          'Use <, >, = to compare; order numbers ascending/descending.',    array['compare','order','greater','less'],   4, true),
  ('rounding-off',          'Rounding Off Numbers',                  'Round whole numbers to the nearest 10, 100 and 1000.',          array['rounding','nearest 10','nearest 100'],5, true)
) t(code, name, description, keywords, sort_order, is_active)
on conflict do nothing;

-- =====================================================
-- 9. Sample Blog Post (seeded as draft – needs publishing)
-- =====================================================
with content_lead_profile as (
  select p.id as author_id
  from public.profiles p
  join public.roles r on p.role_id = r.id
  where r.code = 'content_lead'
  limit 1
  -- If no profile yet, fall back to placeholder author via role super_admin
  union all
  select gen_random_uuid() as author_id
  where not exists (select 1 from public.profiles limit 1)
)
insert into public.blog_posts (slug, title, excerpt, content, author_id, status, visibility, tags, reading_time_minutes, seo_title, seo_description, seo_keywords)
select
  'cbc-grade-4-mathematics-welcome-guide',
  'CBC Grade 4 Mathematics: A Parent & Teacher Welcome Guide',
  'A walkthrough of the Grade 4 CBC Maths curriculum, the new strands, and how to support your learner at home.',
  '# CBC Grade 4 Mathematics – Welcome Guide'||E'\n\n'||
  'The Competency-Based Curriculum (CBC) takes a practical, skills-first approach in Grade 4. This guide walks parents and teachers through what is new, how to support learning at home, and the free resources available on Akilix.'||E'\n\n'||
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
  cl.author_id,
  'draft'::resource_status,
  'public'::visibility_level,
  array['CBC','Grade 4','Mathematics','Parents','Teachers'],
  7,
  'CBC Grade 4 Mathematics: A Parent & Teacher Welcome Guide | Akilix',
  'Everything Kenyan parents and Grade 4 teachers need to understand the new CBC Mathematics curriculum. Strands, topics, tips and free Akilix resources.',
  array['CBC Grade 4','Grade 4 Mathematics','Kenya CBC parents','CBC teachers','Maths revision']
from content_lead_profile cl
on conflict (slug) do nothing;

-- =====================================================
-- 10. Seed complete
-- =====================================================
do $$ begin raise notice 'Akilix seed.sql applied successfully.'; end $$;
