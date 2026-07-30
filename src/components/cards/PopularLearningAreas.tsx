import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { subjects } from "@/data/subjects";
import { ROUTES } from "@/constants/routes";

export default function PopularLearningAreas() {
  return (
    <section id="subjects" className="relative w-full py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-gradient-to-r from-blue-50/60 via-transparent to-green-50/60 blur-3xl"
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
            Trending categories
          </span>
          <h2
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Popular Learning Areas
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Explore in-demand topics curated for aspiring professionals and
            upskilling teams. New content added every week.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            const href = `${ROUTES.SEARCH}?subject=${subject.slug}`;
            return (
              <Link key={subject.id} href={href} className="group">
                <Card className="group/card h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md hover:shadow-slate-900/[0.05]">
                  <CardContent className="p-5">
                    <div
                      className={cn(
                        "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
                        subject.tint
                      )}
                    >
                      <Icon className="h-5.5 w-5.5" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {subject.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-slate-500">{subject.count}</p>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white">
                        →
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
