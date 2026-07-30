import Link from "next/link";
import { FileText, FileSpreadsheet, Eye, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pastPapers, type PastPaper, type PaperLevelTone } from "@/data/pastPapers";
import { ROUTES } from "@/constants/routes";

const LEVEL_TINT: Record<PaperLevelTone, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const LEVEL_BAR: Record<PaperLevelTone, string> = {
  green: "from-green-500 to-emerald-500",
  blue: "from-blue-500 to-sky-500",
  amber: "from-amber-500 to-orange-500",
};

export default function PastPapersSection() {
  return (
    <section id="past-papers" className="w-full py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-gradient-to-r from-blue-50/60 via-transparent to-violet-50/60 blur-3xl"
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Badge variant="success">Exam prep</Badge>
            <h2
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{
                fontFamily:
                  'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              Past Papers & Revision Kits
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              KCSE, KPSEA, and mid-term past papers with comprehensive marking
              schemes — curated to help you prepare and excel in national exams.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.SEARCH}>All papers</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.SEARCH}>
                KCSE 2024
                <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pastPapers.map((paper: PastPaper) => {
            const href = `${ROUTES.RESOURCE}/past-paper-${paper.id}`;
            return (
              <Card
                key={paper.id}
                className="group relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/[0.06]"
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    LEVEL_BAR[paper.levelTone]
                  )}
                />
                <CardContent className="flex flex-1 flex-col p-5 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0 ring-1 ring-inset",
                        LEVEL_TINT[paper.levelTone]
                      )}
                    >
                      {paper.level}
                    </Badge>
                    <Badge variant="secondary">{paper.year}</Badge>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                      {paper.subject.includes("Math") || paper.subject.includes("Sci") ? (
                        <FileSpreadsheet className="h-5.5 w-5.5" strokeWidth={2.25} />
                      ) : (
                        <FileText className="h-5.5 w-5.5" strokeWidth={2.25} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {paper.subject}
                      </p>
                      <Link href={href}>
                        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors hover:text-blue-600">
                          {paper.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                      {paper.pages} pages
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      {paper.downloads}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={href}>
                        <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                        Preview
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={href}>
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Download
                      </Link>
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
