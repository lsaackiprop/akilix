export type PaperLevelTone = "green" | "blue" | "amber";

export type PastPaperLevel =
  | "CBC Grade 8"
  | "KCSE"
  | "KCPE"
  | "TVET"
  | "University";

export interface PastPaper {
  id: string;
  title: string;
  level: PastPaperLevel;
  levelTone: PaperLevelTone;
  year: string;
  subject: string;
  pages: number;
  downloads: string;
  iconColor: string;
}

export const pastPapers: PastPaper[] = [
  {
    id: "pp-1001",
    title: "KCSE Mathematics Paper 1 with Marking Scheme",
    level: "KCSE",
    levelTone: "blue",
    year: "2024",
    subject: "Mathematics",
    pages: 32,
    downloads: "18,420",
    iconColor: "from-blue-500 via-indigo-500 to-purple-600",
  },
  {
    id: "pp-1002",
    title: "KCSE English Paper 1, 2 & 3 Combined",
    level: "KCSE",
    levelTone: "blue",
    year: "2023",
    subject: "English",
    pages: 56,
    downloads: "14,890",
    iconColor: "from-blue-500 via-sky-500 to-cyan-600",
  },
  {
    id: "pp-1003",
    title: "KPSEA Mathematics & Integrated Science",
    level: "CBC Grade 8",
    levelTone: "green",
    year: "2024",
    subject: "KPSEA Grade 8",
    pages: 24,
    downloads: "22,540",
    iconColor: "from-green-500 via-emerald-500 to-teal-600",
  },
  {
    id: "pp-1004",
    title: "CBC Grade 8 Creative Arts & PE",
    level: "CBC Grade 8",
    levelTone: "green",
    year: "2024",
    subject: "KPSEA Grade 8",
    pages: 18,
    downloads: "9,730",
    iconColor: "from-emerald-500 via-green-500 to-lime-600",
  },
  {
    id: "pp-1005",
    title: "KCPE Mathematics & English Combined",
    level: "KCPE",
    levelTone: "amber",
    year: "2023",
    subject: "Standard 8",
    pages: 40,
    downloads: "25,810",
    iconColor: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    id: "pp-1006",
    title: "KCPE Science & Social Studies",
    level: "KCPE",
    levelTone: "amber",
    year: "2022",
    subject: "Standard 8",
    pages: 48,
    downloads: "20,110",
    iconColor: "from-amber-500 via-yellow-500 to-orange-600",
  },
  {
    id: "pp-1007",
    title: "TVET Electrical Engineering Module 1",
    level: "TVET",
    levelTone: "blue",
    year: "2024",
    subject: "Diploma Level",
    pages: 62,
    downloads: "5,320",
    iconColor: "from-indigo-500 via-blue-500 to-sky-600",
  },
  {
    id: "pp-1008",
    title: "University of Nairobi — BCOM Past Paper Set",
    level: "University",
    levelTone: "amber",
    year: "2023",
    subject: "Business Studies",
    pages: 74,
    downloads: "3,880",
    iconColor: "from-orange-500 via-rose-500 to-pink-600",
  },
] as const;
