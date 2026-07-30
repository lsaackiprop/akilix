export type TestimonialTone = "blue" | "green" | "amber";
export type TestimonialRating = 4 | 5;

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
  rating: TestimonialRating;
  tone: TestimonialTone;
}

export const testimonials: Testimonial[] = [
  {
    id: "tm-001",
    quote:
      "Akilix transformed how I prepare my Grade 8 CBC lessons. The scheme of work templates and lesson plans saved me 10+ hours every week. My learners' performance has improved noticeably.",
    author: "Beatrice Wanjiku",
    role: "Primary School Teacher, Nairobi",
    initials: "BW",
    rating: 5,
    tone: "blue",
  },
  {
    id: "tm-002",
    quote:
      "I used Akilix's KCSE past papers and topic-by-topic quizzes during my Form 4 revision. I went from a C+ to an A- in Mathematics. The video explanations made difficult concepts stick.",
    author: "Brian Otieno",
    role: "KCSE Student, Kisumu",
    initials: "BO",
    rating: 5,
    tone: "green",
  },
  {
    id: "tm-003",
    quote:
      "As a JSS learner, I was struggling with Integrated Science. The interactive exercises on Akilix made learning fun. My classmates and I now use it every evening after school.",
    author: "Amina Mohammed",
    role: "JSS Learner, Grade 7, Mombasa",
    initials: "AM",
    rating: 5,
    tone: "amber",
  },
  {
    id: "tm-004",
    quote:
      "Enrolling my daughter in Akilix Pro was the best investment this year. The CBC-aligned content and progress reports help me support her learning without needing to be a teacher myself.",
    author: "Peter Kimani",
    role: "CBC Parent, Nakuru",
    initials: "PK",
    rating: 5,
    tone: "green",
  },
  {
    id: "tm-005",
    quote:
      "The university-level engineering notes and tutorials on Akilix supplemented my coursework perfectly. I graduated with First Class Honours — the downloadable PDFs were my secret weapon.",
    author: "Faith Chebet",
    role: "University Graduate, BSc. EE, UoN",
    initials: "FC",
    rating: 4,
    tone: "blue",
  },
  {
    id: "tm-006",
    quote:
      "As a TVET graduate in Automotive Engineering, the practical modules and competency-based assessments on Akilix directly helped me pass my final exams and get my artisan certification.",
    author: "David Kiprop",
    role: "TVET Graduate, Automotive",
    initials: "DK",
    rating: 5,
    tone: "amber",
  },
] as const;
