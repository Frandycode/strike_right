/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — proves "npm run test:log" reports a failing run with a non-zero exit code

   Run with the server NOT running:   npm run test:exitcheck
   It runs "npm run test:log", which must fail at startup, then checks the exit status and results/run.txt.
   Note: this overwrites results/run.txt; run "npm run test:log" with the server up afterwards.
*/
const { spawnSync } = require("child_process");
const fs = require("fs"), path = require("path");
const BASE = process.env.BASE || "http://localhost:8787";
const LOG = path.join(__dirname, "results", "run.txt");
let failed = 0;
const out = (ok, m) => { console.log((ok ? "PASS " : "FAIL ") + m); if (!ok) failed++; };
(async () => {
  try { await fetch(BASE + "/"); console.error(`A server is answering at ${BASE}. Stop it first, then rerun this check.`); process.exit(2); } catch (e) {}
  const r = spawnSync("npm", ["run", "--silent", "test:log"], { cwd: __dirname, encoding: "utf8", env: process.env });
  const log = fs.existsSync(LOG) ? fs.readFileSync(LOG, "utf8") : "";
  out(r.status !== 0 && r.status !== null, `npm run test:log exits non-zero without a server (exit ${r.status})`);
  out(/^Date: \d{4}-\d\d-\d\dT/m.test(log) && /^Command: node run-tests\.js --log results\/run\.txt/m.test(log), "results/run.txt records the date and command");
  out(/^FAIL Server reachable at /m.test(log), "results/run.txt records the startup failure");
  out(/^0 passed, 1 failed$/m.test(log) && new RegExp(`^Exit code: ${r.status}$`, "m").test(log), `results/run.txt records the counts and exit code ${r.status}`);
  process.exit(failed ? 1 : 0);
})();
