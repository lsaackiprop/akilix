"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20">
      <Badge variant="success">Join free</Badge>
      <Card className="mt-6 w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Create your Akilix account</CardTitle>
          <CardDescription>
            Start learning with 10,000+ free and premium courses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="first" className="text-sm font-medium text-slate-700">First name</label>
              <Input id="first" placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <label htmlFor="last" className="text-sm font-medium text-slate-700">Last name</label>
              <Input id="last" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email-r" className="text-sm font-medium text-slate-700">Email</label>
            <Input id="email-r" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password-r" className="text-sm font-medium text-slate-700">Password</label>
            <Input id="password-r" type="password" placeholder="At least 8 characters" />
          </div>
          <Button className="w-full" type="submit">Create account</Button>
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-medium text-blue-600 hover:underline" href={ROUTES.LOGIN}>
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
