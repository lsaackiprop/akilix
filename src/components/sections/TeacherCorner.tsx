import Link from "next/link";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { teacherCorner, type TeacherResource, type TeacherResourceTone } from "@/data/teacherCorner";
import { ROUTES } from "@/constants/routes";

const ICON_TINT: Record<TeacherResourceTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function TeacherCorner() {
  return (
    <section id="teacher-corner" className="w-full py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-gradient-to-r from-amber-50/60 via-transparent to-rose-50/60 blur-3xl"
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="warning">For educators</Badge>
          <h2
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Teacher Corner
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Ready-to-use teaching resources designed specifically for Kenyan
            educators — schemes of work, lesson plans, assessments, marking
            schemes, and classroom tools aligned with the CBC and 8-4-4 curricula.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teacherCorner.map((resource: TeacherResource) => {
            const Icon = resource.icon;
            const href = `${ROUTES.SEARCH}?category=${encodeURIComponent(resource.category)}`;
            return (
              <Link key={resource.id} href={href} className="group">
                <Card className="group/card h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-900/[0.06]">
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl",
                        ICON_TINT[resource.tone]
                      )}
                    >
                      <Icon className="h-6.5 w-6.5" strokeWidth={2.25} />
                    </div>
                    <Badge variant="outline" className="mb-3 w-fit border-slate-200 text-slate-600">
                      {resource.category}
                    </Badge>
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-blue-600">
                      {resource.title}
                    </h3>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Download className="h-4 w-4" strokeWidth={2} />
                        {resource.downloads} downloads
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 7h7M7 3.5 10.5 7 7 10.5" />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href={ROUTES.SEARCH}>
              Explore all teacher resources
              <span aria-hidden>→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
