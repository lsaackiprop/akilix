export type PricingTone = "default" | "highlighted" | "muted";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  priceMonthly: string;
  priceAnnual: string;
  priceAnnualSubnote?: string;
  tone: PricingTone;
  features: PricingFeature[];
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    tagline: "Perfect for trying Akilix at zero cost.",
    priceMonthly: "Free",
    priceAnnual: "Free",
    tone: "default",
    cta: "Get started free",
    features: [
      { text: "500+ free learning resources", included: true },
      { text: "KCPE & KCSE past papers (2018–2020)", included: true },
      { text: "Basic CBC Grade 1–8 notes", included: true },
      { text: "3 downloads per month", included: true },
      { text: "Community forum access", included: true },
      { text: "Full marking schemes & answers", included: false },
      { text: "Offline video downloads", included: false },
      { text: "Verified certificates", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    tagline: "Everything you need for serious learning & exam prep.",
    priceMonthly: "KES 999",
    priceAnnual: "KES 9,999",
    priceAnnualSubnote: "Billed annually — save 20%",
    tone: "highlighted",
    cta: "Start 7-day free trial",
    features: [
      { text: "10,000+ premium resources", included: true },
      { text: "All KCPE, KCSE past papers (2010–2024)", included: true },
      { text: "Full marking schemes & answers", included: true },
      { text: "Complete CBC Grade 1–8 & JSS library", included: true },
      { text: "TVET & university-level modules", included: true },
      { text: "Unlimited offline downloads", included: true },
      { text: "Verifiable completion certificates", included: true },
      { text: "AI study coach & topic quizzes", included: true },
    ],
  },
  {
    id: "teams",
    name: "Institutions & Teams",
    slug: "teams",
    tagline: "Deploy Akilix across your school, college or team.",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    tone: "muted",
    cta: "Contact sales",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Admin dashboard & analytics", included: true },
      { text: "Unlimited student seats", included: true },
      { text: "SAML / SSO + custom branding", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "Custom content uploads", included: true },
      { text: "Volume pricing for counties", included: true },
      { text: "Onboarding & training sessions", included: true },
    ],
  },
] as const;

export type PricingPlanKey = (typeof pricingPlans)[number]["id"];
