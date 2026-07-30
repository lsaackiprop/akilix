import Link from "next/link";
import { ArrowRight, PlayCircle, Users, BookOpen, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/search/SearchBar";
import { SITE_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

const STATS = [
  { label: "Expert-led courses", value: SITE_CONFIG.stats.courses, icon: BookOpen },
  { label: "Active learners", value: SITE_CONFIG.stats.learners, icon: Users },
  { label: "Certifications", value: SITE_CONFIG.stats.certifications, icon: Award },
  { label: "Average rating", value: SITE_CONFIG.stats.rating, icon: Star },
];

export default function Hero() {
  return (
    <section id="top" className="relative w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-gradient-to-b from-blue-50/80 via-transparent to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            New cohort starts this month — enroll now
          </span>

          <h1
            className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Learn skills that unlock{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
              your next career move
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-600 sm:text-xl">
            {SITE_CONFIG.description}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={ROUTES.SEARCH}>
                Start Learning Free
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={ROUTES.CONTACT}>
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Watch Intro (2 min)
              </Link>
            </Button>
          </div>

          <div className="mt-10">
            <SearchBar />
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:grid-cols-4 sm:p-8">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-start gap-2 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {value}
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
