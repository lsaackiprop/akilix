import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileCheck,
  GraduationCap,
  PenTool,
  LayoutGrid,
} from "lucide-react";

export type TeacherResourceCategory =
  | "Schemes of Work"
  | "Lesson Plans"
  | "Assessments"
  | "Marking Schemes"
  | "Classroom Tools";

export type TeacherResourceTone = "blue" | "green" | "amber" | "rose" | "violet";

export interface TeacherResource {
  id: number;
  title: string;
  category: TeacherResourceCategory;
  downloads: string;
  icon: LucideIcon;
  tone: TeacherResourceTone;
}

export const teacherCorner: TeacherResource[] = [
  {
    id: 1,
    title: "Mathematics Form 1-4 Term-by-Term Schemes",
    category: "Schemes of Work",
    downloads: "24,800+",
    icon: BookOpen,
    tone: "blue",
  },
  {
    id: 2,
    title: "CBC Grade 4-6 Interactive Lesson Plans",
    category: "Lesson Plans",
    downloads: "18,350+",
    icon: LayoutGrid,
    tone: "green",
  },
  {
    id: 3,
    title: "Mid-Term & End-Term Assessment Papers",
    category: "Assessments",
    downloads: "31,200+",
    icon: ClipboardList,
    tone: "amber",
  },
  {
    id: 4,
    title: "KCSE Past Papers Marking Schemes (2015-2024)",
    category: "Marking Schemes",
    downloads: "42,600+",
    icon: FileCheck,
    tone: "rose",
  },
  {
    id: 5,
    title: "Classroom Management & Rubric Templates",
    category: "Classroom Tools",
    downloads: "12,900+",
    icon: PenTool,
    tone: "violet",
  },
  {
    id: 6,
    title: "Biology Practical Teacher's Guide & Schemes",
    category: "Schemes of Work",
    downloads: "9,450+",
    icon: GraduationCap,
    tone: "green",
  },
];
