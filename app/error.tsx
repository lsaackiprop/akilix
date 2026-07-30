"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ROUTES } from "@/src/constants/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
          <AlertTriangle className="h-8 w-8 text-rose-600" strokeWidth={2} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          Something went wrong
        </p>

        <h1
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          style={{
            fontFamily:
              'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
          }}
        >
          We hit a small snag.
        </h1>

        <p className="mt-4 text-pretty leading-7 text-slate-600">
          An unexpected error occurred while loading this page. You can try
          again in a moment — your progress is safe.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Dev error
            </p>
            <code className="mt-2 block break-words text-xs text-rose-700">
              {error.message}
            </code>
            {error.digest && (
              <p className="mt-2 text-[11px] text-rose-500/80">
                digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg" className="w-full sm:w-auto">
            <RefreshCw className="h-4.5 w-4.5" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href={ROUTES.HOME}>
              <Home className="h-4.5 w-4.5" />
              Back to home
            </Link>
          </Button>
        </div>

        <Link
          href={ROUTES.HOME}
          className="mt-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Or browse from the beginning
        </Link>
      </div>
    </div>
  );
}
