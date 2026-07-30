export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SEARCH: "/search",
  RESOURCE: "/resource",
  PRICING: "/pricing",
  CONTACT: "/contact",
  BLOG: "/blog",
  ABOUT: "/about",
  CAREERS: "/careers",
  HELP: "/help",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  HERO: "/#top",
  TRUSTED_BY: "/#trusted-by",
  LEVELS: "/#levels",
  SUBJECTS: "/#subjects",
  TRENDING: "/#trending",
  LATEST_UPLOADS: "/#latest-uploads",
  TEACHER_CORNER: "/#teacher-corner",
  PAST_PAPERS: "/#past-papers",
  TESTIMONIALS: "/#testimonials",
  FAQ: "/#faq",
  PRICING_SECTION: "/#pricing",
  CTA: "/#cta",
  EXPLORE: "/#subjects",
  COURSES: "/#trending",
  WHY_AKILIX: "/#teacher-corner",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
