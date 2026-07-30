import Link from "next/link";
import {
  Download,
  User,
  Clock,
  HardDrive,
  BookOpen,
  Video,
  BookMarked,
  FlaskConical,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { latestUploads, type LatestUpload, type UploadType } from "@/data/latestUploads";
import { ROUTES } from "@/constants/routes";

const TYPE_BADGE_VARIANT: Record<
  UploadType,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  Notes: "default",
  Video: "warning",
  Book: "success",
  Practical: "secondary",
  Paper: "outline",
};

const TYPE_ICON: Record<UploadType, LucideIcon> = {
  Notes: BookOpen,
  Video: Video,
  Book: BookMarked,
  Practical: FlaskConical,
  Paper: FileText,
};

const ICON_TINT: Record<LatestUpload["tone"], string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function LatestUploads() {
  return (
    <section id="latest-uploads" className="w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Badge variant="default">Fresh uploads</Badge>
            <h2
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{
                fontFamily:
                  'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
              }}
            >
              Latest Uploads
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Brand new resources added by our community of educators —
              refreshed daily with the latest study materials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.SEARCH}>Browse all</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.SEARCH}>
                New arrivals
                <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {latestUploads.map((upload) => {
            const Icon = TYPE_ICON[upload.type];
            const href = `${ROUTES.RESOURCE}/${upload.id}`;
            return (
              <Card
                key={upload.id}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-900/[0.06]"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        ICON_TINT[upload.tone]
                      )}
                    >
                      <Icon className="h-5.5 w-5.5" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={TYPE_BADGE_VARIANT[upload.type]}>
                          {upload.type}
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                          {upload.level}
                        </Badge>
                      </div>
                      <Link href={href}>
                        <h3 className="mt-2.5 line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors hover:text-blue-600">
                          {upload.title}
                        </h3>
                      </Link>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" strokeWidth={2} />
                          {upload.author}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {upload.subject}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                          {upload.uploaded}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <HardDrive className="h-3.5 w-3.5" strokeWidth={2} />
                          {upload.size}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 shrink-0 rounded-xl text-slate-600 transition-all group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                      asChild
                    >
                      <Link href={href} aria-label="Download resource">
                        <Download className="h-4 w-4" strokeWidth={2} />
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
