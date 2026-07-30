import Link from "next/link";
import { Menu, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const NAV_LINKS = [
  { href: ROUTES.COURSES, label: "Courses" },
  { href: ROUTES.EXPLORE, label: "Explore" },
  { href: ROUTES.LEVELS, label: "Levels" },
  { href: ROUTES.PRICING, label: "Pricing" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-green-600 text-white shadow-sm shadow-blue-600/20">
              <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Akilix
            </span>
          </Link>
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 md:inline-flex"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={ROUTES.REGISTER}>Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
