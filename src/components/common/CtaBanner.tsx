import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export default function CtaBanner() {
  return (
    <section id="cta" className="w-full py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-green-600 px-6 py-14 shadow-xl shadow-blue-600/10 sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Limited-time offer — 50% off all annual plans
              </span>
              <h2
                className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
                style={{
                  fontFamily:
                    'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
                }}
              >
                Your future starts with a single course. What will you learn?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                Join {SITE_CONFIG.stats.learners} learners already advancing their careers on
                {SITE_CONFIG.name}. Start with a 7-day free trial — no credit card
                required.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:col-span-2 lg:items-end">
              <Button
                asChild
                size="lg"
                className="h-12 w-full border-0 bg-white px-6 text-blue-700 shadow-lg hover:bg-blue-50 sm:w-auto"
              >
                <Link href={ROUTES.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link href={ROUTES.PRICING}>Browse Pricing →</Link>
              </Button>
              <p className="text-xs text-blue-100/90">
                Cancel anytime • Includes {SITE_CONFIG.stats.guaranteeDays}-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
