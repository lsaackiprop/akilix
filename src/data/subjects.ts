import type { LucideIcon } from "lucide-react";
import {
  Code2,
  BarChart3,
  Palette,
  Briefcase,
  Megaphone,
  Cpu,
  Languages,
  Camera,
} from "lucide-react";

export interface Subject {
  id: number;
  name: string;
  slug: string;
  count: string;
  icon: LucideIcon;
  tint: string;
}

export const subjects: Subject[] = [
  {
    id: 1,
    name: "Development",
    slug: "development",
    count: "1,840 courses",
    icon: Code2,
    tint: "from-blue-500 to-blue-700",
  },
  {
    id: 2,
    name: "Data Science",
    slug: "data-science",
    count: "1,260 courses",
    icon: BarChart3,
    tint: "from-green-500 to-emerald-700",
  },
  {
    id: 3,
    name: "Design",
    slug: "design",
    count: "980 courses",
    icon: Palette,
    tint: "from-fuchsia-500 to-pink-600",
  },
  {
    id: 4,
    name: "Business",
    slug: "business",
    count: "1,120 courses",
    icon: Briefcase,
    tint: "from-amber-500 to-orange-600",
  },
  {
    id: 5,
    name: "Marketing",
    slug: "marketing",
    count: "860 courses",
    icon: Megaphone,
    tint: "from-cyan-500 to-sky-700",
  },
  {
    id: 6,
    name: "AI & Machine Learning",
    slug: "ai-ml",
    count: "740 courses",
    icon: Cpu,
    tint: "from-indigo-500 to-violet-700",
  },
  {
    id: 7,
    name: "Languages",
    slug: "languages",
    count: "620 courses",
    icon: Languages,
    tint: "from-rose-500 to-red-600",
  },
  {
    id: 8,
    name: "Photography",
    slug: "photography",
    count: "420 courses",
    icon: Camera,
    tint: "from-slate-500 to-slate-800",
  },
];
