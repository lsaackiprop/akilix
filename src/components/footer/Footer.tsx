"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/config";

const COLUMNS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Learn",
    links: [
      { label: "Browse courses", href: ROUTES.SEARCH },
      { label: "Learning paths", href: ROUTES.LEVELS },
      { label: "Certifications", href: ROUTES.LEVELS },
      { label: "Free courses", href: ROUTES.SEARCH },
      { label: "Scholarships", href: ROUTES.CONTACT },
    ],
  },
  {
    title: "Teach on Akilix",
    links: [
      { label: "Become an instructor", href: ROUTES.CONTACT },
      { label: "Instructor resources", href: ROUTES.HELP },
      { label: "Partner with us", href: ROUTES.CONTACT },
      { label: "Enterprise training", href: ROUTES.CONTACT },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: ROUTES.ABOUT },
      { label: "Careers", href: ROUTES.CAREERS },
      { label: "Press", href: ROUTES.CONTACT },
      { label: "Contact", href: ROUTES.CONTACT },
      { label: "Blog", href: ROUTES.BLOG },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: ROUTES.HELP },
      { label: "Learner FAQ", href: ROUTES.HELP },
      { label: "Accessibility", href: ROUTES.PRIVACY },
      { label: "Trust & Safety", href: ROUTES.TERMS },
      { label: "Status", href: ROUTES.HOME },
    ],
  },
];

const LEGAL: Array<{ label: string; href: string }> = [
  { label: "Privacy Policy", href: ROUTES.PRIVACY },
  { label: "Terms of Service", href: ROUTES.TERMS },
  { label: "Cookie Policy", href: ROUTES.PRIVACY },
  { label: "Sitemap", href: ROUTES.HOME },
];

const SOCIALS = ["Twitter", "LinkedIn", "YouTube", "Facebook"];

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-50/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-green-600 text-white shadow-sm shadow-blue-600/20">
                <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
              {SITE_CONFIG.tagline} {SITE_CONFIG.description}
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {SITE_CONFIG.contact.email}
              </div>
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {SITE_CONFIG.contact.phone}
              </div>
              <div className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{SITE_CONFIG.contact.address}</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-900">
                Get monthly learning insights
              </p>
              <p className="mt-1 text-xs text-slate-500">
                No spam. Unsubscribe anytime.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-3 flex w-full max-w-sm gap-2"
              >
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 flex-1"
                />
                <Button type="submit">Join</Button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-slate-900">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-blue-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name} Learning, Inc. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            {LEGAL.map((l) => (
              <li key={`${l.label}-${l.href}`}>
                <Link href={l.href} className="transition-colors hover:text-blue-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex items-center gap-5 text-xs font-medium text-slate-500">
            {SOCIALS.map((s) => (
              <li key={s}>
                <Link href={ROUTES.HOME} className="transition-colors hover:text-blue-600">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
