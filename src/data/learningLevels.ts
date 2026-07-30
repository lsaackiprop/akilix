import type { LucideIcon } from "lucide-react";
import { Sprout, TrendingUp, Rocket, Trophy } from "lucide-react";

export type LearningLevelTone = "green" | "blue" | "amber" | "success";

export interface LearningLevel {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  count: string;
  icon: LucideIcon;
  tone: LearningLevelTone;
}

export const learningLevels: LearningLevel[] = [
  {
    id: 1,
    name: "Beginner",
    slug: "beginner",
    subtitle: "Start from the fundamentals with gentle, guided paths.",
    count: "3,420 courses",
    icon: Sprout,
    tone: "green",
  },
  {
    id: 2,
    name: "Intermediate",
    slug: "intermediate",
    subtitle: "Deepen your craft with hands-on projects and case studies.",
    count: "4,180 courses",
    icon: TrendingUp,
    tone: "blue",
  },
  {
    id: 3,
    name: "Advanced",
    slug: "advanced",
    subtitle: "Tackle complex topics taught by certified industry experts.",
    count: "1,960 courses",
    icon: Rocket,
    tone: "amber",
  },
  {
    id: 4,
    name: "Professional",
    slug: "professional",
    subtitle: "Executive-ready certifications for teams and leaders.",
    count: "540 programs",
    icon: Trophy,
    tone: "success",
  },
];
