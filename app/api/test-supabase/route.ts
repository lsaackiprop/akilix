import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = performance.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const mask = (s: string) =>
    s ? `${s.slice(0, 10)}…${s.slice(-4)} (len=${s.length})` : "<MISSING>";

  const environment = {
    url: url ? `${url.split("://")[0]}://${url.split("/")[2]}` : "<MISSING>",
    anonKey: mask(anon),
    hasServiceRole: String(Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)),
    hasJwtSecret: String(Boolean(process.env.SUPABASE_JWT_SECRET)),
  };

  const fail = (
    headline: string,
    nextSteps: string[],
    extra: Record<string, unknown> = {},
    status = 503
  ) =>
    NextResponse.json(
      {
        ok: false,
        phase: "preflight",
        timestamp: new Date().toISOString(),
        environment,
        verdict: {
          level: "fail" as const,
          headline,
          nextSteps,
        },
        totalMs: Math.round(performance.now() - startedAt),
        ...extra,
      },
      {
        status,
        headers: { "cache-control": "no-store, no-cache, must-revalidate" },
      }
    );

  if (!url || !anon) {
    return fail(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      [
        "Open .env.local in the project root",
        "Paste NEXT_PUBLIC_SUPABASE_URL=… and NEXT_PUBLIC_SUPABASE_ANON_KEY=…",
        "Restart `next dev` so env vars are reloaded.",
      ]
    );
  }

  try {
    // ------------------------------------------------------------
    // LAYER 1 — Raw REST ping to /auth/v1/settings (anon-accessible)
    //          Verifies: DNS, TLS, project reachable, auth API ON, anon key valid,
    //                    REST gateway ON.
    // ------------------------------------------------------------
    const restStart = performance.now();
    const rest = await fetch(`${url}/auth/v1/settings`, {
      method: "GET",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: "application/json",
        "x-application-name": "Akilix-Connection-Test",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const restMs = Math.round(performance.now() - restStart);
    const serverHeader = rest.headers.get("server");
    let bodySnippet = "";
    try {
      const body = await rest.text();
      bodySnippet = body.slice(0, 240);
    } catch {
      bodySnippet = "<unreadable body>";
    }

    const network = {
      restPing: {
        status: rest.status,
        statusText: rest.statusText,
        ok: rest.ok,
        ms: restMs,
        serverHeader,
        bodySnippet: bodySnippet || "(empty response — OK)",
      },
    };

    // ------------------------------------------------------------
    // LAYER 2 — Supabase SDK via @supabase/supabase-js
    //          Verifies: SDK instantiates correctly, auth module,
    //                     anonymous REST calls reach PostgREST.
    // ------------------------------------------------------------
    const supabase = createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "x-application-name": "Akilix-Connection-Test" } },
    });

    const authStart = performance.now();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    const authMs = Math.round(performance.now() - authStart);
    const auth = {
      sessionOk: !authError,
      hasSession: Boolean(session),
      ms: authMs,
    };

    const sdkStart = performance.now();
    const { data, error, count } = await supabase
      .from("_health")
      .select("*", { head: true, count: "exact" })
      .limit(0)
      .abortSignal(AbortSignal.timeout(15000));
    const sdkMs = Math.round(performance.now() - sdkStart);

    const isTransportError =
      error &&
      /FetchError|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network|timeout/i.test(
        error.message + " " + ((error as unknown as { code?: string }).code ?? "")
      );

    const expectedOkMessages = [
      "does not exist",
      "permission denied",
      "row level security",
      "RLS",
    ];
    const isExpectedError =
      !!error &&
      expectedOkMessages.some((m) =>
        (error.message + " " + (error.hint ?? "")).toLowerCase().includes(m.toLowerCase())
      );

    const sdkReached = !isTransportError;
    const sdkOk = !error || isExpectedError;

    const sdk = {
      tableQuery: {
        ok: sdkOk,
        reached: sdkReached,
        rowsReturned: Array.isArray(data) ? data.length : 0,
        countFound: count,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorHint: error?.hint,
        isExpectedError,
        ms: sdkMs,
      },
    };

    // ------------------------------------------------------------
    // VERDICT
    // ------------------------------------------------------------
    const networkOk = network.restPing.ok;
    const authOk = auth.sessionOk;
    let verdict: {
      level: "pass" | "warn" | "fail";
      headline: string;
      nextSteps: string[];
    };

    if (networkOk && sdkReached && authOk) {
      verdict = {
        level: "pass",
        headline: "Supabase connection is healthy ✅",
        nextSteps: [
          "Phase 9 — Define Postgres tables: profiles, subjects, learning_levels, resources, past_papers, etc.",
          "Phase 10 — Enable Auth (Email + Phone OTP) in the Supabase dashboard for Kenyan learners.",
          "Phase 11 — Create Storage buckets `images/` and `resources/` with appropriate RLS.",
          "REMINDER — when tables + RLS are live, delete this test:",
          "  • Delete app/api/test-supabase/route.ts",
          "  • Delete src/components/debug/SupabaseConnectionDebug.tsx",
          "  • Remove the import and <SupabaseConnectionDebug /> from app/(home)/page.tsx.",
        ],
      };
    } else if (!networkOk) {
      verdict = {
        level: "fail",
        headline: "Network layer cannot reach Supabase REST API.",
        nextSteps: [
          `Raw /auth/v1/settings returned HTTP ${network.restPing.status}: ${network.restPing.statusText}`,
          "Check VPN / proxy / firewall — *.supabase.co must be reachable on port 443.",
          "Verify anon key length — it should be 200+ chars; easy to truncate on paste.",
          "Open dashboard → Project → Settings → General to confirm project is not paused.",
        ],
      };
    } else if (!sdkReached) {
      verdict = {
        level: "warn",
        headline: "REST works but SDK transport error on `.from()` call.",
        nextSteps: [
          `SDK msg: ${sdk.tableQuery.errorCode} — ${sdk.tableQuery.errorMessage}`,
          "Retry from a network that allows outbound 443 to Supabase IP ranges.",
          "If behind corporate TLS inspection, add Supabase hostnames to an allowlist.",
        ],
      };
    } else {
      verdict = {
        level: "warn",
        headline: "Connection partially OK — check auth or service roles.",
        nextSteps: [
          "Enable Email provider in dashboard → Authentication → Providers → Email.",
          "To run server-side admin operations later: paste SUPABASE_SERVICE_ROLE_KEY into .env.local.",
          "All clear? Proceed to Phase 9 — create Postgres tables + RLS.",
        ],
      };
    }

    const okFinal = verdict.level === "pass";
    return NextResponse.json(
      {
        ok: okFinal,
        phase: "done",
        timestamp: new Date().toISOString(),
        environment,
        network,
        sdk,
        auth,
        verdict,
        totalMs: Math.round(performance.now() - startedAt),
      },
      {
        status: okFinal || verdict.level === "warn" ? 200 : 502,
        headers: { "cache-control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (raw) {
    const e = raw as Error & { code?: string; cause?: unknown };
    return fail(
      `Unhandled exception: ${e.name} — ${e.message}`,
      [
        e.code ? `Node error code: ${e.code}` : "",
        "If ECONNREFUSED / ENOTFOUND → check internet + project URL.",
        "If timeout → free project may be paused → resume on dashboard.",
      ].filter(Boolean),
      {
        exception: {
          name: e.name,
          message: e.message,
          code: e.code,
          stack: process.env.NODE_ENV === "development" ? e.stack : undefined,
        },
      },
      500
    );
  }
}
