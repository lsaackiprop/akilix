import { Badge } from "@/components/ui/badge";
import { schools, type SchoolTier } from "@/data/schools";
import { cn } from "@/lib/utils";

const TIER_GRADIENT: Record<SchoolTier, string> = {
  National: "from-blue-500 via-sky-500 to-indigo-600",
  County: "from-green-500 via-emerald-500 to-teal-600",
  International: "from-amber-500 via-orange-500 to-rose-600",
};

const TIER_BADGE: Record<SchoolTier, "default" | "success" | "warning"> = {
  National: "default",
  County: "success",
  International: "warning",
};

function schoolInitials(name: string): string {
  return name
    .replace(/\b(High|School|Girls|Boys|Centre|House)\b/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default function TrustedBySchools() {
  return (
    <section id="trusted-by" className="relative w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Trusted across Kenya</Badge>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Trusted by 2,500+ schools, educators &amp; institutions
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            From national giants to county leaders and international academies,
            Akilix is the learning companion educators trust.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {schools.map((school) => {
            const tint = TIER_GRADIENT[school.tier];
            const badgeVariant = TIER_BADGE[school.tier];
            const initials = schoolInitials(school.name);
            return (
              <div
                key={school.id}
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-slate-900/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/[0.06]"
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                    tint
                  )}
                >
                  <span className="text-base font-bold tracking-wide">
                    {initials}
                  </span>
                </div>
                <Badge
                  variant={badgeVariant}
                  className="mb-2 text-[10px] uppercase tracking-wide"
                >
                  {school.tier}
                </Badge>
                <h3 className="text-sm font-semibold leading-5 text-slate-900 group-hover:text-blue-600">
                  {school.name}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 sm:text-base">
            Used in every county. From Grade 1 to post-grad.
          </p>
        </div>
      </div>
    </section>
  );
}
