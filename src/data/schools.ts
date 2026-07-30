export type SchoolTier = "National" | "County" | "International";

export interface School {
  id: string;
  name: string;
  logo: string;
  tier: SchoolTier;
}

export const schools: School[] = [
  {
    id: "alliance-high",
    name: "Alliance High School",
    logo: "/images/logos/school-alliance-high.svg",
    tier: "National",
  },
  {
    id: "mangu-high",
    name: "Mang'u High School",
    logo: "/images/logos/school-mangu-high.svg",
    tier: "National",
  },
  {
    id: "kenya-high",
    name: "Kenya High School",
    logo: "/images/logos/school-kenya-high.svg",
    tier: "National",
  },
  {
    id: "strathmore",
    name: "Strathmore School",
    logo: "/images/logos/school-strathmore.svg",
    tier: "International",
  },
  {
    id: "brookhouse",
    name: "Brookhouse School",
    logo: "/images/logos/school-brookhouse.svg",
    tier: "International",
  },
  {
    id: "alliance-girls",
    name: "Alliance Girls High School",
    logo: "/images/logos/school-alliance-girls.svg",
    tier: "National",
  },
  {
    id: "starehe-boys",
    name: "Starehe Boys Centre",
    logo: "/images/logos/school-starehe-boys.svg",
    tier: "National",
  },
  {
    id: "pangani-girls",
    name: "Pangani Girls High School",
    logo: "/images/logos/school-pangani-girls.svg",
    tier: "County",
  },
] as const;
