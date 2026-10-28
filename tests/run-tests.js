/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — headless browser tests for the multi-page site (Playwright + axe)

   Needs: npm install (in tests/), and the site served by wrangler:
     cd .. && tests/node_modules/.bin/wrangler dev --config wrangler.jsonc --port 8787
   Run:   node run-tests.js            (BASE=http://localhost:8787 by default)
          npm run test:log             = node run-tests.js --log results/run.txt
                                         prints as usual and also writes every line, the date, the command,
                                         the counts and the exit code to the log; exits with the real code
   Exit-code check (run with the server NOT running):
          npm run test:exitcheck       runs test:log, expects a non-zero exit and the failure + exit code in
                                         results/run.txt (check-exit-code.js)
*/
const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const BASE = process.env.BASE || "http://localhost:8787";
const fs = require("fs"), path = require("path");
const PUBLIC = path.join(__dirname, "..", "public");
/* axe-core fetches the page's Google Fonts stylesheet itself while auditing. That single request (connect-src,
   this exact URL) is the only thing ever ignored, and only while axe runs. Everything else is reported. */
const FONT_CSS = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8").match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/)[1].replace(/&amp;/g, "&");
const AXE_FONT_CONSOLE = `Refused to connect to '${FONT_CSS}' because it violates the following Content Security Policy directive: "connect-src 'self' https://cloudflareinsights.com".`;
const auditNoise = (page, text) => page.__axe && text.trim() === AXE_FONT_CONSOLE;
let pass = 0, fail = 0;
/* --log <file>: mirror console output to the file, framed by date, command, counts and exit code */
const logAt = process.argv.indexOf("--log");
const LOG = logAt > -1 ? path.resolve(process.cwd(), process.argv[logAt + 1] || "results/run.txt") : null;
if (LOG) {
  const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const stamp = new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off >= 0 ? "+" : "-") + pad(off / 60) + ":" + pad(off % 60);
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, `Date: ${stamp}\nCommand: node ${path.basename(process.argv[1])} ${process.argv.slice(2).join(" ")} (BASE=${BASE})\n\n`);
  const util = require("util");
  for (const k of ["log", "error"]) {
    const orig = console[k].bind(console);
    console[k] = (...a) => { orig(...a); fs.appendFileSync(LOG, a.map(x => typeof x === "string" ? x : util.inspect(x)).join(" ") + "\n"); };
  }
}
let finished = false;
function finish(code) {
  if (finished) return; finished = true;
  console.log(`\n${pass} passed, ${fail} failed`);
  console.log(`Exit code: ${code}`);
  process.exit(code);
}
process.on("unhandledRejection", e => { console.error(e); fail++; finish(1); });
const out = (ok, m) => { console.log((ok ? "PASS " : "FAIL ") + m); ok ? pass++ : fail++; };
const eq = (a, b, m) => out(a === b, `${m} (got ${JSON.stringify(a)}${a === b ? "" : ", want " + JSON.stringify(b)})`);

/* Every page: collect console errors, page errors and CSP violations. The analytics report endpoint
   rejects origins with a port (localhost:8787), so only that POST is answered locally; the real beacon
   script still loads from static.cloudflareinsights.com under the real CSP. */
async function open(browser, { width = 1280, scheme = "light", url = "/", storage = null, reduced = "no-preference" } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: reduced });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.route("https://cloudflareinsights.com/cdn-cgi/rum**", r => r.fulfill({ status: 204, headers: { "access-control-allow-origin": BASE, "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-credentials": "true" } }));
  await ctx.addInitScript(([s, fontCss]) => {
    window.__csp = []; window.__axe = false; window.__alerts = 0; window.alert = () => { window.__alerts++; };
    document.addEventListener("securitypolicyviolation", e => {
      if (window.__axe && e.violatedDirective === "connect-src" && e.blockedURI === fontCss) return;
      window.__csp.push(e.violatedDirective + " " + e.blockedURI + " " + (e.sample || "")); });
    window.__printed = 0; window.print = () => { window.__printed++; };
    if (s && !sessionStorage.getItem("__seeded")) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem("__seeded", "1"); }
  }, [storage, FONT_CSS]);
  const page = await ctx.newPage();
  page.__errors = [];
  page.on("console", m => { if (auditNoise(page, m.text())) return;
    /* The 404 page's own HTTP status is logged by the browser; only that exact request is expected */
    if (page.__expect404 && m.text().startsWith("Failed to load resource: the server responded with a status of 404") && m.location().url === page.__expect404) return; if (m.type() === "error" || /Content Security Policy/i.test(m.text())) page.__errors.push(m.text()); });
  page.on("pageerror", e => page.__errors.push("pageerror: " + e.message));
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  return { ctx, page };
}
const txt = (p, s) => p.locator(s).first().innerText();
const ids = p => p.$$eval(".item input", els => els.map(e => e.dataset.id));
const groups = p => p.$$eval(".group-head h2", hs => hs.map(h => h.textContent));
const PAGES = ["/", "/checklist/", "/help/", "/llc/", "/selling/", "/grow/", "/letters/", "/guides/", "/about/"];
/* The Home hero form, or the profile panel (from the header chip) on every other page */
async function setPicker(p, { zip, state, city, type, hire, where } = {}) {
  const hero = await p.locator('[data-form="hero"]').count();
  let pre = "#";
  if (!hero) { if (!(await p.isVisible("#profilePanel"))) await p.click("#profileBtn"); pre = "#p-"; }
  if (zip !== undefined) await p.fill(pre + "zip", zip);
  if (state !== undefined) await p.selectOption(pre + "state", state);
  if (city !== undefined) { await p.fill(pre + "city", city); await p.waitForTimeout(400); }
  if (type !== undefined) await p.selectOption(pre + "btype", type);
  if (where !== undefined) await p.selectOption(pre + "where", where);
  if (hire !== undefined) await p.setChecked(pre + "hire", hire);
  if (!hero) await p.keyboard.press("Escape");
}
const go = async (p, url) => { p.__errors.length = 0; await p.goto(BASE + url, { waitUntil: "networkidle" }); };
async function axeCheck(page, tag, during = null) {
  page.__axe = true; await page.evaluate(() => { window.__axe = true; });
  if (during) await page.evaluate(during);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  await page.waitForTimeout(300); await page.evaluate(() => { window.__axe = false; }); page.__axe = false;
  const v = axe.violations.map(x => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map(n => n.target.join(" ")).join(", ")}`);
  out(v.length === 0, `${tag}: axe WCAG 2.1 AA, including color contrast${v.length ? " — " + v.join(" | ") : ""}`);
}
const clean = async (p, m) => { const csp = await p.evaluate(() => window.__csp); eq(csp.length, 0, `${m}: no CSP violations`); eq(p.__errors.length, 0, `${m}: no console errors${p.__errors.length ? " — " + p.__errors.slice(0, 3).join(" | ") : ""}`); };

(async () => {
  /* Fail fast, and visibly, when the site isn't being served */
  try { const r = await fetch(BASE + "/"); if (!r.ok) throw new Error("HTTP " + r.status); }
  catch (e) {
    out(false, `Server reachable at ${BASE} (${(e.cause && (e.cause.code || e.cause.message)) || e.message}). Start it from the project root: tests/node_modules/.bin/wrangler dev --config wrangler.jsonc --port 8787`);
    return finish(1);
  }
  const browser = await chromium.launch();

  /* 1. Every page at 360 / 768 / 1280, light and dark, English and Spanish: layout, axe, CSP, console */
  for (const width of [360, 768, 1280]) for (const scheme of ["light", "dark"]) {
    const tag = `${width}px ${scheme}`;
    const { ctx, page } = await open(browser, { width, scheme, url: "/?zip=75201&city=Dallas&type=food&hire=1&reach=some&picks=OK,CA,NY" });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    out(scheme === "dark" ? bg === "rgb(16, 22, 19)" : bg === "rgb(245, 246, 244)", `${tag}: theme background ${bg}`);
    for (const p of [...PAGES, "/does-not-exist"]) for (const lang of ["en", "es"]) {
      const t = `${tag} ${lang} ${p}`;
      page.__expect404 = p === "/does-not-exist" ? BASE + p + `?lang=${lang}` : null;
      await go(page, `${p}?lang=${lang}`);
      for (const sel of ["details", ".phase"]) await page.$$eval(sel, ds => ds.forEach(d => d.open = true));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      out(over <= 0, `${t}: no horizontal scroll (overflow ${over}px)`);
      if (p === "/grow/") for (const tab of ["pilot", "trial", "promo", "chan", "rules"]) {
        await page.click(`#tab-${tab}`);
        const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (o2 > 0) out(false, `${t}: horizontal scroll on tab ${tab} (${o2}px)`);
      }
      await axeCheck(page, t);
      await clean(page, t);
    }
    await ctx.close();
  }

  /* 2. ZIP to state detection (Home form) */
  {
    const { ctx, page } = await open(browser);
    for (const [zip, st] of [["75201", "Texas"], ["74103", "Oklahoma"], ["10001", "New York"], ["90210", "California"], ["99501", "Alaska"], ["73301", "Texas"]]) {
      await page.fill("#zip", zip);
      eq(await page.inputValue("#state"), st, `ZIP ${zip} detects ${st}`);
    }
    await page.fill("#zip", "00012"); eq(await txt(page, "#zipHint"), "Not a U.S. state ZIP. Pick your state instead.", "Invalid ZIP shows a hint");
    await page.fill("#zip", "75a"); eq(await page.inputValue("#zip"), "75", "ZIP strips non-digits");
    await clean(page, "ZIP"); await ctx.close();
  }

  /* 3. Type switching changes checklist items and resource filtering */
  {
    const { ctx, page } = await open(browser, { url: "/checklist/" });
    await setPicker(page, { state: "California", type: "software" });
    let i = await ids(page);
    out(i.includes("sw-pay") && i.includes("idea-mvp") && !i.includes("fd-health"), "Software type adds software items");
    await go(page, "/help/");
    let names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("SBIR / STTR programs") && !names.includes("FDA food guidance"), "Software type shows SBIR and hides FDA food guidance");
    eq(await page.locator(".card:has-text('SBIR / STTR programs') .pill.fit").count(), 1, "SBIR card has a Best fit badge for software");
    await setPicker(page, { type: "food" });
    names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("FDA food guidance") && !names.includes("SBIR / STTR programs"), "Food type shows FDA guidance, hides SBIR (applied immediately on the page)");
    await page.click("#helpToggle");
    names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("SBIR / STTR programs"), "Show all reveals hidden resources");
    await page.click("#helpToggle");
    await go(page, "/checklist/");
    i = await ids(page);
    out(i.includes("fd-health") && i.includes("fd-cottage") && !i.includes("sw-pay"), "Food type swaps in food items");
    await setPicker(page, { hire: true }); i = await ids(page);
    out(i.includes("hire-1") && i.includes("hire-4"), "Hiring adds hiring items");
    await clean(page, "Types"); await ctx.close();
  }

  /* 4. Oklahoma, Tulsa, Texas and Dallas groups only when expected */
  {
    const { ctx, page } = await open(browser, { url: "/help/" });
    const cases = [
      [{ zip: "", state: "California", city: "" }, []],
      [{ state: "Oklahoma", city: "" }, ["Across Oklahoma"]],
      [{ state: "Oklahoma", city: "Tulsa" }, ["Tulsa area", "Across Oklahoma"]],
      [{ city: "", zip: "74012" }, ["Tulsa area", "Across Oklahoma"]],
      [{ zip: "", state: "Texas", city: "" }, ["Across Texas"]],
      [{ state: "Texas", city: "Plano" }, ["Dallas area", "Across Texas"]],
      [{ state: "Texas", city: "Farmers Branch" }, ["Dallas area", "Across Texas"]],
      [{ state: "Texas", city: "Arlington" }, ["Dallas area", "Across Texas"]],
      [{ city: "", zip: "75201" }, ["Dallas area", "Across Texas"]],
      [{ zip: "75319" }, ["Dallas area", "Across Texas"]],
      [{ zip: "75401" }, ["Across Texas"]],
      [{ zip: "78701" }, ["Across Texas"]],
      [{ zip: "", state: "Oklahoma", city: "Dallas" }, ["Across Oklahoma"]],
      [{ state: "Texas", city: "Tulsa" }, ["Across Texas"]]
    ];
    for (const [pick, want] of cases) {
      await setPicker(page, pick);
      const g = (await groups(page)).filter(x => x !== "Across the U.S.");
      eq(g.join(" + "), want.join(" + "), `Groups for ${JSON.stringify(pick)}`);
    }
    await setPicker(page, { zip: "", state: "Texas", city: "" });
    out((await txt(page, "#helpGroups")).includes("In the Dallas area?"), "Texas outside Dallas shows the Dallas hint");
    await setPicker(page, { city: "Dallas", type: "food" });
    out(await page.locator(".card:has-text('Texas Alcoholic Beverage Commission') .pill.fit").count() === 1, "TABC is a Best fit for food in Texas");
    await setPicker(page, { type: "software" });
    out(await page.locator(".card h3:text-is('Texas Alcoholic Beverage Commission')").count() === 0, "TABC is hidden for software");
    const fresh = await page.$$eval(".group .fresh", f => f.map(x => x.textContent));
    out(fresh.length === 2 && fresh.every(f => f.includes("Last verified: October 2026") && f.includes("Report outdated info")), "Dallas and Texas groups show Last verified + report link");
    const mail = await page.$$eval(".group .fresh a", a => a.map(x => decodeURIComponent(x.href)));
    out(mail[0].startsWith("mailto:frandyslueue@gmail.com?subject=Outdated info: Free help – Dallas area (Texas)"), "Report link subject names the section and state");
    await clean(page, "Groups"); await ctx.close();
  }

  /* 5. Texas checklist items */
  {
    const { ctx, page } = await open(browser, { url: "/checklist/" });
    await setPicker(page, { state: "Texas", type: "retail", hire: false });
    let i = await ids(page);
    out(i.includes("tx-franchise") && i.includes("tx-sales") && !i.includes("tx-twc"), "Texas adds franchise tax and sales tax permit items");
    out((await page.locator("#c-reg-dba + div .why").textContent()).includes("county clerk"), "Texas DBA note explains county clerk vs Secretary of State");
    await setPicker(page, { hire: true }); i = await ids(page);
    out(i.includes("tx-twc") && i.includes("tx-newhire"), "Texas hiring adds TWC and new-hire items");
    await setPicker(page, { state: "Oklahoma" }); i = await ids(page);
    out(!i.some(x => x.startsWith("tx-")), "Oklahoma has no Texas items");
    await clean(page, "Texas items"); await ctx.close();
  }

  /* 6. LLC state picker and table sorting */
  {
    const { ctx, page } = await open(browser, { url: "/llc/" });
    await page.selectOption("#llcState", "Texas");
    const card = await txt(page, "#llcCard");
    out(card.includes("Certificate of Formation") && card.includes("$300") && card.includes("$500,000 in sales"), "LLC card shows Texas document, fee and nexus");
    const fresh = await txt(page, '[data-fresh="llc"]');
    out(fresh.includes("Last verified: October 2026") && fresh.includes("frandyslueue@gmail.com"), "LLC section shows Last verified and the report address");
    await page.click("#llc summary");
    const first = () => page.$eval("#llcTable tbody tr th", t => t.textContent);
    eq(await first(), "Alabama", "Table starts sorted by state");
    await page.click('[data-sort="fee"]'); eq(await first(), "Montana", "Sort by fee ascending: Montana ($35) first");
    eq(await page.getAttribute("#llcTable thead th:nth-child(2)", "aria-sort"), "ascending", "Fee column has aria-sort=ascending");
    await page.click('[data-sort="fee"]'); eq(await first(), "Massachusetts", "Sort by fee descending: Massachusetts first");
    await page.click('[data-sort="ann"]'); eq(await first(), "Arizona", "Sort by ongoing ascending: no-report states first");
    await page.fill("#llcFilter", "new"); eq(await page.locator("#llcTable tbody tr").count(), 4, "Filter 'new' leaves 4 states");
    await page.fill("#llcFilter", "zzz"); out((await txt(page, "#llcTable tbody")).includes("No state matches"), "Filter with no match shows a message");
    await clean(page, "LLC"); await ctx.close();
  }

  /* 7. Selected-state picker and nexus table */
  {
    const { ctx, page } = await open(browser, { url: "/selling/" });
    await setPicker(page, { state: "Texas" });
    await page.click('[data-reach="some"]');
    out(await page.isVisible("#pickWrap"), "Selected states shows the state grid");
    await page.check('#pickGrid input[value="California"]'); await page.check('#pickGrid input[value="Oregon"]'); await page.check('#pickGrid input[value="New York"]');
    eq(await txt(page, "#pickCount"), "3 states selected", "Pick count updates");
    eq(await page.locator("#reachOut tbody tr").count(), 2, "Nexus table lists the 2 picked states that have sales tax");
    out((await txt(page, "#reachOut")).includes("No statewide sales tax: Oregon"), "Oregon listed as no statewide sales tax");
    out((await txt(page, "#reachOut .fresh")).includes("Last verified: October 2026"), "Nexus table shows Last verified");
    out(page.url().includes("/selling/?") && page.url().includes("reach=some") && page.url().includes("picks=CA,NY,OR"), "Picks are written to this page's URL as state codes");
    await page.click("#pickNone"); eq(await txt(page, "#pickCount"), "Select the states where you'll sell", "Clear empties the picks");
    await page.click('[data-reach="all"]'); out(await page.locator("#reachOut tbody tr").count() >= 44, "All states lists every taxing state");
    await clean(page, "Reach"); await ctx.close();
  }

  /* 8. Every letter type renders, in English and Spanish */
  {
    const { ctx, page } = await open(browser, { url: "/letters/?state=TX&city=Dallas" });
    const types = await page.$$eval("#lType option", o => o.map(x => x.value));
    eq(types.length, 7, "Seven letter types");
    await page.fill("#lName", "Jane Founder"); await page.fill("#lBiz", "Acme LLC"); await page.fill("#lContact", "jane@example.com · 214-555-0100");
    const want = { advice: "Request for free advising", pilot: "Pilot proposal", intro: "Helping", partner: "Partnership request", loi: "Letter of intent", program: "Inquiry about", followup: "Thank you, and next steps" };
    for (const t of types) {
      await page.selectOption("#lType", t);
      const l = await txt(page, "#letterOut");
      out(l.includes("Re: " + want[t]) && l.includes("Jane Founder") && l.includes("Sincerely,") && l.includes("Dallas, Texas"), `Letter "${t}" renders`);
    }
    out(!page.url().includes("Jane") && !page.url().includes("example.com") && !page.url().includes("555"), "Letter fields never reach the URL");
    await page.click('[data-lang-set="es"]');
    const wantEs = { advice: "Solicitud de asesoría gratuita", pilot: "Propuesta de prueba piloto", intro: "Cómo ayudar", partner: "Solicitud de alianza", loi: "Carta de intención", program: "Consulta sobre", followup: "Gracias y próximos pasos" };
    for (const t of types) {
      await page.selectOption("#lType", t);
      const l = await txt(page, "#letterOut");
      out(l.includes("Asunto: " + wantEs[t]) && l.includes("Atentamente,") && /de 20\d\d/.test(l), `Spanish letter "${t}" renders`);
    }
    await clean(page, "Letters"); await ctx.close();
  }

  /* 9. Share links round-trip from any page; URL overrides saved choices; each page keeps its own path */
  {
    const { ctx, page } = await open(browser);
    await setPicker(page, { zip: "74103", city: "Tulsa", type: "software", hire: true, where: "online" });
    await go(page, "/selling/");
    await page.click('[data-reach="some"]'); await page.check('#pickGrid input[value="Texas"]'); await page.check('#pickGrid input[value="Kansas"]');
    await go(page, "/letters/"); await page.fill("#lName", "Private Person");
    await go(page, "/checklist/");
    await page.click("#copyLink");
    const link = await page.evaluate(() => navigator.clipboard.readText());
    const u = new URL(link), q = u.searchParams;
    eq(u.pathname, "/checklist/", "Checklist 'copy link' keeps the checklist path");
    eq([...q.keys()].join(","), "zip,state,city,type,where,hire,reach,picks", "Copied link holds only plan parameters");
    eq(q.get("picks"), "KS,TX", "Copied link picks are state codes");
    out(!link.includes("Private"), "Copied link has no letter fields");
    for (const p of ["/", "/help/", "/llc/", "/letters/", "/guides/", "/about/"]) {
      await go(page, p); await page.click("#profileBtn"); await page.click('#profilePanel [data-copy-link]');
      const l2 = await page.evaluate(() => navigator.clipboard.readText()); await page.keyboard.press("Escape");
      const u2 = new URL(l2);
      out(u2.pathname === p && u2.searchParams.get("zip") === "74103" && u2.searchParams.get("type") === "software", `Copy link from ${p} keeps its own path and the plan`);
    }
    await ctx.close();
    const saved = { "biz-starter-guide-v2": JSON.stringify({ zip: "90210", state: "California", city: "Beverly Hills", type: "food", where: "home", hire: false, reach: "home", pick: [], done: { "help-sbdc": true }, open: {}, letter: { lName: "Saved Name" }, llcState: "California" }) };
    const b = await open(browser, { url: link.replace(/^https?:\/\/[^/]+/, ""), storage: saved });
    await b.page.click("#profileBtn");
    const st = await b.page.evaluate(() => { const v = id => document.getElementById(id); return { zip: v("p-zip").value, state: v("p-state").value, city: v("p-city").value, type: v("p-btype").value, where: v("p-where").value, hire: v("p-hire").checked }; });
    await b.page.keyboard.press("Escape");
    eq(JSON.stringify(st), JSON.stringify({ zip: "74103", state: "Oklahoma", city: "Tulsa", type: "software", where: "online", hire: true }), "Opening the link restores the plan over saved choices");
    out(await b.page.isChecked("#c-help-sbdc"), "Saved checkmarks are kept");
    await go(b.page, "/selling/");
    eq(await b.page.$$eval("#pickGrid input:checked", i => i.map(x => x.value).join(",")), "Kansas,Texas", "Shared picks carry to other pages");
    await go(b.page, "/letters/");
    eq(await b.page.inputValue("#lName"), "Saved Name", "Saved letter drafts are kept");
    await go(b.page, "/help/");
    const hl = await b.page.evaluate(() => history.length);
    await setPicker(b.page, { type: "retail" });
    out(b.page.url().includes("/help/?") && b.page.url().includes("type=retail"), "Changing a choice updates this page's URL with replaceState");
    eq(await b.page.evaluate(() => history.length), hl, "No navigation entries added");
    await clean(b.page, "Share links"); await b.ctx.close();
    for (const p of PAGES) {
      const c = await open(browser, { url: p + "?zip=75201&city=Plano&type=food&lang=es" });
      const chip = await c.page.textContent("#chipText");
      out(chip === "Plano, TX · Alimentos" && (await c.page.getAttribute("html", "lang")) === "es", `Share link with ?lang=es works on ${p} (${chip})`);
      await c.ctx.close();
    }
    const c = await open(browser, { url: "/?state=zz&type=bogus&where=moon&picks=XX,TX&reach=some" });
    eq(await c.page.inputValue("#state"), "", "Invalid state code is ignored");
    eq(await c.page.inputValue("#btype"), "services", "Invalid type falls back to default");
    await go(c.page, "/selling/");
    eq(await c.page.$$eval("#pickGrid input:checked", i => i.map(x => x.value).join(",")), "Texas", "Invalid pick codes are dropped");
    await c.ctx.close();
  }

  /* 10. Language toggle across pages */
  {
    const { ctx, page } = await open(browser, { url: "/checklist/?zip=75201&city=Dallas&type=food&hire=1&reach=some&picks=OK,CA" });
    const enIds = await ids(page);
    const enLabels = await page.$$eval(".item label", l => l.map(x => x.textContent));
    await page.click('[data-lang-set="es"]');
    eq(await page.getAttribute("html", "lang"), "es", "html lang is es");
    eq(await page.title(), "Lista para empezar · Strike Right", "Page title is Spanish");
    eq(JSON.stringify(await ids(page)), JSON.stringify(enIds), "Same checklist items in Spanish");
    const esLabels = await page.$$eval(".item label", l => l.map(x => x.textContent));
    const same = esLabels.filter((l, i) => l === enLabels[i]);
    eq(same.length, 0, `Every checklist item is translated${same.length ? " — " + same.join(" | ") : ""}`);
    out(page.url().includes("lang=es"), "URL carries lang=es");
    out((await page.getAttribute('link[rel="canonical"]', "href")) === "https://strikeright.app/checklist/?lang=es", "Canonical points to this page's Spanish URL");
    await go(page, "/");
    eq(await txt(page, "h1"), "Empiece su negocio de la manera correcta", "Spanish persists to the next page (Home)");
    eq(await page.$eval("#btype option[value=food]", o => o.textContent), "Alimentos o bebidas", "Business types are Spanish");
    eq(await page.getAttribute("#zip", "placeholder"), "p. ej., 75201", "Placeholders are Spanish");
    await go(page, "/help/");
    out((await txt(page, "#helpGroups")).includes("Área de Dallas") && (await txt(page, "#helpGroups")).includes("Más adecuado"), "Resource groups are Spanish");
    out((await txt(page, "#helpGroups")).includes("Última verificación: octubre de 2026"), "Last verified is Spanish");
    await go(page, "/llc/");
    out((await txt(page, "#llcCard")).includes("Certificate of Formation (certificado de formación)"), "Legal term kept with Spanish in parentheses");
    await go(page, "/selling/");
    out((await txt(page, "#reachOut")).includes("Impuesto sobre ventas"), "Selling across states is Spanish");
    await go(page, "/guides/");
    out((await txt(page, "#faq")).includes("¿Necesito una LLC para empezar?"), "FAQ is Spanish");
    await go(page, "/about/");
    out((await txt(page, "#about")).includes("Privacidad") && (await txt(page, "#about")).includes("Frandy Slueue"), "About is Spanish and keeps credits");
    await go(page, "/grow/");
    for (const tab of ["pilot", "trial", "promo", "chan", "rules"]) { await page.click(`#tab-${tab}`); out(/[áéíóúñ¿]/.test(await txt(page, `#panel-${tab}`)), `Get known tab ${tab} is Spanish`); }
    for (const p of PAGES) {
      await go(page, p);
      const leftovers = await page.evaluate(() => [...document.querySelectorAll("main, header, nav, footer")].map(e => e.innerText).join(" ").match(/\b(Choose a state|Copy checklist|Last verified|Best fit|Report outdated|Expand all|Free help|Previous|Next|Your business|Checklist|Letters|Guides)\b/g));
      eq(leftovers, null, `No common English UI strings left in Spanish on ${p}`);
    }
    await page.reload({ waitUntil: "networkidle" });
    eq(await page.getAttribute("html", "lang"), "es", "Spanish persists after reload");
    await page.click('[data-lang-set="en"]');
    eq(await txt(page, "h1"), "About Strike Right", "Back to English");
    out(!page.url().includes("lang="), "lang removed from URL in English");
    await clean(page, "Language"); await ctx.close();
    const fresh = await open(browser, { url: "/guides/?lang=es" });
    eq(await fresh.page.getAttribute("html", "lang"), "es", "?lang=es works in a fresh browser");
    await fresh.ctx.close();
  }

  /* 11. Print emulation on Checklist, LLC and Letters */
  {
    const { ctx, page } = await open(browser, { scheme: "dark", url: "/checklist/?zip=75201&city=Dallas&type=food" });
    await page.click('[data-theme-set="dark"]');
    await page.check("#c-help-sbdc");
    await page.click('#checklist [data-print-target="checklist"]');
    eq(await page.evaluate(() => window.__printed), 1, "Checklist print button calls print");
    await page.emulateMedia({ media: "print" });
    const vis = q => page.evaluate(q => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none" && e.getClientRects().length > 0; }, q);
    const s = await page.evaluate(() => {
      const cb = document.querySelector("#c-help-sbdc");
      return { open: [...document.querySelectorAll(".phase")].every(d => d.open), cb: getComputedStyle(cb).display !== "none" && getComputedStyle(cb).backgroundColor,
        bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.body).color,
        url: getComputedStyle(document.querySelector("#phases .why a"), "::after").content };
    });
    const hidden = []; for (const q of [".nav", ".top-tools", "#toTop", "#copyPlan", ".pager", ".crumbs", "footer .fgrid", "#profileBtn"]) if (await vis(q)) hidden.push(q);
    eq(hidden.join(","), "", "Print hides nav, header tools, back-to-top, buttons, pager and footer links");
    out(await vis("#checklist") && await vis("#planTitle"), "Checklist print shows the checklist and its title");
    out(s.open, "Checklist prints with all steps expanded");
    eq(s.cb, "rgb(28, 107, 74)", "Checked boxes keep their checkmark color in print");
    eq(s.bg, "rgb(255, 255, 255)", "Print forces a light background even in dark theme");
    eq(s.ink, "rgb(17, 17, 17)", "Print forces dark text");
    out(/https:\/\//.test(s.url) || s.url.includes("attr(href)"), `Link URLs print after link text (${s.url.slice(0, 60)})`);
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.emulateMedia({ media: "screen" });
    eq(await page.evaluate(() => document.body.dataset.print || ""), "", "afterprint clears the print target");
    out((await page.$$eval(".phase", d => d.filter(x => x.open).length)) < 6, "afterprint restores collapsed steps");
    await go(page, "/letters/");
    await page.click('[data-print-target="letters"]');
    await page.emulateMedia({ media: "print" });
    const L = await page.evaluate(() => { const v = q => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none" && e.getClientRects().length > 0; };
      const paper = getComputedStyle(document.querySelector("#letterOut")); return { out: v("#letterOut"), form: v("#letterForm"), head: v(".page-head"), font: paper.fontFamily, border: paper.borderTopWidth }; });
    out(L.out && !L.form && !L.head, "Letter print shows only the letter");
    out(/Georgia|Times/.test(L.font) && L.border === "0px", "Letter prints in a clean letter style");
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.emulateMedia({ media: "screen" });
    await go(page, "/llc/");
    await page.click('#llc [data-print-target="llc"]');
    await page.emulateMedia({ media: "print" });
    out(await vis("#llcCard") && !(await vis("#llc details")) && !(await vis("#llcState")), "LLC print shows the LLC card without the picker or table");
    const pdf = await page.pdf({ format: "Letter" });
    out(pdf.length > 10000, `LLC page renders to PDF (${pdf.length} bytes)`);
    await clean(page, "Print"); await ctx.close();
  }

  /* 12. Keyboard, focus, ARIA and reduced motion */
  {
    const { ctx, page } = await open(browser, { reduced: "reduce", url: "/grow/" });
    eq(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto", "Reduced motion turns off smooth scrolling");
    await page.focus("#tab-pilot"); await page.keyboard.press("ArrowRight");
    eq(await page.evaluate(() => document.activeElement.id), "tab-trial", "ArrowRight moves to next tab");
    eq(await page.getAttribute("#tab-trial", "aria-selected"), "true", "Focused tab is selected");
    out(await page.isHidden("#panel-pilot") && await page.isVisible("#panel-trial"), "Tab panels switch");
    await page.keyboard.press("End"); eq(await page.evaluate(() => document.activeElement.id), "tab-rules", "End goes to last tab");
    await page.keyboard.press("Home"); eq(await page.evaluate(() => document.activeElement.id), "tab-pilot", "Home goes to first tab");
    eq(await page.$$eval('#growTabs [role="tab"]', t => t.map(x => x.tabIndex).join(",")), "0,-1,-1,-1,-1", "Roving tabindex on tabs");
    await go(page, "/");
    await page.focus("#zip"); await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + " " + s.outlineWidth; });
    out(/solid 2px/.test(ring), `Keyboard focus is visible (${ring})`);
    await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Shift+Tab");
    await go(page, "/checklist/");
    const phase = page.locator(".phase summary").nth(1);
    await phase.focus(); const before = await page.$eval(".phase:nth-child(2)", d => d.open);
    await page.keyboard.press("Enter"); await page.waitForTimeout(50);
    out(await page.$eval(".phase:nth-child(2)", d => d.open) !== before, "Accordion steps toggle with Enter");
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100);
    out(await page.$eval("#toTop", e => getComputedStyle(e).visibility) === "hidden", "Hidden back-to-top button is out of the tab order");
    await page.evaluate(() => window.scrollTo(0, 3000)); await page.waitForTimeout(150);
    out(await page.$eval("#toTop", e => getComputedStyle(e).visibility) === "visible", "Back-to-top appears after scrolling");
    out(await page.$$eval("[data-lang-set],[data-theme-set]", b => b.every(x => x.hasAttribute("aria-pressed"))), "Language and theme toggles expose aria-pressed");
    await go(page, "/checklist/");
    await page.keyboard.press("Tab");
    eq(await page.evaluate(() => document.activeElement.className), "skip-link", "First Tab reaches the skip link");
    await page.keyboard.press("Enter");
    eq(await page.evaluate(() => document.activeElement.id), "main", "Skip link moves focus to main content");
    await clean(page, "Keyboard"); await ctx.close();
  }

  /* 13. Head tags per page, assets and served headers */
  {
    const { ctx, page } = await open(browser);
    const titles = new Set();
    const want = { "/": "Strike Right · Start your business the right way", "/checklist/": "Starting checklist · Strike Right", "/help/": "Free help · Strike Right", "/llc/": "LLC by state · Strike Right", "/selling/": "Selling across states · Strike Right", "/grow/": "Get known · Strike Right", "/letters/": "Letters · Strike Right", "/guides/": "Guides · Strike Right", "/about/": "About · Strike Right" };
    for (const p of PAGES) {
      await go(page, p);
      const h = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]').content, canon: document.querySelector('link[rel=canonical]').href,
        hl: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + "=" + l.href).join(" "), ogu: document.querySelector('meta[property="og:url"]').content, ogt: document.querySelector('meta[property="og:title"]').content,
        og: document.querySelector('meta[property="og:image"]').content, tw: document.querySelector('meta[name="twitter:card"]').content, twt: document.querySelector('meta[name="twitter:title"]').content,
        icon: document.querySelector('link[rel=icon]').getAttribute("href"), inline: [...document.scripts].filter(s => !s.src).length, beacon: !!document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]') }));
      const url = "https://strikeright.app" + p;
      eq(h.title, want[p], `${p}: own <title>`); titles.add(h.title);
      out(h.desc.length > 60 && h.canon === url && h.ogu === url && h.ogt === h.title && h.twt === h.title, `${p}: description, canonical, og:url and titles`);
      eq(h.hl, `en=${url} es=${url}?lang=es x-default=${url}`, `${p}: hreflang`);
      out(h.og === "https://strikeright.app/og-image.png" && h.tw === "summary_large_image" && h.icon === "/favicon.svg" && h.inline === 0 && h.beacon, `${p}: OG image, Twitter card, favicon file, no inline scripts, analytics beacon`);
    }
    eq(titles.size, PAGES.length, "Every page has a unique title");
    const js = fs.readdirSync(path.join(PUBLIC, "js")).filter(f => f.endsWith(".js")).map(f => "/js/" + f).concat(fs.readdirSync(path.join(PUBLIC, "js", "es")).map(f => "/js/es/" + f));
    for (const [p, type] of [["/favicon.svg", "image/svg+xml"], ["/og-image.png", "image/png"], ["/robots.txt", "text/plain"], ["/sitemap.xml", "xml"], ["/styles.css", "text/css"], ["/boot.js", "javascript"], ...js.map(j => [j, "javascript"])]) {
      const r = await page.request.get(BASE + p); out(r.ok() && (r.headers()["content-type"] || "").includes(type), `${p} served as ${type}`);
    }
    const sm = await (await page.request.get(BASE + "/sitemap.xml")).text();
    out(PAGES.every(p => sm.includes(`<loc>https://strikeright.app${p}</loc>`) && sm.includes(`<loc>https://strikeright.app${p}?lang=es</loc>`)), "Sitemap lists every page in both languages");
    out((await (await page.request.get(BASE + "/robots.txt")).text()).includes("Sitemap: https://strikeright.app/sitemap.xml"), "robots.txt points to the sitemap");
    for (const p of PAGES) {
      const h = (await page.request.get(BASE + p)).headers();
      out(h["strict-transport-security"] === "max-age=31536000; includeSubDomains" && h["x-content-type-options"] === "nosniff" && h["x-frame-options"] === "DENY" && h["referrer-policy"] === "strict-origin-when-cross-origin" && h["permissions-policy"] === "camera=(), microphone=(), geolocation=(), payment=()" && /default-src 'self'/.test(h["content-security-policy"]) && /frame-ancestors 'none'/.test(h["content-security-policy"]), `${p}: security headers`);
    }
    eq((await page.request.get(BASE + "/_headers")).status(), 404, "_headers file itself is not served");
    out(await page.evaluate(() => document.documentElement.classList.contains("ready") && getComputedStyle(document.body).visibility === "visible"), "Page is revealed once scripts have rendered");
    await ctx.close();
  }

  /* 14. User text never becomes markup (city from the form, the URL and storage; both languages) */
  {
    const evil = ['<a href="https://example.com">Help</a>', "<img src=x onerror=alert(1)>"];
    for (const city of evil) for (const lang of ["en", "es"]) {
      const tag = `City ${JSON.stringify(city)} (${lang})`;
      const { ctx, page } = await open(browser, { url: `/checklist/?state=TX&type=food&hire=1&lang=${lang}` });
      await setPicker(page, { city });
      await page.$$eval(".phase", ds => ds.forEach(d => d.open = true));
      const dom = await page.evaluate(() => ({
        a: document.querySelectorAll('a[href="https://example.com"]').length, img: document.querySelectorAll("img").length,
        labels: [...document.querySelectorAll(".item label")].map(l => l.textContent).join("\n"), title: document.querySelector("#planTitle").textContent, chip: document.querySelector("#chipText").textContent }));
      eq(dom.a + dom.img, 0, `${tag}: no injected elements`);
      out(dom.labels.includes(city) && dom.title.includes(city) && dom.chip.includes(city), `${tag}: plain text in checklist, title and profile chip`);
      await page.click("#copyPlan");
      await go(page, "/");
      out((await page.textContent("#startTitle")).includes(city) && (await page.evaluate(() => document.querySelectorAll("img").length)) === 0, `${tag}: plain text on Home`);
      await go(page, "/letters/");
      await page.selectOption("#lType", "advice");
      out((await page.textContent("#letterOut")).includes(city), `${tag}: letter shows it as text`);
      eq(await page.evaluate(() => window.__alerts), 0, `${tag}: no script ran`);
      await clean(page, tag); await ctx.close();
    }
    const viaUrl = await open(browser, { url: "/checklist/?state=TX&city=" + encodeURIComponent(evil[1]) });
    eq(await viaUrl.page.evaluate(() => document.querySelectorAll("img").length), 0, "City from a share link is escaped");
    await viaUrl.ctx.close();
    const viaStore = await open(browser, { url: "/help/", storage: { "biz-starter-guide-v2": JSON.stringify({ state: "Texas", city: evil[0], type: "food" }) } });
    eq(await viaStore.page.evaluate(() => document.querySelectorAll('a[href="https://example.com"]').length), 0, "City from saved storage is escaped");
    await viaStore.ctx.close();
  }

  /* 15. Prototype keys fall back to defaults */
  for (const bad of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
    const { ctx, page } = await open(browser, { url: `/checklist/?type=${bad}&where=${bad}&reach=${bad}&state=${bad}&picks=${bad},TX&lang=${bad}` });
    await page.click("#profileBtn");
    const st = await page.evaluate(() => ({ type: document.getElementById("p-btype").value, where: document.getElementById("p-where").value, state: document.getElementById("p-state").value, lang: document.documentElement.lang, items: document.querySelectorAll(".item").length }));
    await page.keyboard.press("Escape");
    eq(JSON.stringify(st), JSON.stringify({ type: "services", where: "home", state: "", lang: "en", items: st.items }), `?…=${bad} falls back to defaults`);
    out(st.items > 20, `?…=${bad}: checklist still renders (${st.items} items)`);
    await go(page, "/selling/");
    eq(await page.$eval('#reach [aria-pressed="true"]', b => b.dataset.reach), "home", `?…=${bad}: reach falls back to home`);
    await clean(page, `Prototype key ${bad}`); await ctx.close();
  }

  /* 16. Bad saved state is normalized */
  {
    const cases = {
      "pick:null, done:null, letter:\"x\"": { pick: null, done: null, letter: "x", open: null, type: "food", state: "Texas" },
      "invalid letter type": { letter: { type: "constructor", lName: "Ana", evil: "<b>x</b>", lBiz: 42 }, state: "Texas" },
      "wrong types everywhere": { zip: 75201, state: "Atlantis", city: { a: 1 }, type: "__proto__", where: "moon", hire: "yes", reach: ["all"], pick: ["Texas", "Texas", "Nowhere", 5], done: { "help-sbdc": "true", "reg-ein": true }, open: [1], llcState: "toString" },
      "not an object": [1, 2, 3]
    };
    for (const [name, data] of Object.entries(cases)) {
      const { ctx, page } = await open(browser, { url: "/checklist/", storage: { "biz-starter-guide-v2": JSON.stringify(data) } });
      await page.click("#profileBtn");
      const st = await page.evaluate(() => ({ type: document.getElementById("p-btype").value, where: document.getElementById("p-where").value, state: document.getElementById("p-state").value, items: document.querySelectorAll(".item").length }));
      await page.keyboard.press("Escape");
      if (name === "wrong types everywhere") {
        out(await page.isChecked("#c-reg-ein") && !(await page.isChecked("#c-help-sbdc")), "Only boolean checkmarks survive");
      }
      await page.$eval("#c-idea-desc", e => e.click());
      await go(page, "/letters/");
      const lt = await page.inputValue("#lType");
      out(st.items > 20 && ["advice", "pilot", "intro", "partner", "loi", "program", "followup"].includes(lt), `Saved state "${name}": pages render, letter type valid (${lt})`);
      if (name === "invalid letter type") { eq(lt, "advice", "Invalid saved letter type falls back to advice"); eq(await page.inputValue("#lName"), "Ana", "Valid saved letter fields are kept"); eq(await page.inputValue("#lBiz"), "", "Non-string letter fields are dropped"); }
      await go(page, "/llc/");
      if (name === "wrong types everywhere") eq(JSON.stringify([st.type, st.where, st.state, await page.inputValue("#llcState")]), JSON.stringify(["services", "home", "", "Alabama"]), "Invalid saved choices fall back to defaults");
      const after = await page.evaluate(() => JSON.parse(localStorage.getItem("biz-starter-guide-v2")));
      out(Array.isArray(after.pick) && typeof after.done === "object" && typeof after.letter === "object" && !Array.isArray(after.open), `Saved state "${name}": stored back in clean shape`);
      await clean(page, `Saved state ${name}`); await ctx.close();
    }
    const broken = await open(browser, { storage: { "biz-starter-guide-v2": "{not json" } });
    eq(await broken.page.inputValue("#btype"), "services", "Corrupt JSON in storage recovers silently");
    await clean(broken.page, "Corrupt JSON"); await broken.ctx.close();
  }

  /* 17. ZIP exceptions win over three-digit ranges */
  {
    const { ctx, page } = await open(browser);
    for (const [zip, st] of [["06390", "New York"], ["06391", "Connecticut"], ["73960", "Texas"], ["73949", "Oklahoma"], ["83414", "Wyoming"], ["83402", "Idaho"]]) {
      await page.fill("#zip", zip);
      eq(await page.inputValue("#state"), st, `ZIP ${zip} detects ${st}`);
    }
    await page.fill("#zip", "06390");
    eq(await page.textContent("#zipHint"), "✓ New York (change below if wrong)", "06390 hint keeps 'change below if wrong'");
    await page.fill("#zip", "96799");
    eq(await page.textContent("#zipHint"), "Not a U.S. state ZIP. Pick your state instead.", "96799 (American Samoa) is not a state");
    await clean(page, "ZIP exceptions"); await ctx.close();
  }

  /* 18. Texas franchise tax wording (English and Spanish) */
  {
    const { ctx, page } = await open(browser, { url: "/llc/?state=TX&city=Dallas" });
    await page.selectOption("#llcState", "Texas");
    const card = await page.textContent("#llcCard");
    out(card.includes("Every Texas LLC files every year by May 15") && card.includes("No Tax Due Report is no longer filed") && card.includes("Above the threshold, file the franchise tax report"), "LLC card: Texas wording");
    await page.click("#llc summary"); await page.fill("#llcFilter", "texas");
    out((await page.textContent("#llcTable tbody")).includes("No Tax Due Report is no longer filed"), "LLC table Texas row wording");
    await page.click('[data-lang-set="es"]');
    out((await page.textContent("#llcCard")).includes("Toda LLC de Texas presenta cada año") && (await page.textContent("#llcCard")).includes("ya no se presenta"), "Spanish LLC card: Texas wording");
    await page.click('[data-lang-set="en"]');
    await go(page, "/checklist/");
    const item = await page.textContent("#c-tx-franchise + div");
    out(item.includes("Every LLC") && item.includes("Public Information Report or Ownership Information Report") && item.includes("No Tax Due Report is no longer filed"), "Checklist: Texas franchise item wording");
    await go(page, "/help/");
    out((await page.textContent(".card:has(h3:text-is('Texas Comptroller of Public Accounts'))")).includes("No Tax Due Report is no longer filed"), "Comptroller card wording");
    await go(page, "/checklist/?lang=es&state=TX&city=Dallas");
    out((await page.textContent("#c-tx-franchise + div")).includes("No Tax Due Report ya no se presenta"), "Spanish checklist: Texas franchise wording");
    await clean(page, "Texas wording"); await ctx.close();
  }

  /* 19. Greenwood Women's Business Center */
  {
    const { ctx, page } = await open(browser, { url: "/help/?state=OK&city=Tulsa" });
    const card = page.locator(".card:has(h3:text-is(\"Greenwood Women's Business Center\"))");
    eq(await card.count(), 1, "Greenwood card present");
    const html = await card.innerHTML();
    out(!/google\.com/.test(html) && !/539-867-4127/.test(html) && !/Greenwood Ave/.test(html), "Greenwood card has no Google link, phone or address");
    eq(await card.locator("a").getAttribute("href"), "https://www.sba.gov/local-assistance/find", "Greenwood links to the SBA locator");
    await ctx.close();
  }

  /* 20. Without JavaScript: every page shows its static content and the message */
  {
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 900 } });
    const np = await nojs.newPage();
    const MSG = "Turn on JavaScript to tailor this guide to your state and business type.";
    for (const p of [...PAGES, "/does-not-exist"]) {
      await np.goto(BASE + p, { waitUntil: "load" });
      const r = await np.evaluate(() => ({ msg: (document.querySelector(".noscript-msg") || {}).textContent || "", msgVis: !!document.querySelector(".noscript-msg") && document.querySelector(".noscript-msg").offsetParent !== null,
        main: document.querySelector("main").innerText.trim().length, nav: getComputedStyle(document.querySelector(".nav")).display, body: getComputedStyle(document.body).visibility, over: document.documentElement.scrollWidth - innerWidth }));
      out(r.msg === MSG && r.msgVis && r.main > 80 && r.nav !== "none" && r.body === "visible" && r.over <= 0, `No-JS ${p}: message, static content (${r.main} chars), visible nav, no horizontal scroll`);
    }
    await np.goto(BASE + "/checklist/", { waitUntil: "load" });
    eq(await np.$$eval("#phases .fallback h2", h => h.length), 6, "No-JS checklist lists the six steps");
    await np.goto(BASE + "/help/", { waitUntil: "load" });
    const links = await np.$$eval("#helpGroups .fallback a", a => a.map(x => x.href));
    out(links.includes("https://americassbdc.org/") && links.some(l => l.includes("score.org")) && links.some(l => l.includes("irs.gov")), "No-JS help links the main national resources");
    await np.goto(BASE + "/", { waitUntil: "load" });
    eq(await np.$eval(".picker", e => getComputedStyle(e).display), "none", "No-JS hides controls that need JavaScript");
    eq(await np.$$eval(".start-grid a", a => a.length), 8, "No-JS Home still links to every page");
    await nojs.close();
    const { ctx, page } = await open(browser, { url: "/checklist/" });
    out(await page.locator("#phases .fallback").count() === 0, "With JavaScript the checklist fallback is replaced");
    eq(await page.evaluate(() => document.querySelector(".noscript-msg")), null, "With JavaScript the no-JS message is not shown");
    await ctx.close();
  }

  /* 21. Strict CSP, HSTS, no inline styles in any served file */
  {
    const { ctx, page } = await open(browser);
    const h = (await page.request.get(BASE + "/")).headers();
    eq(h["strict-transport-security"], "max-age=31536000; includeSubDomains", "HSTS with includeSubDomains");
    const csp = h["content-security-policy"];
    out(!/unsafe-inline/.test(csp) && /style-src 'self' https:\/\/fonts\.googleapis\.com;/.test(csp), "CSP style-src has no 'unsafe-inline'");
    const js = fs.readdirSync(path.join(PUBLIC, "js")).filter(f => f.endsWith(".js")).map(f => "/js/" + f).concat(fs.readdirSync(path.join(PUBLIC, "js", "es")).map(f => "/js/es/" + f));
    for (const f of [...PAGES, "/404.html", "/boot.js", "/favicon.svg", ...js]) {
      const body = await (await page.request.get(BASE + f)).text();
      out(!/\sstyle="/.test(body) && !/<style[\s>]/.test(body), `${f}: no inline style attributes or <style> blocks`);
    }
    await ctx.close();
  }

  /* 22. The axe filter only hides the audit's own font request */
  {
    const { ctx, page } = await open(browser);
    await axeCheck(page, "Filter self-test page", () => {
      const sc = document.createElement("script"); sc.src = "https://unrelated.example/blocked.js"; document.head.appendChild(sc);
      fetch("https://unrelated.example/data.json").catch(() => {});
    });
    await page.waitForTimeout(500);
    const csp = await page.evaluate(() => window.__csp);
    out(csp.some(v => v.startsWith("script-src-elem https://unrelated.example/blocked.js")), "A blocked script during an axe run IS reported as a CSP violation");
    out(csp.some(v => v.startsWith("connect-src https://unrelated.example/data.json")), "A blocked connect to another URL during an axe run IS reported");
    out(page.__errors.some(e => e.includes("unrelated.example/blocked.js")), "The blocked script's console error IS reported");
    out(page.__errors.some(e => e.includes("unrelated.example/data.json")), "The blocked connect's console error IS reported");
    out(!csp.some(v => v.includes("fonts.googleapis.com")) && !page.__errors.some(e => e.includes("fonts.googleapis.com")), "Only the audit's own font stylesheet request is ignored");
    out(auditNoise({ __axe: true }, AXE_FONT_CONSOLE) && !auditNoise({ __axe: false }, AXE_FONT_CONSOLE) && !auditNoise({ __axe: true }, AXE_FONT_CONSOLE.replace("css2", "css3")), "Console filter matches only the exact message, only during axe");
    await ctx.close();
  }

  /* 23. Dallas Small Business Assistance Program minimums */
  {
    const { ctx, page } = await open(browser, { url: "/help/?state=TX&city=Dallas" });
    const card = () => page.textContent(".card:has(h3:text-is('City of Dallas Office of Economic Development'))");
    let t = await card();
    out(t.includes("$150,000 in Target Areas or $250,000 outside them") && t.includes("75% of project costs committed from non-City sources"), "English: $150,000 in Target Areas, $250,000 outside, 75% from non-City sources");
    out(!t.includes("$250,000 in Target Areas"), "English: old reversed wording is gone");
    await page.click('[data-lang-set="es"]'); t = await card();
    out(t.includes("$150,000 en Target Areas o de $250,000 fuera de ellas") && t.includes("75% del costo del proyecto comprometido de fuentes que no sean la Ciudad"), "Spanish: $150,000 en Target Areas, $250,000 fuera, 75% de fuentes que no sean la Ciudad");
    out(!t.includes("$250,000 en Target Areas"), "Spanish: old reversed wording is gone");
    await ctx.close();
  }

  /* 24. No deploy placeholders left anywhere under public/ */
  {
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    for (const ph of ["YOUR-DOMAIN", "YOUR_BEACON_TOKEN"]) {
      const hits = walk(PUBLIC).filter(f => fs.readFileSync(f).includes(ph)).map(f => path.relative(PUBLIC, f));
      eq(hits.join(", "), "", `No "${ph}" in public/`);
    }
  }

  /* 25. Shared header, nav, footer and previous/next links */
  {
    const { ctx, page } = await open(browser);
    const order = ["/", "/checklist/", "/help/", "/llc/", "/selling/", "/grow/", "/letters/", "/guides/"];
    for (const p of PAGES) {
      await go(page, p);
      const r = await page.evaluate(() => ({ cur: [...document.querySelectorAll('#navlinks a[aria-current="page"]')].map(a => a.getAttribute("href")), nav: [...document.querySelectorAll("#navlinks a")].map(a => a.textContent).join("|"),
        home: document.querySelector(".top-band .brand").getAttribute("href"), foot: [...document.querySelectorAll("footer .fcol:first-of-type a")].map(a => a.getAttribute("href")).join(","),
        prev: (document.querySelector(".pager .prev") || {}).getAttribute?.("href") || null, next: (document.querySelector(".pager .next") || {}).getAttribute?.("href") || null,
        credits: document.querySelector("footer .credits").textContent.trim() }));
      eq(r.nav, "Home|Checklist|Free help|LLC by state|Selling|Get known|Letters|Guides", `${p}: primary nav`);
      const skips = await page.evaluate(() => { const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(h => h.getClientRects().length); const bad = []; let prev = 0;
        hs.forEach(h => { const l = +h.tagName[1]; if (prev && l > prev + 1) bad.push(`${h.tagName} "${h.textContent.trim().slice(0, 30)}"`); prev = l; }); return { first: hs[0] && hs[0].tagName, h1: hs.filter(h => h.tagName === "H1").length, bad }; });
      out(skips.first === "H1" && skips.h1 === 1 && !skips.bad.length, `${p}: one h1, headings never skip a level${skips.bad.length ? " — " + skips.bad.join(", ") : ""}`);
      eq(r.cur.join(","), p === "/about/" ? "" : p, `${p}: aria-current on the active page`);
      eq(r.home, "/", `${p}: logo links home`);
      eq(r.foot, "/checklist/,/help/,/llc/,/selling/,/grow/,/letters/,/guides/,/about/", `${p}: footer links to all pages and About`);
      eq(r.credits, "© 2026 CodeBreeder LLC. All Rights Reserved.", `${p}: footer credits unchanged`);
      const i = order.indexOf(p);
      const wantPrev = p === "/about/" ? "/guides/" : i > 0 ? order[i - 1] : null, wantNext = p === "/about/" ? null : order[i + 1] || null;
      eq(JSON.stringify([r.prev, r.next]), JSON.stringify([wantPrev, wantNext]), `${p}: previous/next links`);
    }
    await ctx.close();
  }

  /* 26. Mobile menu: keyboard, focus trap, Escape, focus return */
  {
    const { ctx, page } = await open(browser, { width: 360, url: "/llc/" });
    out(await page.isVisible("#menuBtn") && !(await page.isVisible("#navlinks")), "At 360px the nav collapses into the menu button");
    eq(await page.getAttribute("#menuBtn", "aria-expanded"), "false", "Menu starts closed");
    await page.focus("#menuBtn"); await page.keyboard.press("Enter");
    eq(await page.getAttribute("#menuBtn", "aria-expanded"), "true", "Enter opens the menu; aria-expanded is true");
    out(await page.isVisible("#menuPanel") && await page.evaluate(() => document.getElementById("menuPanel").contains(document.activeElement)), "Focus moves into the menu");
    const r = await page.evaluate(() => ({ role: menuPanel.getAttribute("role"), modal: menuPanel.getAttribute("aria-modal"), links: [...menuPanel.querySelectorAll("nav a")].map(a => a.getAttribute("href")).join(","), cur: menuPanel.querySelector('a[aria-current="page"]').getAttribute("href") }));
    eq(r.links, "/,/checklist/,/help/,/llc/,/selling/,/grow/,/letters/,/guides/,/about/", "Menu lists every page plus About");
    out(r.role === "dialog" && r.modal === "true" && r.cur === "/llc/", "Menu is a modal dialog with aria-current on this page");
    let inside = true;
    for (let k = 0; k < 25; k++) { await page.keyboard.press("Tab"); inside = inside && await page.evaluate(() => menuPanel.contains(document.activeElement)); }
    out(inside, "Tab stays inside the open menu (focus trap)");
    for (let k = 0; k < 25; k++) { await page.keyboard.press("Shift+Tab"); inside = inside && await page.evaluate(() => menuPanel.contains(document.activeElement)); }
    out(inside, "Shift+Tab stays inside the open menu");
    await page.click('#menuPanel [data-theme-set="dark"]');
    eq(await page.getAttribute("html", "data-theme"), "dark", "Theme toggle works from the menu");
    await page.keyboard.press("Escape");
    out(!(await page.isVisible("#menuPanel")) && await page.evaluate(() => document.activeElement.id) === "menuBtn" && await page.getAttribute("#menuBtn", "aria-expanded") === "false", "Escape closes the menu and returns focus to the button");
    await page.click("#menuBtn"); await page.click('#menuPanel [data-close-dialog]');
    out(!(await page.isVisible("#menuPanel")) && await page.evaluate(() => document.activeElement.id) === "menuBtn", "Close button closes the menu and returns focus");
    await page.click("#menuBtn"); await page.click('#menuPanel a[href="/checklist/"]'); await page.waitForURL(/\/checklist\//);
    eq(new URL(page.url()).pathname, "/checklist/", "Menu links navigate");
    await page.setViewportSize({ width: 1280, height: 900 });
    out(!(await page.isVisible("#menuBtn")) && await page.isVisible("#navlinks"), "At 1280px the full nav shows and the menu button hides");
    await clean(page, "Mobile menu"); await ctx.close();
  }

  /* 27. Profile chip and panel: edit from any page, applied immediately, accessible */
  {
    const { ctx, page } = await open(browser, { url: "/llc/?zip=74103&city=Tulsa&type=software" });
    eq(await page.textContent("#chipText"), "Tulsa, OK · Software", "Chip summarizes the current choices");
    out((await page.getAttribute("#profileBtn", "aria-label")).startsWith("Your business: Tulsa, OK · Software"), "Chip has an accessible name");
    await page.focus("#profileBtn"); await page.keyboard.press("Enter");
    out(await page.isVisible("#profilePanel") && await page.evaluate(() => document.activeElement.id) === "p-zip", "Enter opens the panel and focuses the ZIP field");
    out(await page.evaluate(() => profilePanel.getAttribute("role") === "dialog" && profilePanel.getAttribute("aria-modal") === "true" && !!document.getElementById(profilePanel.getAttribute("aria-labelledby"))), "Panel is a labelled modal dialog");
    await page.fill("#p-zip", "75201");
    out((await txt(page, "#llcCard")).includes("$300") && (await page.textContent("#chipText")) === "Tulsa, TX · Software", "Changes apply immediately on the page behind the panel");
    let inside = true;
    for (let k = 0; k < 20; k++) { await page.keyboard.press("Tab"); inside = inside && await page.evaluate(() => profilePanel.contains(document.activeElement)); }
    out(inside, "Tab stays inside the open panel (focus trap)");
    await page.keyboard.press("Escape");
    out(!(await page.isVisible("#profilePanel")) && await page.evaluate(() => document.activeElement.id) === "profileBtn", "Escape closes the panel and returns focus to the chip");
    await page.click("#profileBtn"); await page.click('#profilePanel .btn.primary[data-close-dialog]');
    out(!(await page.isVisible("#profilePanel")) && await page.evaluate(() => document.activeElement.id) === "profileBtn", "Done closes the panel and returns focus");
    for (const p of PAGES) {
      await go(page, p);
      await setPicker(page, { city: "Plano" });
      out((await page.textContent("#chipText")).startsWith("Plano, TX"), `Profile edits work from ${p}`);
      await setPicker(page, { city: "Tulsa" });
    }
    await page.setViewportSize({ width: 360, height: 760 });
    await go(page, "/letters/");
    await page.click("#profileBtn");
    const box = await page.$eval("#profilePanel", e => { const r = e.getBoundingClientRect(); return [r.top, r.left, r.width, r.height]; });
    eq(JSON.stringify(box), JSON.stringify([0, 0, 360, 760]), "On phones the panel is a full-height sheet");
    const close = await page.$eval("#profilePanel .pp-close", e => { const r = e.getBoundingClientRect(); return [e.getAttribute("aria-label"), r.width >= 40 && r.height >= 40, r.top >= 0 && r.right <= innerWidth]; });
    eq(JSON.stringify(close), JSON.stringify(["Close", true, true]), "Sheet has a clear, visible close button");
    await page.click("#profilePanel .pp-close");
    out(await page.evaluate(() => document.activeElement.id) === "profileBtn", "Closing the sheet returns focus to the chip");
    await clean(page, "Profile panel"); await ctx.close();
  }

  /* 28. Choices and progress persist across pages; Home shows live status */
  {
    const { ctx, page } = await open(browser);
    await setPicker(page, { zip: "75201", city: "Dallas", type: "food" });
    await go(page, "/selling/"); await page.click('[data-reach="all"]');
    await go(page, "/checklist/");
    const total = (await ids(page)).length;
    out((await ids(page)).includes("lic-multi"), "Reach chosen on Selling adds the multi-state item to the checklist");
    await page.check("#c-help-sbdc");
    await go(page, "/help/");
    out((await groups(page)).includes("Dallas area"), "Choices made on Home apply on Free help");
    await go(page, "/llc/");
    eq(await page.inputValue("#llcState"), "Texas", "LLC page opens on the chosen state");
    await go(page, "/letters/"); await page.selectOption("#lType", "pilot"); await page.fill("#lName", "Ana");
    await go(page, "/");
    const st = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-status]")].map(e => [e.dataset.status, e.textContent])));
    eq(st.checklist, `1 of ${total} done`, "Home: checklist status counts checks made on another page");
    eq(await page.textContent("#homeDone"), `1 of ${total} checklist items done`, "Home: overall progress");
    eq(st.llc, "Texas: $300 filing fee", "Home: LLC status");
    eq(st.selling, "All states", "Home: selling status");
    eq(st.letters, "Draft: pilot proposal", "Home: letters status");
    out(/^\d+ resources · \d+ best fits?$/.test(st.help), `Home: help status (${st.help})`);
    eq(await page.textContent("#startTitle"), "Everything for food and beverage in Dallas, Texas", "Home: Start here title");
    eq(await page.$$eval(".start-grid a", a => a.map(x => x.getAttribute("href")).join(",")), "/checklist/,/help/,/llc/,/selling/,/grow/,/letters/,/guides/,/about/", "Home: eight Start here cards link to each page");
    await clean(page, "Persistence"); await ctx.close();
  }

  /* 29. Old single-page anchors redirect to the new pages, keeping the query */
  {
    const { ctx, page } = await open(browser);
    const map = { "#checklist": "/checklist/", "#help": "/help/", "#llc": "/llc/", "#states": "/selling/", "#grow": "/grow/", "#letters": "/letters/", "#structure": "/guides/#structure", "#funding": "/guides/#funding", "#faq": "/guides/#faq", "#about": "/about/" };
    for (const [h, to] of Object.entries(map)) {
      await go(page, "/?zip=74103&type=software" + h);
      const u = new URL(page.url()), [toPath, toHash] = to.split("#");
      out(u.pathname === toPath && u.searchParams.get("zip") === "74103" && u.searchParams.get("type") === "software" && u.hash === (toHash ? "#" + toHash : ""), `/${h} → ${to} keeps the query (${u.pathname}${u.search}${u.hash})`);
    }
    await go(page, "/#nothing-here");
    eq(new URL(page.url()).pathname, "/", "Unknown anchors stay on Home");
    await clean(page, "Legacy redirects"); await ctx.close();
  }

  /* 30. 404 page */
  {
    const { ctx, page } = await open(browser);
    page.__expect404 = BASE + "/no/such/page";
    const r = await page.goto(BASE + "/no/such/page", { waitUntil: "networkidle" });
    eq(r.status(), 404, "Unknown paths return HTTP 404");
    const d = await page.evaluate(() => ({ title: document.title, h1: document.querySelector("h1").textContent, home: !!document.querySelector('main a.btn[href="/"]'), robots: document.querySelector('meta[name=robots]').content, nav: !!document.querySelector("#navlinks"), foot: !!document.querySelector("footer .credits") }));
    out(d.title === "Page not found · Strike Right" && d.h1 === "We couldn't find that page" && d.home && d.robots === "noindex" && d.nav && d.foot, "404 page uses the site design, links home and is noindex");
    await clean(page, "404"); await ctx.close();
  }

  /* 31. Header logo animation */
  {
    const { ctx, page } = await open(browser);
    const st = () => page.evaluate(() => { const m = document.querySelector(".top-band .mark"); return { rise: m.classList.contains("rise"), anim: getComputedStyle(m.querySelector("rect:last-child")).animationName, w: m.getBoundingClientRect().width, h: m.getBoundingClientRect().height }; });
    let s = await st();
    out(s.rise && s.anim === "sr-land", `First load in a session plays the animation (${s.anim})`);
    const sizes = []; for (let k = 0; k < 4; k++) { sizes.push((await st()).w + "x" + (await st()).h); await page.waitForTimeout(120); }
    out(new Set(sizes).size === 1 && sizes[0] === "30x30", `No layout shift while animating (${sizes.join(", ")})`);
    out(await page.evaluate(() => [...document.querySelectorAll("footer .mark, #about .mark")].every(m => !m.classList.contains("rise") && getComputedStyle(m.querySelector("rect")).animationName === "none")), "Footer mark stays static");
    const fav = await (await page.request.get(BASE + "/favicon.svg")).text();
    out(!/animate|@keyframes|<style/.test(fav), "Favicon stays static");
    await go(page, "/llc/");
    s = await st(); out(!s.rise, "A later page in the same session skips it");
    await page.hover(".top-band .brand");
    s = await st(); out(s.rise && s.anim === "sr-land", "Hovering the logo replays it");
    await go(page, "/help/");
    await page.focus(".top-band .brand");
    s = await st(); out(s.rise, "Focusing the logo replays it");
    await go(page, "/about/");
    out(await page.evaluate(() => [...document.querySelectorAll("#about .mark")].every(m => getComputedStyle(m.querySelector("rect")).animationName === "none")), "About mark stays static");
    await clean(page, "Logo"); await ctx.close();
    const r = await open(browser, { reduced: "reduce" });
    const rs = await r.page.evaluate(() => { const m = document.querySelector(".top-band .mark"); return getComputedStyle(m.querySelector("rect:last-child")).animationName; });
    eq(rs, "none", "Reduced motion shows the mark static");
    await r.page.hover(".top-band .brand");
    eq(await r.page.evaluate(() => getComputedStyle(document.querySelector(".top-band .mark rect")).animationName), "none", "Reduced motion: hover does not animate either");
    await r.ctx.close();
  }

  /* 32. Language persists across pages when it came from ?lang= (fresh browser, real link clicks) */
  {
    const { ctx, page } = await open(browser, { url: "/llc/?lang=es" });
    const isEs = async where => { const r = await page.evaluate(() => ({ lang: document.documentElement.lang, nav: document.querySelector('#navlinks a[href="/help/"]').textContent, stored: localStorage.getItem("strike-right-lang") }));
      out(r.lang === "es" && r.nav === "Ayuda gratuita" && r.stored === "es", `Spanish persists: ${where} (${new URL(page.url()).pathname})`); };
    await isEs("start at /llc/?lang=es");
    await page.click('#navlinks a[href="/help/"]'); await page.waitForURL(/\/help\//); await page.waitForLoadState("networkidle"); await isEs("nav link to Free help");
    await page.click(".pager a.next"); await page.waitForURL(/\/llc\//); await page.waitForLoadState("networkidle"); await isEs("next card");
    await page.click(".pager a.prev"); await page.waitForURL(/\/help\//); await page.waitForLoadState("networkidle"); await isEs("previous card");
    await page.click('#navlinks a[href="/"]'); await page.waitForURL(u => new URL(u).pathname === "/"); await page.waitForLoadState("networkidle"); await isEs("nav link to Home");
    await page.click('.start-grid a[href="/letters/"]'); await page.waitForURL(/\/letters\//); await page.waitForLoadState("networkidle"); await isEs("Home card to Letters");
    await page.click('footer a[href="/guides/"]'); await page.waitForURL(/\/guides\//); await page.waitForLoadState("networkidle"); await isEs("footer link to Guides");
    await go(page, "/selling/?lang=en");
    const isEn = async where => { const r = await page.evaluate(() => ({ lang: document.documentElement.lang, nav: document.querySelector('#navlinks a[href="/help/"]').textContent, stored: localStorage.getItem("strike-right-lang") }));
      out(r.lang === "en" && r.nav === "Free help" && r.stored === "en", `English persists: ${where} (${new URL(page.url()).pathname})`); };
    await isEn("?lang=en switches back");
    await page.click('#navlinks a[href="/checklist/"]'); await page.waitForURL(/\/checklist\//); await page.waitForLoadState("networkidle"); await isEn("nav link after ?lang=en");
    await page.click(".pager a.next"); await page.waitForURL(/\/help\//); await page.waitForLoadState("networkidle"); await isEn("next card after ?lang=en");
    await go(page, "/about/?lang=fr");
    eq(await page.evaluate(() => [document.documentElement.lang, localStorage.getItem("strike-right-lang")].join(",")), "en,en", "An unsupported ?lang= is ignored and doesn't change the saved choice");
    await clean(page, "Language persistence"); await ctx.close();
  }

  /* 33. City edits are never discarded */
  {
    const saved = p => p.evaluate(() => JSON.parse(localStorage.getItem("biz-starter-guide-v2") || "{}").city);
    const { ctx, page } = await open(browser);
    await page.fill("#city", "Dallas"); await page.waitForTimeout(400);
    await page.fill("#city", "Plano"); await page.selectOption("#btype", "food");
    await page.waitForTimeout(500);
    out(await page.inputValue("#city") === "Plano" && await saved(page) === "Plano" && await page.inputValue("#btype") === "food", "Home: type Plano, change business type within 300 ms: Plano stays");
    await go(page, "/llc/");
    await setPicker(page, { zip: "75201", city: "Dallas" });
    await page.click("#profileBtn"); await page.fill("#p-city", "Plano"); await page.selectOption("#p-where", "online");
    await page.waitForTimeout(500);
    out(await page.inputValue("#p-city") === "Plano" && await saved(page) === "Plano" && await page.textContent("#chipText") === "Plano, TX · Food & drink", "Profile panel: type Plano, change another field at once: Plano stays");
    await page.keyboard.press("Escape");
    await go(page, "/");
    await page.fill("#city", "Garland");
    await page.click('#navlinks a[href="/checklist/"]'); await page.waitForURL(/\/checklist\//); await page.waitForLoadState("networkidle");
    out((await page.textContent("#planTitle")).includes("Garland") && await page.textContent("#chipText") === "Garland, TX · Food & drink", "Home: type a city and navigate immediately: the next page shows it");
    await page.click("#profileBtn"); await page.fill("#p-city", "Mesquite");
    await page.click('#navlinks a[href="/help/"]'); await page.waitForURL(/\/help\//); await page.waitForLoadState("networkidle");
    out(await page.textContent("#chipText") === "Mesquite, TX · Food & drink", "Profile panel: type a city and navigate immediately: the next page shows it");
    await page.click("#profileBtn"); await page.fill("#p-city", "Irving"); await page.click('#profilePanel [data-copy-link]');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    eq(new URL(link).searchParams.get("city"), "Irving", "Copying a share link right after typing includes the new city");
    await page.keyboard.press("Escape");
    await clean(page, "City edits"); await ctx.close();
  }

  /* 34. 404 handling and noindex */
  {
    const { ctx, page } = await open(browser);
    for (const p of ["/no-such-page", "/llc/nope/", "/checklist/x.html"]) eq((await page.request.get(BASE + p)).status(), 404, `${p} returns HTTP 404`);
    for (const p of ["/404", "/404.html"]) {
      const r = await page.request.get(BASE + p, { maxRedirects: 0 });
      eq(r.headers()["x-robots-tag"], "noindex", `${p} carries X-Robots-Tag: noindex (HTTP ${r.status()})`);
      page.__expect404 = null;
      await go(page, p);
      eq(await page.getAttribute('meta[name="robots"]', "content"), "noindex", `${p} page carries <meta name="robots" content="noindex">`);
      out(!(await page.locator('link[rel="canonical"]').count()), `${p} has no canonical URL`);
    }
    const html404 = fs.readFileSync(path.join(PUBLIC, "404.html"), "utf8");
    out(/<meta name="robots" content="noindex">/.test(html404), "404.html source has the noindex meta tag");
    const sm = await (await page.request.get(BASE + "/sitemap.xml")).text();
    out(!/404/.test(sm), "Sitemap does not list the 404 page");
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const l of locs) {
      const r = await page.request.get(BASE + new URL(l).pathname + new URL(l).search, { maxRedirects: 0 });
      if (r.status() !== 200 || r.headers()["x-robots-tag"]) out(false, `Sitemap URL ${l} is a 200 without noindex (got ${r.status()})`);
    }
    out(locs.length === 18, `Every sitemap URL is a real, indexable page (${locs.length} checked)`);
    await ctx.close();
  }

  /* 35. Shared header, nav and footer markup is identical on all ten HTML files */
  {
    const files = ["index.html", ...["checklist", "help", "llc", "selling", "grow", "letters", "guides", "about"].map(d => d + "/index.html"), "404.html"];
    const parts = html => {
      const h0 = html.indexOf('<a class="skip-link"'), navStart = html.indexOf('<nav class="nav gut"', h0), h1 = html.indexOf("</nav>", navStart) + 6;
      const f0 = html.indexOf("<footer"), f1 = html.indexOf("</footer>") + 9;
      const t0 = html.indexOf('<button type="button" class="to-top"'), t1 = html.indexOf("</button>", t0) + 9;
      if (h0 < 0 || navStart < 0 || f0 < 0 || t0 < 0) return null;
      /* Only the active-page marker may differ between pages */
      const norm = s => s.replace(/ aria-current="page"/g, "").replace(/ class="(on|active)"/g, "");
      return { header: norm(html.slice(h0, h1)), footer: norm(html.slice(f0, f1)), toTop: html.slice(t0, t1) };
    };
    const base = parts(fs.readFileSync(path.join(PUBLIC, files[0]), "utf8"));
    for (const f of files) {
      const p = parts(fs.readFileSync(path.join(PUBLIC, f), "utf8"));
      if (!p) { out(false, `${f}: shared header, nav or footer not found`); continue; }
      for (const k of ["header", "footer", "toTop"]) {
        let at = -1; for (let i = 0; i < Math.max(p[k].length, base[k].length); i++) if (p[k][i] !== base[k][i]) { at = i; break; }
        out(at < 0, `${f}: shared ${k} matches index.html${at < 0 ? "" : ` — differs at: …${p[k].slice(Math.max(0, at - 40), at + 40)}…`}`);
      }
      const marks = (fs.readFileSync(path.join(PUBLIC, f), "utf8").slice(0, fs.readFileSync(path.join(PUBLIC, f), "utf8").indexOf("</nav>")).match(/aria-current="page"/g) || []).length;
      eq(marks, f === "about/index.html" || f === "404.html" ? 0 : 1, `${f}: exactly the expected aria-current marker in the shared nav`);
    }
    /* Self-check: the comparison really catches a one-character change */
    const tampered = parts(fs.readFileSync(path.join(PUBLIC, files[3]), "utf8").replace(">Guides</a>", ">Guide</a>"));
    out(tampered.header !== base.header, "Drift check detects a one-character change in the shared nav");
  }

  await browser.close();
  finish(fail ? 1 : 0);
})().catch(e => { console.error(e); fail++; finish(1); });
