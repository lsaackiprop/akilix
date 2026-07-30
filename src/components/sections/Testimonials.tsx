import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonials, type TestimonialTone } from "@/data/testimonials";
import { cn } from "@/lib/utils";

const TONE_AVATAR: Record<TestimonialTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

const TONE_ACCENT: Record<TestimonialTone, string> = {
  blue: "from-blue-500 to-sky-500",
  green: "from-green-500 to-emerald-500",
  amber: "from-amber-500 to-orange-500",
};

function FiveStarRow({ rating }: { rating: 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4 fill-amber-400 stroke-amber-400",
            i >= rating && "fill-slate-200 stroke-slate-200"
          )}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Learner stories</Badge>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Loved by learners, teachers &amp; parents
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Real stories from real Kenyans who have used Akilix to accelerate
            their teaching, learning, and exam preparation.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => {
            const accent = TONE_ACCENT[t.tone];
            const avatar = TONE_AVATAR[t.tone];
            return (
              <Card
                key={t.id}
                className="group relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06]"
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90",
                    accent
                  )}
                />
                <CardContent className="flex h-full flex-col p-6 sm:p-7">
                  <FiveStarRow rating={t.rating} />

                  <blockquote className="mt-5 flex-1">
                    <p className="text-sm leading-6 text-slate-700 sm:text-[15px] sm:leading-7">
                      <span aria-hidden className="text-slate-300">
                        &ldquo;
                      </span>
                      {t.quote}
                      <span aria-hidden className="text-slate-300">
                        &rdquo;
                      </span>
                    </p>
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        avatar
                      )}
                      aria-hidden
                    >
                      {t.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {t.author}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {t.role}
                      </p>
                    </div>
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
