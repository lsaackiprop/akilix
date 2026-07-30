import Link from "next/link";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ROUTES } from "@/src/constants/routes";
import { SITE_CONFIG } from "@/src/constants/config";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-[72px] font-black leading-none tracking-tight sm:text-[96px]">
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
            404
          </span>
        </p>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Compass className="h-7 w-7 text-slate-400" strokeWidth={1.75} />
        </div>

        <h1
          className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          style={{
            fontFamily:
              'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
          }}
        >
          This page took a study break.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-pretty leading-7 text-slate-600">
          The resource you&apos;re looking for might have been moved, renamed,
          or never existed on {SITE_CONFIG.name}. Let&apos;s get you back on the
          learning path.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={ROUTES.HOME}>
              <Home className="h-4.5 w-4.5" />
              Back to homepage
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href={ROUTES.SEARCH}>
              <Search className="h-4.5 w-4.5" />
              Search courses
            </Link>
          </Button>
        </div>

        <Link
          href={ROUTES.HOME}
          className="mt-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Or continue exploring
        </Link>
      </div>
    </div>
  );
}
