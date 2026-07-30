"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Wifi,
  Server,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

type TestResponse = {
  ok: boolean;
  phase: string;
  timestamp: string;
  environment: Record<string, string>;
  network?: {
    restPing: {
      status: number;
      ok: boolean;
      ms: number;
      serverHeader?: string | null;
    };
  };
  sdk?: {
    tableQuery: {
      ok: boolean;
      reached: boolean;
      rowsReturned: number;
      countFound: number | null;
      errorCode?: string;
      errorMessage?: string;
      errorHint?: string;
      isExpectedError?: boolean;
      ms: number;
    };
  };
  auth?: {
    sessionOk: boolean;
    hasSession: boolean;
    ms: number;
  };
  verdict: {
    level: "pass" | "warn" | "fail";
    headline: string;
    nextSteps: string[];
  };
  totalMs: number;
};

export default function SupabaseConnectionDebug({
  autoRun = true,
}: {
  autoRun?: boolean;
}) {
  const [data, setData] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(autoRun);
  const [expanded, setExpanded] = useState(false);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test-supabase", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const json = (await res.json()) as TestResponse;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoRun) {
      void run();
    }
  }, [autoRun]);

  if (typeof window !== "undefined" && !window.location.hostname.match(/localhost|127\.0\.0\.1|::1|\.local/i)) {
    return null;
  }

  const level = data?.verdict.level ?? "fail";

  const tone: Record<
    "pass" | "warn" | "fail",
    { ring: string; bg: string; badge: string; icon: typeof CheckCircle2; title: string }
  > = {
    pass: {
      ring: "ring-green-200",
      bg: "bg-green-50 text-green-900",
      badge: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      title: "PASS",
    },
    warn: {
      ring: "ring-amber-200",
      bg: "bg-amber-50 text-amber-900",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      icon: AlertTriangle,
      title: "WARN",
    },
    fail: {
      ring: "ring-rose-200",
      bg: "bg-rose-50 text-rose-900",
      badge: "bg-rose-100 text-rose-800 border-rose-200",
      icon: XCircle,
      title: "FAIL",
    },
  };

  const t = tone[level];
  const StatusIcon = t.icon;

  return (
    <div className="w-full border-t border-slate-200 bg-slate-50/60 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={cn(
            "flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm ring-1 sm:flex-row sm:items-center sm:justify-between sm:p-5",
            t.ring
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                t.bg
              )}
            >
              <StatusIcon className="h-5.5 w-5.5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    t.badge
                  )}
                >
                  Supabase
                  <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                  {t.title}
                </span>
                <Badge variant="outline" className="gap-1 text-[10px] font-medium">
                  Phase 8 Debug
                </Badge>
                {loading && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Testing…
                  </Badge>
                )}
                {!loading && data && (
                  <span className="text-[11px] text-slate-500">
                    {data.totalMs}ms · phase {data.phase}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {loading
                  ? "Pinging Supabase…"
                  : data
                    ? data.verdict.headline
                    : error
                      ? `Fetch error: ${error}`
                      : "Click Run Test to validate connection."}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Temporary panel — delete once Postgres tables & RLS are in place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void run()}
              size="sm"
              disabled={loading}
              variant="outline"
              className="h-9"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? "Running…" : "Run test"}
            </Button>
            <Button
              onClick={() => window.open("/api/test-supabase", "_blank")}
              size="sm"
              variant="ghost"
              className="h-9"
            >
              View JSON ↗
            </Button>
            <Button
              onClick={() => setExpanded((x) => !x)}
              size="sm"
              variant="ghost"
              className="h-9"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Details
            </Button>
          </div>
        </div>

        {expanded && data && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Env
                </p>
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                {Object.entries(data.environment).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="truncate font-mono text-slate-800" title={v}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Network
                </p>
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">rest/v1</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      data.network?.restPing.ok
                        ? "text-green-700"
                        : "text-rose-700"
                    )}
                  >
                    {data.network?.restPing.ok ? "OK" : "FAIL"} ·{" "}
                    {data.network?.restPing.status}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Latency</dt>
                  <dd className="font-mono text-slate-800">
                    {data.network?.restPing.ms}ms
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Server</dt>
                  <dd className="truncate font-mono text-slate-800">
                    {data.network?.restPing.serverHeader ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  SDK
                </p>
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Query reached</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      data.sdk?.tableQuery.reached
                        ? "text-green-700"
                        : "text-rose-700"
                    )}
                  >
                    {data.sdk?.tableQuery.reached ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Rows returned</dt>
                  <dd className="font-mono text-slate-800">
                    {data.sdk?.tableQuery.rowsReturned ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 truncate">Expected?</dt>
                  <dd
                    className={cn(
                      "text-right font-semibold",
                      data.sdk?.tableQuery.isExpectedError === true
                        ? "text-green-700"
                        : data.sdk?.tableQuery.isExpectedError === false
                          ? "text-rose-700"
                          : "text-slate-400"
                    )}
                  >
                    {data.sdk?.tableQuery.isExpectedError === true
                      ? "Yes — no tables yet"
                      : data.sdk?.tableQuery.isExpectedError === false
                        ? "No"
                        : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500 truncate">Error</dt>
                  <dd
                    className={cn(
                      "text-right",
                      data.sdk?.tableQuery.errorMessage
                        ? "text-amber-700"
                        : "text-slate-400"
                    )}
                  >
                    {data.sdk?.tableQuery.errorMessage ?? "none"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Auth
                </p>
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Auth module</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      data.auth?.sessionOk
                        ? "text-green-700"
                        : "text-rose-700"
                    )}
                  >
                    {data.auth?.sessionOk ? "OK" : "FAIL"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Active session</dt>
                  <dd className="font-mono text-slate-800">
                    {data.auth?.hasSession ? "Yes" : "None (expected)"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Timestamp</dt>
                  <dd className="truncate font-mono text-slate-800">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {expanded && data && (
          <ol className="mt-4 list-decimal space-y-1 rounded-xl border border-slate-200 bg-white p-4 pl-8 text-xs text-slate-600">
            {data.verdict.nextSteps.map((s, i) => (
              <li key={i} className="marker:text-slate-400">
                {s}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
