"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { faq, type FaqItem } from "@/data/faq";

const CATEGORY_BADGE: Record<FaqItem["category"], "default" | "secondary" | "success" | "warning"> = {
  General: "default",
  Billing: "warning",
  Courses: "success",
  Certificates: "secondary",
};

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(faq[0]?.id ?? null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="secondary">FAQ</Badge>
          <h2
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{
              fontFamily:
                'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", serif',
            }}
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {`Everything you need to know about Akilix. Can't find an answer?
            Reach out to our friendly support team.`}
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-3">
          {faq.slice(0, 6).map((item: FaqItem) => {
            const isOpen = openId === item.id;
            return (
              <Card
                key={item.id}
                className={cn(
                  "overflow-hidden border-slate-200/70 transition-all duration-200",
                  isOpen && "border-slate-300 shadow-md shadow-slate-900/[0.04]"
                )}
              >
                <CardContent className="p-0">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant={CATEGORY_BADGE[item.category]}
                        className="mb-2"
                      >
                        {item.category}
                      </Badge>
                      <h3
                        className={cn(
                          "text-base font-semibold leading-6 sm:text-lg",
                          isOpen ? "text-blue-600" : "text-slate-900"
                        )}
                      >
                        {item.question}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300",
                        isOpen && "rotate-180 bg-blue-50 text-blue-600"
                      )}
                    >
                      <ChevronDown className="h-4.5 w-4.5" strokeWidth={2.25} />
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 px-5 pb-6 pt-0 sm:px-6">
                        <p className="pt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-7">
                          {item.answer}
                        </p>
                      </div>
                    </div>
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
