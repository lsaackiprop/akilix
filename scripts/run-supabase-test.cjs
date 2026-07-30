const http = require("http");
const fs = require("fs");
const path = require("path");
const url = "http://localhost:3000/api/test-supabase";
const t0 = Date.now();

const req = http.get(
  url,
  {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-store",
    },
    timeout: 90000,
  },
  (res) => {
    let body = "";
    res.setEncoding("utf8");
    res.on("data", (c) => (body += c));
    res.on("end", () => {
      const ms = Date.now() - t0;
      let j;
      try {
        j = JSON.parse(body);
      } catch {
        console.log("STATUS", res.statusCode, "TIME", ms + "ms");
        console.log(body.slice(0, 800));
        fs.writeFileSync(path.join(__dirname, "test-supabase-last.json"), JSON.stringify({ status: res.statusCode, timeMs: ms, rawBody: body }, null, 2));
        process.exit(res.statusCode === 200 ? 0 : 1);
      }
      const logPath = path.join(__dirname, "test-supabase-last.json");
      fs.writeFileSync(logPath, JSON.stringify(j, null, 2));
      console.log("HTTP " + res.statusCode + " | ROUND-TRIP: " + ms + "ms");
      console.log("");
      console.log("==================== VERDICT ====================");
      console.log("  Level:   ", j.verdict?.level);
      console.log("  Headline:", j.verdict?.headline);
      console.log("");
      console.log("==================== LAYERS =====================");
      console.log("  Env URL:", j.environment?.url);
      console.log("  AnonKey:", j.environment?.anonKey);
      console.log(
        "  Network:",
        (j.network?.restPing?.ok ? "PASS" : "FAIL"),
        "(HTTP",
        j.network?.restPing?.status,
        "|",
        j.network?.restPing?.ms,
        "ms | server:",
        j.network?.restPing?.serverHeader,
        ")"
      );
      const rows = Array.isArray(j.sdk?.tableQuery?.data)
        ? j.sdk.tableQuery.data.length
        : 0;
      console.log(
        "  SDK:    ",
        "reached=" + j.sdk?.tableQuery?.reached,
        "ok=" + j.sdk?.tableQuery?.ok,
        "| rows=" + rows,
        "| ms=" + j.sdk?.tableQuery?.ms
      );
      if (j.sdk?.tableQuery?.errorMessage) {
        console.log(
          "  SDK err: (",
          j.sdk.tableQuery.errorCode,
          ") ",
          j.sdk.tableQuery.errorMessage
        );
        if (j.sdk.tableQuery.errorHint)
          console.log("  SDK hint:", j.sdk.tableQuery.errorHint);
      }
      console.log(
        "  Auth:   ",
        "sessionOk=" + j.auth?.sessionOk,
        "hasSession=" + j.auth?.hasSession,
        "ms=" + j.auth?.ms
      );
      console.log(
        "  Total:",
        j.totalMs + "ms",
        "| phase:",
        j.phase,
        "| ok=" + j.ok
      );
      console.log("");
      console.log("================== NEXT STEPS ===================");
      (j.verdict?.nextSteps || []).forEach((s, i) =>
        console.log("  " + (i + 1) + ". " + s)
      );
      console.log("");
      console.log("(Full response saved to", logPath, ")");
      process.exit(j.ok ? 0 : j.verdict.level === "warn" ? 0 : 1);
    });
  }
);

req.on("timeout", () => {
  console.error("HTTP CLIENT TIMEOUT");
  req.destroy(new Error("Request timed out"));
});
req.on("error", (e) => {
  console.error("FETCH FAIL:", e.message);
  process.exit(1);
});
req.end();
