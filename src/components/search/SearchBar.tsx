"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Data Science",
  "Web Development",
  "UI / UX Design",
  "Project Management",
  "Digital Marketing",
  "AI & Machine Learning",
];

export default function SearchBar() {
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="group relative mx-auto w-full max-w-2xl">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02] transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex flex-1 items-center gap-2 px-2">
            <Search
              className="h-5 w-5 shrink-0 text-slate-400"
              strokeWidth={2.25}
              aria-hidden="true"
            />
            <label htmlFor="akilix-search" className="sr-only">
              Search courses
            </label>
            <Input
              id="akilix-search"
              type="search"
              placeholder="Search 10,000+ courses, topics, instructors..."
              className="h-11 border-0 px-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex items-center gap-2 border-slate-200 px-2 sm:border-l">
            <Button variant="ghost" size="icon" aria-label="Filters" className="shrink-0">
              <SlidersHorizontal className="h-5 w-5 text-slate-500" />
            </Button>
            <Button size="sm" className="h-11 shrink-0 px-6">
              Search
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-500">Popular:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(active === s ? null : s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active === s
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
