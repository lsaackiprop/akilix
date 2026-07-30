const http = require("http");
const MAX_TIMEOUT = 45000;
const hits = [
  { name: "HOME", path: "/" },
  { name: "TEST", path: "/api/test-supabase" },
];

function runOne({ name, path }, timeout = MAX_TIMEOUT) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const req = http.get(
      `http://localhost:3000${path}`,
      { headers: { "Cache-Control": "no-store" } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          const ms = Date.now() - t0;
          if (name === "HOME") {
            const title =
              body.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.slice(0, 120) ??
              "(no title)";
            resolve({ name, status: res.statusCode, ms, extra: title });
          } else {
            let parsed = null;
            try {
              parsed = JSON.parse(body);
            } catch {
              // ignore
            }
            resolve({
              name,
              status: res.statusCode,
              ms,
              verdict: parsed?.verdict ?? null,
              env: parsed?.environment ?? null,
              network: parsed?.network?.restPing ?? null,
              sdk: parsed?.sdk?.tableQuery
                ? {
                    reached: parsed.sdk.tableQuery.reached,
                    ok: parsed.sdk.tableQuery.ok,
                    rows: Array.isArray(parsed.sdk.tableQuery.data)
                      ? parsed.sdk.tableQuery.data.length
                      : 0,
                    error: parsed.sdk.tableQuery.errorMessage ?? null,
                    errorCode: parsed.sdk.tableQuery.errorCode ?? null,
                    ms: parsed.sdk.tableQuery.ms,
                  }
                : null,
              auth: parsed?.auth ?? null,
              totalMs: parsed?.totalMs ?? null,
              phase: parsed?.phase ?? null,
            });
          }
        });
      }
    );
    req.setTimeout(timeout, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", (e) => {
      resolve({
        name,
        status: 0,
        ms: Date.now() - t0,
        error: String(e.message),
      });
    });
    req.end();
  });
}

(async () => {
  console.log("Hitting http://localhost:3000/ …");
  const home = await runOne(hits[0]);
  console.log(
    `\n[${home.name}] HTTP ${home.status || "ERR"}  |  ${home.ms}ms`
  );
  if (home.error) console.log("  error:", home.error);
  else console.log("  title:", home.extra);

  console.log("\nHitting /api/test-supabase (up to 90s on cold Supabase call…)");
  const test = await runOne(hits[1], 120000);
  console.log(
    `\n[${test.name}] HTTP ${test.status || "ERR"}  |  ${test.ms}ms  |  phase=${test.phase ?? "?"}`
  );
  if (test.error) {
    console.log("  error:", test.error);
    process.exit(1);
  }
  console.log("\n-- verdict:\n  level   :", test.verdict?.level);
  console.log("  headline:", test.verdict?.headline);
  console.log("\n-- env:");
  console.log("  url    :", test.env?.url);
  console.log("  key    :", test.env?.anonKey);
  console.log("  service_role set:", test.env?.hasServiceRole);
  console.log("\n-- network ping:");
  console.log("  ok/status/ms/server :", test.network?.ok, test.network?.status, test.network?.ms, test.network?.serverHeader);
  console.log("\n-- sdk query:");
  console.log("  reached  :", test.sdk?.reached);
  console.log("  ok       :", test.sdk?.ok);
  console.log("  rows     :", test.sdk?.rows);
  console.log("  err(code) :", test.sdk?.error ? `(${test.sdk.errorCode}) ${test.sdk.error}` : "(none)");
  console.log("  sdk ms   :", test.sdk?.ms);
  console.log("\n-- auth:");
  console.log("  sessionOk/hasSession :", test.auth?.sessionOk, test.auth?.hasSession, "ms =", test.auth?.ms);
  console.log("\n-- total server totalMs :", test.totalMs);
  console.log("\n-- NEXT STEPS:");
  (test.verdict?.nextSteps || []).forEach((s, i) =>
    console.log(" ", `${i + 1}. ${s}`)
  );
  console.log("");
})();
