"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="success">We&apos;d love to hear from you</Badge>
        <h1
          className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          style={{ fontFamily: 'var(--font-dm-serif), ui-serif, Georgia, serif' }}
        >
          Get in touch with Akilix
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Questions, partnership, press, sales — our team typically responds within one business day.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Send us a message</CardTitle>
            <CardDescription>We&apos;ll get back to you shortly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="c-name" className="text-sm font-medium text-slate-700">Full name</label>
                <Input id="c-name" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <label htmlFor="c-email" className="text-sm font-medium text-slate-700">Email</label>
                <Input id="c-email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="c-subject" className="text-sm font-medium text-slate-700">Subject</label>
              <Input id="c-subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <label htmlFor="c-msg" className="text-sm font-medium text-slate-700">Message</label>
              <textarea
                id="c-msg"
                rows={5}
                placeholder="Type your message..."
                className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
            <Button className="w-full sm:w-auto" type="submit">
              <MessageSquare className="h-4 w-4" /> Send message
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: Mail, title: "Email", value: "hello@akilix.com" },
            { icon: Phone, title: "Phone", value: "+1 (555) 010-8820" },
            { icon: MapPin, title: "Office", value: "221B Campus Drive, San Francisco, CA 94105" },
          ].map(({ icon: Icon, title, value }) => (
            <Card key={title}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
