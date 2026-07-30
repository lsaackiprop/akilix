"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20">
      <Badge variant="secondary">Welcome back</Badge>
      <Card className="mt-6 w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to Akilix</CardTitle>
          <CardDescription>
            Access your courses, certificates, and learning paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <Link href={ROUTES.HOME} className="text-xs font-medium text-blue-600 hover:underline">Forgot?</Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" type="submit">Sign in</Button>
          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-blue-600 hover:underline" href={ROUTES.REGISTER}>
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
