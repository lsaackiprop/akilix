import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Course — Akilix" };

export default function ResourcePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Badge variant="outline">Course detail</Badge>
      <h1
        className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        style={{ fontFamily: 'var(--font-dm-serif), ui-serif, Georgia, serif' }}
      >
        Resource page template
      </h1>
      <p className="mt-4 text-slate-600">
        Individual course, path, or resource landing goes here.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href={ROUTES.SEARCH}>Back to search</Link>
        </Button>
      </div>
    </main>
  );
}
