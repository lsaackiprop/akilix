import {
  GraduationCap,
  Award,
  Handshake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "green" | "amber" | "primary";
};

const FEATURES: Feature[] = [
  {
    title: "Expert-led instruction",
    description:
      "Learn from professors from top universities and practitioners at the world's most respected companies.",
    icon: GraduationCap,
    accent: "blue",
  },
  {
    title: "Verified certificates",
    description:
      "Earn shareable, verifiable credentials that employers trust — included with every course completion.",
    icon: Award,
    accent: "green",
  },
  {
    title: "Career services & hiring partners",
    description:
      "Resume reviews, interview prep, and direct pathways to roles at 2,500+ employer partners worldwide.",
    icon: Handshake,
    accent: "amber",
  },
  {
    title: "Project-based learning",
    description:
      "Build a portfolio of real-world projects with guided review, peer feedback, and AI-assisted coaching.",
    icon: Sparkles,
    accent: "primary",
  },
];

const ACCENT: Record<Feature["accent"], { icon: string; bar: string }> = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    bar: "from-blue-500 to-sky-500",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    bar: "from-green-500 to-emerald-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    bar: "from-amber-500 to-orange-500",
  },
  primary: {
    icon: "bg-gradient-to-br from-blue-50 to-green-50 text-blue-600",
    bar: "from-blue-600 via-emerald-500 to-amber-500",
  },
};

export default function WhyAkilix() {
  return (
    <section id="why-akilix" className="relative w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <Badge variant="warning">Why Akilix</Badge>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{
                fontFamily:
                  'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                go from learner to hired
              </span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Akilix combines the rigor of a university, the speed of a
              bootcamp, and the network of a career accelerator — so you can
              learn the right skills and land the role you want.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: "92%", v: "Learners report career impact" },
                { k: "2,500+", v: "Hiring partners" },
                { k: "30-day", v: "Money-back guarantee" },
              ].map((stat) => (
                <div key={stat.v}>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {stat.k}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    {stat.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {FEATURES.map((f, idx) => {
                const tone = ACCENT[f.accent];
                const Icon = f.icon;
                return (
                  <Card
                    key={f.title}
                    className={cn(
                      "relative h-full overflow-hidden border-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06]",
                      idx === 0 && "sm:translate-y-6"
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                        tone.bar
                      )}
                    />
                    <CardContent className="p-6 sm:p-7">
                      <div
                        className={cn(
                          "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                          tone.icon
                        )}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2.25} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {f.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {f.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
