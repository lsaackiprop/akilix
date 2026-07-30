-- ============================================
-- AKILIX DATABASE
-- Migration: 005_resource_types.sql
-- ============================================

create table if not exists resource_types (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    description text,
    created_at timestamptz default now()
);

insert into resource_types (name, slug, description)
values
('Notes', 'notes', 'Lesson notes and study notes'),
('Past Paper', 'past-paper', 'Past examination papers'),
('Marking Scheme', 'marking-scheme', 'Answer keys and marking guides'),
('Assignment', 'assignment', 'Homework and assignments'),
('CAT', 'cat', 'Continuous Assessment Tests'),
('Exam', 'exam', 'School examinations'),
('Revision Paper', 'revision-paper', 'Revision materials'),
('Lesson Plan', 'lesson-plan', 'Teacher lesson plans'),
('Scheme of Work', 'scheme-of-work', 'Teacher schemes of work'),
('Textbook', 'textbook', 'Digital textbooks'),
('Practical', 'practical', 'Practical activities'),
('Project', 'project', 'Student project materials'),
('Video Lesson', 'video-lesson', 'Educational videos'),
('Audio Lesson', 'audio-lesson', 'Educational audio'),
('Presentation', 'presentation', 'PowerPoint presentations'),
('Flashcards', 'flashcards', 'Study flashcards'),
('Quiz', 'quiz', 'Interactive quizzes'),
('CBC Assessment', 'cbc-assessment', 'Competency-Based assessment tasks')
on conflict (slug) do nothing;