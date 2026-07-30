import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { learningLevels, type LearningLevelTone } from "@/data/learningLevels";
import { ROUTES } from "@/constants/routes";

type ToneStyle = { icon: string; badge: string; hover: string };

const TONE_STYLES: Record<LearningLevelTone, ToneStyle> = {
  green: {
    icon: "bg-green-50 text-green-600 group-hover:bg-green-100",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
    hover: "ring-green-200",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    hover: "ring-blue-200",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    hover: "ring-amber-200",
  },
  success: {
    icon: "bg-gradient-to-br from-green-100 to-blue-100 text-green-700",
    badge: "bg-gradient-to-r from-green-50 to-blue-50 text-slate-700 ring-slate-200",
    hover: "ring-slate-200",
  },
};

const LEVEL_HREFS: Record<string, string> = {
  beginner: ROUTES.LEVELS,
  intermediate: ROUTES.LEVELS,
  advanced: ROUTES.LEVELS,
  professional: ROUTES.LEVELS,
};

export default function BrowseByLearningLevels() {
  return (
    <section id="levels" className="w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-3">
              Learning paths
            </Badge>
            <h2
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{
                fontFamily:
                  'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              Browse by Learning Level
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Pick the stage that fits you today. Every track includes
              assessments, milestones, and a verified certificate on
              completion.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={ROUTES.LEVELS}>
              View all paths
              <span aria-hidden>→</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {learningLevels.map((level) => {
            const style = TONE_STYLES[level.tone];
            const Icon = level.icon;
            const href = LEVEL_HREFS[level.slug] ?? ROUTES.LEVELS;
            return (
              <Link key={level.id} href={href} className="group">
                <Card
                  className={cn(
                    "h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-lg hover:shadow-slate-900/[0.06] hover:ring-2",
                    style.hover
                  )}
                >
                  <CardContent className="flex h-full flex-col p-6">
                    <div
                      className={cn(
                        "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                        style.icon
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {level.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {level.subtitle}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "ring-1 ring-inset border-transparent",
                          style.badge
                        )}
                      >
                        {level.count}
                      </Badge>
                      <span className="text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5">
                        Explore
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
