export const SITE_CONFIG = {
  name: "Akilix",
  description: "Kenya's Smart Learning Platform",
  url: "https://akilix.com",
  keywords: [
    "CBC",
    "Kenya Notes",
    "Grade 8 Notes",
    "TVET",
    "University",
  ],
  tagline: "Smart learning for every Kenyan.",
  locale: "en_KE",
  ogImage: "/og.png",
  twitterHandle: "@akilix",
  contact: {
    email: "hello@akilix.com",
    phone: "+254 700 000 000",
    address: "Nairobi, Kenya",
  },
  stats: {
    courses: "10,000+",
    learners: "2.4M+",
    certifications: "500+",
    rating: "4.8 / 5",
    hiringPartners: "2,500+",
    guaranteeDays: 30,
  },
} as const;

export const siteConfig = SITE_CONFIG;

export type SiteConfigKey = keyof typeof SITE_CONFIG;
