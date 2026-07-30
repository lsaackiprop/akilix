export type ResourceLevel = "Beginner" | "Intermediate" | "Advanced";
export type ResourceTag = "Bestseller" | "New" | "Hot & New";
export type ResourceTagTone = "success" | "warning" | "default";

export interface FeaturedResource {
  id: number;
  slug: string;
  title: string;
  instructor: string;
  instructorInitials: string;
  rating: string;
  reviews: string;
  duration: string;
  enrolled: string;
  level: ResourceLevel;
  tag: ResourceTag;
  tagTone: ResourceTagTone;
  tint: string;
  price: string;
  oldPrice?: string;
  subjectSlug: string;
  levelSlug: string;
}

export const resources: FeaturedResource[] = [
  {
    id: 1,
    slug: "data-science-ml-bootcamp",
    title: "Complete Data Science & Machine Learning Bootcamp",
    instructor: "Dr. Amelia Okafor",
    instructorInitials: "AO",
    rating: "4.9",
    reviews: "38,412",
    duration: "42h 10m",
    enrolled: "214,980",
    level: "Intermediate",
    tag: "Bestseller",
    tagTone: "success",
    tint: "from-blue-500 via-sky-500 to-indigo-600",
    price: "$79.99",
    oldPrice: "$199.99",
    subjectSlug: "data-science",
    levelSlug: "intermediate",
  },
  {
    id: 2,
    slug: "fullstack-react-nextjs",
    title: "Full-Stack Web Development with React & Next.js",
    instructor: "Marco Delacroix",
    instructorInitials: "MD",
    rating: "4.8",
    reviews: "22,044",
    duration: "56h 40m",
    enrolled: "168,200",
    level: "Beginner",
    tag: "Hot & New",
    tagTone: "warning",
    tint: "from-green-500 via-emerald-500 to-teal-600",
    price: "$89.99",
    oldPrice: "$219.99",
    subjectSlug: "development",
    levelSlug: "beginner",
  },
  {
    id: 3,
    slug: "ui-ux-design-masterclass",
    title: "UI/UX Design Masterclass: Research to Prototype",
    instructor: "Sofia Mendes",
    instructorInitials: "SM",
    rating: "4.9",
    reviews: "14,198",
    duration: "31h 20m",
    enrolled: "92,450",
    level: "Beginner",
    tag: "New",
    tagTone: "default",
    tint: "from-fuchsia-500 via-pink-500 to-rose-600",
    price: "$69.99",
    oldPrice: "$179.99",
    subjectSlug: "design",
    levelSlug: "beginner",
  },
  {
    id: 4,
    slug: "generative-ai-llms-production",
    title: "Generative AI with LLMs: Build Production Apps",
    instructor: "Priya Ramanathan",
    instructorInitials: "PR",
    rating: "4.8",
    reviews: "9,860",
    duration: "38h 05m",
    enrolled: "71,330",
    level: "Advanced",
    tag: "Hot & New",
    tagTone: "warning",
    tint: "from-amber-500 via-orange-500 to-red-600",
    price: "$94.99",
    oldPrice: "$249.99",
    subjectSlug: "ai-ml",
    levelSlug: "advanced",
  },
];
