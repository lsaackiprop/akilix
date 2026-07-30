const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const t0 = Date.now();
const envPath = path.join(__dirname, "..", ".env.local");
const vars = {};
try {
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    vars[m[1]] = v;
  }
} catch (e) {
  console.error("FAIL: cannot read .env.local:", e.message);
  process.exit(1);
}

const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const key = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function mask(s) {
  if (!s) return "<MISSING>";
  return s.slice(0, 10) + "…" + s.slice(-4) + " (len=" + s.length + ")";
}
console.log("Supabase URL :", url);
console.log("Anon key     :", mask(key));
if (!url || !key) {
  console.error("FAIL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing.");
  process.exit(1);
}

(async () => {
  console.log("\n== LAYER 1: raw REST /auth/v1/settings ==");
  let layer1 = null;
  try {
    const t1 = Date.now();
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20000),
    });
    const body = await res.text();
    layer1 = {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - t1,
      server: res.headers.get("server"),
      snippet: body ? body.slice(0, 120) : "(empty response — OK)",
    };
    console.log("  status:", res.status, res.ok ? "✅ OK (auth reachable)" : "❌");
    console.log("  time  :", layer1.ms, "ms");
    console.log("  server:", layer1.server);
    console.log("  body  :", layer1.snippet);
  } catch (e) {
    console.error("  ❌ Network FAIL:", e.message);
    layer1 = { ok: false, error: e.message };
  }

  console.log("\n== LAYER 2: SDK instantiation + auth.getSession() ==");
  let auth = null;
  let sdk = null;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const t2 = Date.now();
    const { data, error } = await supabase.auth.getSession();
    auth = { ok: !error, hasSession: Boolean(data.session), ms: Date.now() - t2, errMsg: error?.message };
    console.log("  ok/hasSession :", auth.ok, "/", auth.hasSession, "(expected: true / false — no user logged in yet)");
    console.log("  time          :", auth.ms, "ms");

    console.log("\n== LAYER 3: SDK .from() table call on empty project ==");
    const t3 = Date.now();
    const { data: rows, error: sqlErr, count } = await supabase
      .from("profiles")
      .select("*", { head: true, count: "exact" })
      .limit(0);
    sdk = {
      ok: !sqlErr,
      ms: Date.now() - t3,
      rows: Array.isArray(rows) ? rows.length : 0,
      count,
      errCode: sqlErr?.code,
      errMsg: sqlErr?.message,
      errHint: sqlErr?.hint,
    };
    const knownGood = /does not exist|permission denied|row level security|relation .* does not exist|PGRST/i;
    const expectedError = sdk.errMsg && knownGood.test(sdk.errMsg + " " + (sdk.errCode || ""));
    const sdkStructured = !sdk.ok === false || expectedError || sdk.rows === 0;
    const connected = !/ECONN|ENOTFOUND|ETIMEDOUT|FetchError|network|timeout/i.test(sdk.errMsg || "");
    console.log("  time        :", sdk.ms, "ms");
    console.log("  rows/count  :", sdk.rows, "/", sdk.count ?? "(no rows yet — expected)");
    console.log("  raw .ok     :", sdk.ok, "(ok=true with empty rows == connection ✅)");
    console.log("  message     :", sdk.errMsg ? `(${sdk.errCode || "?"}) ${sdk.errMsg}` : "(empty — no table yet)");
    console.log("  expect-error (no tables yet) :", expectedError ? "✅ YES — OK" : "N/A (empty pass or new)");
    console.log("  no-transport-error           :", connected ? "✅ YES" : "❌ NO");
    console.log("  SDK-structured-response-OK   :", sdkStructured ? "✅ YES" : "?");
  } catch (e) {
    console.error("  ❌ SDK threw:", e.message);
    if (!auth) auth = { ok: false, hasSession: false, ms: 0, errMsg: e.message };
    sdk = { ok: false, ms: 0, rows: 0, count: null, errMsg: e.message };
  }

  console.log("\n===========================================");
  const sdkLooksHealthy = auth?.ok === true && (sdk?.ok || !!(sdk?.errMsg && /does not exist|permission|PGRST/i.test(sdk.errMsg)));
  const pass = layer1?.ok && sdkLooksHealthy;
  const level = pass ? "✅ PASS" : layer1?.ok ? "⚠️  WARN (connection OK)" : "❌ FAIL";
  console.log("OVERALL:", level, "| total time:", Date.now() - t0, "ms");
  console.log("\nNEXT STEPS:");
  if (pass) {
    console.log("  1. Phase 9 — Create Postgres tables.");
    console.log("  2. Phase 10 — Enable Auth providers (Email + Phone OTP).");
    console.log("  3. Phase 11 — Create Storage buckets `images/` & `resources/` + RLS.");
    console.log("");
    console.log("  🧹 Cleanup (run AFTER tables + RLS are live):");
    console.log("     • Delete app/api/test-supabase/route.ts");
    console.log("     • Delete src/components/debug/SupabaseConnectionDebug.tsx");
    console.log("     • Remove debug banner import + <SupabaseConnectionDebug /> from app/(home)/page.tsx");
    console.log("     • Remove scripts/direct-supabase-test.cjs + scripts/quick-smoke.cjs + scripts/run-supabase-test.cjs");
  } else if (layer1?.ok) {
    console.log("  Connection to Supabase is working — proceed with Phase 9 (tables + RLS).");
    if (sdk?.errMsg) console.log("  SDK details:", sdk.errCode, sdk.errMsg, sdk.errHint || "");
    if (auth?.errMsg) console.log("  Auth details:", auth.errMsg);
  } else {
    console.log("  1. Verify Supabase project at app.supabase.com is NOT paused.");
    console.log("  2. Confirm *.supabase.co reachable on :443 via current network.");
    console.log("  3. Re-copy anon key — check first/last chars match the dashboard value.");
  }
  process.exit(pass || layer1?.ok ? 0 : 1);
})();
