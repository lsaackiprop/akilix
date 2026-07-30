import SearchBar from "@/components/search/SearchBar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Search courses — Akilix" };

export default function SearchPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="default">Search</Badge>
        <h1
          className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-dm-serif), ui-serif, Georgia, serif' }}
        >
          Find the right course for you
        </h1>
        <p className="mt-4 text-slate-600">
          Search by topic, skill, instructor, or certification.
        </p>
      </div>
      <div className="mt-10">
        <SearchBar />
      </div>
      <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
        Results will appear here as you type.
      </div>
    </main>
  );
}
