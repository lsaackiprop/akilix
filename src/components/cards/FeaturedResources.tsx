import Link from "next/link";
import { Clock3, Users, Star, BookmarkPlus, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resources, type ResourceTagTone } from "@/data/resources";
import { ROUTES } from "@/constants/routes";

function InlineStars({ rating }: { rating: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5 fill-amber-400 stroke-amber-400",
            i === 4 && rating.endsWith(".9") && "fill-amber-300 stroke-amber-300"
          )}
        />
      ))}
    </div>
  );
}

function badgeVariantFromTone(tone: ResourceTagTone) {
  if (tone === "warning") return "warning" as const;
  if (tone === "success") return "success" as const;
  return "default" as const;
}

export default function FeaturedResources() {
  return (
    <section id="courses" className="w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Badge variant="default">Featured</Badge>
            <h2
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{
                fontFamily:
                  'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              Featured Resources & Courses
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Hand-picked courses with the highest learner satisfaction,
              real-world projects, and industry-recognized credentials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.SEARCH}>See all courses</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.SEARCH}>
                Bestsellers
                <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resources.map((course) => {
            const href = `${ROUTES.RESOURCE}/${course.slug}`;
            return (
              <Card
                key={course.id}
                className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/[0.06]"
              >
                <Link href={href} className="relative block">
                  <div
                    className={cn(
                      "relative aspect-[16/10] overflow-hidden bg-gradient-to-br",
                      course.tint
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)] opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <PlayCircle className="h-9 w-9 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute left-4 top-4 flex gap-2">
                      <Badge variant={badgeVariantFromTone(course.tagTone)}>
                        {course.tag}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      aria-label="Save course"
                      className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-blue-600"
                    >
                      <BookmarkPlus className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </Link>

                <CardContent className="flex flex-1 flex-col p-5">
                  <Badge variant="outline" className="mb-3 w-fit border-slate-200 text-slate-600">
                    {course.level}
                  </Badge>
                  <Link href={href}>
                    <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors hover:text-blue-600">
                      {course.title}
                    </h3>
                  </Link>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {course.instructorInitials}
                    </div>
                    <span className="truncate">{course.instructor}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-600">{course.rating}</span>
                    <InlineStars rating={course.rating} />
                    <span className="text-xs text-slate-500">({course.reviews})</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                      {course.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" strokeWidth={2} />
                      {course.enrolled} enrolled
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900">{course.price}</span>
                        {course.oldPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {course.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={href}>Enroll</Link>
                    </Button>
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
