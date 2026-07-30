import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pricingPlans, type PricingPlan, type PricingTone } from "@/data/pricing";
import { ROUTES } from "@/constants/routes";

const TONE_STYLES: Record<PricingTone, { card: string; badge?: string; border: string }> = {
  default: {
    card: "",
    border: "border-slate-200",
  },
  highlighted: {
    card: "ring-2 ring-blue-600 shadow-xl shadow-blue-600/10",
    badge: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white",
    border: "border-transparent",
  },
  muted: {
    card: "",
    border: "border-slate-200",
  },
};

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="default">Simple pricing</Badge>
          <h2
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Pricing built for every learner
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {`Whether you're studying solo, prepping for KCSE, or equipping an
            entire school — there's a plan that fits you perfectly.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan: PricingPlan) => {
            const tone = TONE_STYLES[plan.tone];
            const isHighlighted = plan.tone === "highlighted";
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col",
                  tone.border,
                  tone.card,
                  isHighlighted && "lg:-my-4 lg:z-10"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-lg",
                        tone.badge
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Most popular
                    </span>
                  </div>
                )}
                <CardHeader className={cn("pb-4", isHighlighted && "pt-8")}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-4xl font-bold tracking-tight",
                        isHighlighted ? "text-blue-600" : "text-slate-900"
                      )}
                    >
                      {plan.priceMonthly}
                    </span>
                    {plan.priceMonthly !== "Free" && (
                      <span className="text-sm text-slate-500">/month</span>
                    )}
                  </div>
                  {plan.priceAnnualSubnote && (
                    <p className="mt-1.5 text-xs font-medium text-slate-500">
                      {plan.priceAnnualSubnote}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col pt-4">
                  <Button
                    variant={isHighlighted ? "default" : "outline"}
                    className={cn("w-full", isHighlighted && "bg-blue-600 text-white")}
                    size="lg"
                    asChild
                  >
                    <Link href={ROUTES.PRICING}>{plan.cta}</Link>
                  </Button>

                  <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                    {plan.features.map((feature, idx) => {
                      const IconComp = feature.included ? Check : X;
                      return (
                        <div
                          key={`${plan.id}-feature-${idx}`}
                          className="flex items-start gap-3"
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                              feature.included
                                ? "bg-green-50 text-green-600"
                                : "bg-slate-100 text-slate-400"
                            )}
                          >
                            <IconComp className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                          <span
                            className={cn(
                              "text-sm leading-5",
                              feature.included ? "text-slate-700" : "text-slate-400"
                            )}
                          >
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
