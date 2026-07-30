import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect to explore the platform.",
    features: ["Access 500+ free courses", "Community support", "Basic progress tracking"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Plus",
    price: "$29",
    period: "/ month",
    description: "Most popular for individual learners.",
    features: ["Unlimited course access", "Certificates of completion", "Downloads & offline viewing", "Priority support"],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Teams",
    price: "$79",
    period: "/ user / month",
    description: "For teams, schools & enterprises.",
    features: ["Everything in Plus", "Admin dashboard", "SSO + SCIM", "Custom learning paths"],
    cta: "Contact sales",
    highlight: false,
  },
];

export const metadata = { title: "Pricing — Akilix" };

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="warning">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> Limited: 50% off annual
        </Badge>
        <h1
          className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          style={{ fontFamily: 'var(--font-dm-serif), ui-serif, Georgia, serif' }}
        >
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex h-full flex-col ${plan.highlight ? "border-blue-300 shadow-xl shadow-blue-600/10 ring-2 ring-blue-500/20" : ""}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Most popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period ?? ""}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="space-y-3 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={plan.highlight ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
