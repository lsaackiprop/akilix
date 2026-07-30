export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  coverTint: string;
}

export const blog: BlogPost[] = [
  {
    id: 1,
    slug: "learn-data-science-in-2026",
    title: "How to Learn Data Science in 2026 — A Complete Roadmap",
    excerpt:
      "From Python basics to deploying ML models, here's the step-by-step path thousands of Akilix learners used to land data roles.",
    author: "Dr. Amelia Okafor",
    date: "Jul 18, 2026",
    readTime: "9 min read",
    category: "Career",
    coverTint: "from-blue-500 to-indigo-700",
  },
  {
    id: 2,
    slug: "nextjs-app-router-guide",
    title: "The Practical Guide to Next.js App Router for Full-Stack Devs",
    excerpt:
      "Server components, route handlers, and data fetching patterns — all the patterns we teach in Akilix's advanced React track.",
    author: "Marco Delacroix",
    date: "Jul 10, 2026",
    readTime: "12 min read",
    category: "Engineering",
    coverTint: "from-green-500 to-emerald-700",
  },
  {
    id: 3,
    slug: "ai-career-pivots",
    title: "Career Pivots into AI: Stories from 5 Akilix Grads",
    excerpt:
      "Five learners share how they switched industries, what they studied, and exactly how long it took them to get hired.",
    author: "Priya Ramanathan",
    date: "Jul 02, 2026",
    readTime: "7 min read",
    category: "Community",
    coverTint: "from-amber-500 to-orange-700",
  },
];
