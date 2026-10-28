/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — headless browser tests (Playwright + axe)

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
  page.on("console", m => { if (auditNoise(page, m.text())) return; if (m.type() === "error" || /Content Security Policy/i.test(m.text())) page.__errors.push(m.text()); });
  page.on("pageerror", e => page.__errors.push("pageerror: " + e.message));
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  return { ctx, page };
}
const txt = (p, s) => p.locator(s).first().innerText();
const ids = p => p.$$eval(".item input", els => els.map(e => e.dataset.id));
const groups = p => p.$$eval(".group-head h3", hs => hs.map(h => h.textContent));
async function setPicker(p, { zip, state, city, type, hire } = {}) {
  if (zip !== undefined) await p.fill("#zip", zip);
  if (state !== undefined) await p.selectOption("#state", state);
  if (city !== undefined) { await p.fill("#city", city); await p.waitForTimeout(400); }
  if (type !== undefined) await p.selectOption("#btype", type);
  if (hire !== undefined) await p.setChecked("#hire", hire);
}
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

  /* 1. Layout, themes, contrast and console at 360 / 768 / 1280, light and dark */
  for (const width of [360, 768, 1280]) for (const scheme of ["light", "dark"]) {
    const tag = `${width}px ${scheme}`;
    const { ctx, page } = await open(browser, { width, scheme, url: "/?zip=75201&city=Dallas&type=food&hire=1&reach=some&picks=OK,CA,NY" });
    await page.click(`[data-theme-set="${scheme}"]`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    out(scheme === "dark" ? bg === "rgb(16, 22, 19)" : bg === "rgb(245, 246, 244)", `${tag}: theme background ${bg}`);
    for (const lang of ["en", "es"]) {
      await page.click(`[data-lang-set="${lang}"]`);
      for (const sel of ["#llc details", ".phase"]) await page.$$eval(sel, ds => ds.forEach(d => d.open = true));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      out(over <= 0, `${tag} ${lang}: no horizontal scroll (overflow ${over}px)`);
      for (const tab of ["pilot", "trial", "promo", "chan", "rules"]) {
        await page.click(`#tab-${tab}`);
        const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (o2 > 0) out(false, `${tag} ${lang}: horizontal scroll on tab ${tab} (${o2}px)`);
      }
      await page.click("#tab-pilot");
      await axeCheck(page, `${tag} ${lang}`);
    }
    await page.click('[data-lang-set="en"]');
    await clean(page, tag);
    await ctx.close();
  }

  /* 2. ZIP to state detection */
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
    const { ctx, page } = await open(browser);
    await setPicker(page, { state: "California", type: "software" });
    let i = await ids(page);
    out(i.includes("sw-pay") && i.includes("idea-mvp") && !i.includes("fd-health"), "Software type adds software items");
    let names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("SBIR / STTR programs") && !names.includes("FDA food guidance"), "Software type shows SBIR and hides FDA food guidance");
    eq(await page.locator(".card:has-text('SBIR / STTR programs') .pill.fit").count(), 1, "SBIR card has a Best fit badge for software");
    await setPicker(page, { type: "food" });
    i = await ids(page);
    out(i.includes("fd-health") && i.includes("fd-cottage") && !i.includes("sw-pay"), "Food type swaps in food items");
    names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("FDA food guidance") && !names.includes("SBIR / STTR programs"), "Food type shows FDA guidance, hides SBIR");
    await page.click("#helpToggle");
    names = await page.$$eval(".card h3", h => h.map(x => x.textContent));
    out(names.includes("SBIR / STTR programs"), "Show all reveals hidden resources");
    await page.click("#helpToggle");
    await setPicker(page, { hire: true }); i = await ids(page);
    out(i.includes("hire-1") && i.includes("hire-4"), "Hiring adds hiring items");
    await clean(page, "Types"); await ctx.close();
  }

  /* 4. Oklahoma, Tulsa, Texas and Dallas groups only when expected */
  {
    const { ctx, page } = await open(browser);
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
    const { ctx, page } = await open(browser);
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
    const { ctx, page } = await open(browser);
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
    const { ctx, page } = await open(browser);
    await setPicker(page, { state: "Texas" });
    await page.click('[data-reach="some"]');
    out(await page.isVisible("#pickWrap"), "Selected states shows the state grid");
    await page.check('#pickGrid input[value="California"]'); await page.check('#pickGrid input[value="Oregon"]'); await page.check('#pickGrid input[value="New York"]');
    eq(await txt(page, "#pickCount"), "3 states selected", "Pick count updates");
    eq(await page.locator("#reachOut tbody tr").count(), 2, "Nexus table lists the 2 picked states that have sales tax");
    out((await txt(page, "#reachOut")).includes("No statewide sales tax: Oregon"), "Oregon listed as no statewide sales tax");
    const f = await txt(page, "#reachOut .fresh");
    out(f.includes("Last verified: October 2026"), "Nexus table shows Last verified");
    out(page.url().includes("reach=some") && page.url().includes("picks=CA,NY,OR"), "Picks are written to the URL as state codes");
    await page.click("#pickNone"); eq(await txt(page, "#pickCount"), "Select the states where you'll sell", "Clear empties the picks");
    await page.click('[data-reach="all"]'); out(await page.locator("#reachOut tbody tr").count() >= 44, "All states lists every taxing state");
    await clean(page, "Reach"); await ctx.close();
  }

  /* 8. Every letter type renders, in English and Spanish */
  {
    const { ctx, page } = await open(browser, { url: "/?state=TX&city=Dallas" });
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

  /* 9. Share links round-trip; URL overrides saved choices */
  {
    const { ctx, page } = await open(browser);
    await setPicker(page, { zip: "74103", city: "Tulsa", type: "software", hire: true });
    await page.selectOption("#where", "online");
    await page.click('[data-reach="some"]'); await page.check('#pickGrid input[value="Texas"]'); await page.check('#pickGrid input[value="Kansas"]');
    await page.fill("#lName", "Private Person");
    await page.click("#copyLink");
    const link = await page.evaluate(() => navigator.clipboard.readText());
    const q = new URL(link).searchParams;
    eq([...q.keys()].join(","), "zip,state,city,type,where,hire,reach,picks", "Copied link holds only plan parameters");
    eq(q.get("picks"), "KS,TX", "Copied link picks are state codes");
    out(!link.includes("Private"), "Copied link has no letter fields");
    await ctx.close();
    const saved = { "biz-starter-guide-v2": JSON.stringify({ zip: "90210", state: "California", city: "Beverly Hills", type: "food", where: "home", hire: false, reach: "home", pick: [], done: { "help-sbdc": true }, open: {}, letter: { lName: "Saved Name" }, llcState: "California" }) };
    const b = await open(browser, { url: link.replace(/^https?:\/\/[^/]+/, ""), storage: saved });
    const st = await b.page.evaluate(() => ({ zip: zip.value, state: document.querySelector("#state").value, city: city.value, type: btype.value, where: where.value, hire: hire.checked, reach: document.querySelector('#reach [aria-pressed="true"]').dataset.reach, picks: [...document.querySelectorAll("#pickGrid input:checked")].map(i => i.value).join(",") }));
    eq(JSON.stringify(st), JSON.stringify({ zip: "74103", state: "Oklahoma", city: "Tulsa", type: "software", where: "online", hire: true, reach: "some", picks: "Kansas,Texas" }), "Opening the link restores the plan over saved choices");
    eq(await b.page.inputValue("#lName"), "Saved Name", "Saved letter drafts are kept");
    out(await b.page.isChecked("#c-help-sbdc"), "Saved checkmarks are kept");
    const hl = await b.page.evaluate(() => history.length);
    await b.page.selectOption("#btype", "retail");
    out(b.page.url().includes("type=retail") && !b.page.url().includes("type=software"), "Changing a choice updates the URL with replaceState");
    eq(await b.page.evaluate(() => history.length), hl, "No navigation entries added");
    await clean(b.page, "Share links"); await b.ctx.close();
    const c = await open(browser, { url: "/?state=zz&type=bogus&where=moon&picks=XX,TX&reach=some" });
    eq(await c.page.inputValue("#state"), "", "Invalid state code is ignored");
    eq(await c.page.inputValue("#btype"), "services", "Invalid type falls back to default");
    eq(await c.page.$$eval("#pickGrid input:checked", i => i.map(x => x.value).join(",")), "Texas", "Invalid pick codes are dropped");
    await c.ctx.close();
  }

  /* 10. Language toggle */
  {
    const { ctx, page } = await open(browser, { url: "/?zip=75201&city=Dallas&type=food&hire=1&reach=some&picks=OK,CA" });
    const enIds = await ids(page);
    const enLabels = await page.$$eval(".item label", l => l.map(x => x.textContent));
    await page.click('[data-lang-set="es"]');
    eq(await page.getAttribute("html", "lang"), "es", "html lang is es");
    eq(await txt(page, "h1"), "Empiece su negocio de la manera correcta", "Header is Spanish");
    eq(JSON.stringify(await ids(page)), JSON.stringify(enIds), "Same checklist items in Spanish");
    const esLabels = await page.$$eval(".item label", l => l.map(x => x.textContent));
    const same = esLabels.filter((l, i) => l === enLabels[i]);
    eq(same.length, 0, `Every checklist item is translated${same.length ? " — " + same.join(" | ") : ""}`);
    out((await txt(page, "#helpGroups")).includes("Área de Dallas") && (await txt(page, "#helpGroups")).includes("Más adecuado"), "Resource groups are Spanish");
    out((await txt(page, "#helpGroups")).includes("Última verificación: octubre de 2026"), "Last verified is Spanish");
    out((await txt(page, "#llcCard")).includes("Certificate of Formation (certificado de formación)"), "Legal term kept with Spanish in parentheses");
    out((await txt(page, "#reachOut")).includes("Impuesto sobre ventas"), "Selling across states is Spanish");
    out((await txt(page, "#faq")).includes("¿Necesito una LLC para empezar?"), "FAQ is Spanish");
    out((await txt(page, "#about")).includes("Privacidad") && (await txt(page, "#about")).includes("Frandy Slueue"), "About is Spanish and keeps credits");
    for (const tab of ["pilot", "trial", "promo", "chan", "rules"]) { await page.click(`#tab-${tab}`); out(/[áéíóúñ¿]/.test(await txt(page, `#panel-${tab}`)), `Get known tab ${tab} is Spanish`); }
    eq(await page.$eval("#btype option[value=food]", o => o.textContent), "Alimentos o bebidas", "Business types are Spanish");
    eq(await page.getAttribute("#zip", "placeholder"), "p. ej., 75201", "Placeholders are Spanish");
    out(page.url().includes("lang=es"), "URL carries lang=es");
    out((await page.getAttribute('link[rel="canonical"]', "href")).endsWith("?lang=es"), "Canonical points to the Spanish URL");
    const leftovers = await page.evaluate(() => [...document.querySelectorAll("main, header, footer")].map(e => e.innerText).join(" ").match(/\b(Choose a state|Copy checklist|Last verified|Best fit|Report outdated|Expand all|Free help)\b/g));
    eq(leftovers, null, "No common English UI strings left in Spanish mode");
    await page.reload({ waitUntil: "networkidle" });
    eq(await page.getAttribute("html", "lang"), "es", "Spanish persists after reload");
    await page.click('[data-lang-set="en"]');
    eq(await txt(page, "h1"), "Start your business the right way", "Back to English");
    out(!page.url().includes("lang="), "lang removed from URL in English");
    await clean(page, "Language"); await ctx.close();
    const fresh = await open(browser, { url: "/?lang=es" });
    eq(await fresh.page.getAttribute("html", "lang"), "es", "?lang=es works in a fresh browser");
    await fresh.ctx.close();
  }

  /* 11. Print emulation */
  {
    const { ctx, page } = await open(browser, { scheme: "dark", url: "/?zip=75201&city=Dallas&type=food" });
    await page.click('[data-theme-set="dark"]');
    await page.check("#c-help-sbdc");
    await page.click('#checklist [data-print-target="checklist"]');
    eq(await page.evaluate(() => window.__printed), 1, "Checklist print button calls print");
    await page.emulateMedia({ media: "print" });
    const s = await page.evaluate(() => {
      const vis = q => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none" && e.getClientRects().length > 0; };
      const cb = document.querySelector("#c-help-sbdc");
      return { nav: vis(".nav"), theme: vis(".tools"), top: vis("#toTop"), btn: vis("#copyPlan"), zip: vis("#zip"), checklist: vis("#checklist"), llc: vis("#llc"), letters: vis("#letters"),
        open: [...document.querySelectorAll(".phase")].every(d => d.open), cb: getComputedStyle(cb).display !== "none" && getComputedStyle(cb).backgroundColor,
        bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.body).color,
        url: getComputedStyle(document.querySelector("#phases .why a"), "::after").content };
    });
    out(!s.nav && !s.theme && !s.top && !s.btn && !s.zip, "Print hides nav, theme toggle, back-to-top, buttons and form controls");
    out(s.checklist && !s.llc && !s.letters, "Checklist print shows only the checklist");
    out(s.open, "Checklist prints with all steps expanded");
    eq(s.cb, "rgb(28, 107, 74)", "Checked boxes keep their checkmark color in print");
    eq(s.bg, "rgb(255, 255, 255)", "Print forces a light background even in dark theme");
    eq(s.ink, "rgb(17, 17, 17)", "Print forces dark text");
    out(/^"\s*\(" "?https?:/.test(s.url) || s.url.includes("attr(href)") || /https:\/\//.test(s.url), `Link URLs print after link text (${s.url.slice(0, 60)})`);
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.emulateMedia({ media: "screen" });
    eq(await page.evaluate(() => document.body.dataset.print || ""), "", "afterprint clears the print target");
    const restored = await page.$$eval(".phase", d => d.filter(x => x.open).length);
    out(restored < 6, `afterprint restores collapsed steps (${restored} open)`);
    await page.click('[data-print-target="letters"]');
    await page.emulateMedia({ media: "print" });
    const L = await page.evaluate(() => { const vis = q => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none" && e.getClientRects().length > 0; };
      const paper = getComputedStyle(document.querySelector("#letterOut")); return { out: vis("#letterOut"), form: vis("#letterForm"), head: vis("#letters .head"), band: vis(".band"), font: paper.fontFamily, border: paper.borderTopWidth }; });
    out(L.out && !L.form && !L.head && !L.band, "Letter print shows only the letter");
    out(/Georgia|Times/.test(L.font) && L.border === "0px", "Letter prints in a clean letter style");
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await page.emulateMedia({ media: "screen" });
    await page.click('#llc [data-print-target="llc"]');
    await page.emulateMedia({ media: "print" });
    const C = await page.evaluate(() => { const vis = q => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none" && e.getClientRects().length > 0; }; return { card: vis("#llcCard"), table: vis("#llc details"), sel: vis("#llcState"), check: vis("#checklist") }; });
    out(C.card && !C.table && !C.sel && !C.check, "LLC print shows the LLC card without the picker or table");
    const pdf = await page.pdf({ format: "Letter" });
    out(pdf.length > 10000, `LLC section renders to PDF (${pdf.length} bytes)`);
    await clean(page, "Print"); await ctx.close();
  }

  /* 12. Keyboard, focus, ARIA and reduced motion */
  {
    const { ctx, page } = await open(browser, { reduced: "reduce" });
    eq(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto", "Reduced motion turns off smooth scrolling");
    await page.focus("#tab-pilot"); await page.keyboard.press("ArrowRight");
    eq(await page.evaluate(() => document.activeElement.id), "tab-trial", "ArrowRight moves to next tab");
    eq(await page.getAttribute("#tab-trial", "aria-selected"), "true", "Focused tab is selected");
    out(await page.isHidden("#panel-pilot") && await page.isVisible("#panel-trial"), "Tab panels switch");
    await page.keyboard.press("End"); eq(await page.evaluate(() => document.activeElement.id), "tab-rules", "End goes to last tab");
    await page.keyboard.press("Home"); eq(await page.evaluate(() => document.activeElement.id), "tab-pilot", "Home goes to first tab");
    const tabIdx = await page.$$eval('#growTabs [role="tab"]', t => t.map(x => x.tabIndex).join(","));
    eq(tabIdx, "0,-1,-1,-1,-1", "Roving tabindex on tabs");
    await page.focus("#zip"); await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + " " + s.outlineWidth; });
    out(/solid 2px/.test(ring), `Keyboard focus is visible (${ring})`);
    const phase = page.locator(".phase summary").nth(1);
    await phase.focus(); const before = await page.$eval(".phase:nth-child(2)", d => d.open);
    await page.keyboard.press("Enter"); await page.waitForTimeout(50);
    out(await page.$eval(".phase:nth-child(2)", d => d.open) !== before, "Accordion steps toggle with Enter");
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100);
    out(await page.$eval("#toTop", e => getComputedStyle(e).visibility) === "hidden", "Hidden back-to-top button is out of the tab order");
    const pressed = await page.$$eval("[data-lang-set],[data-theme-set]", b => b.every(x => x.hasAttribute("aria-pressed")));
    out(pressed, "Language and theme toggles expose aria-pressed");
    await clean(page, "Keyboard"); await ctx.close();
  }

  /* 13. Head tags, assets and served headers */
  {
    const { ctx, page } = await open(browser);
    const head = await page.evaluate(() => ({ canon: document.querySelector('link[rel=canonical]').href, og: document.querySelector('meta[property="og:image"]').content, tw: document.querySelector('meta[name="twitter:card"]').content, icon: document.querySelector('link[rel=icon]').getAttribute("href"), inline: [...document.scripts].filter(s => !s.src).length, beacon: !!document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]') }));
    out(head.canon.startsWith("https://") && head.og.endsWith("/og-image.png") && head.tw === "summary_large_image", "Canonical, Open Graph and Twitter tags present");
    eq(head.icon, "favicon.svg", "Favicon is the SVG file, not a data URI");
    eq(head.inline, 0, "No inline scripts");
    out(head.beacon, "Cloudflare Web Analytics beacon script present");
    for (const [p, type] of [["/favicon.svg", "image/svg+xml"], ["/og-image.png", "image/png"], ["/robots.txt", "text/plain"], ["/sitemap.xml", "xml"], ["/app.js", "javascript"], ["/i18n-es.js", "javascript"], ["/styles.css", "text/css"]]) {
      const r = await page.request.get(BASE + p); out(r.ok() && (r.headers()["content-type"] || "").includes(type), `${p} served as ${type}`);
    }
    const r = await page.request.get(BASE + "/");
    const h = r.headers();
    out(h["strict-transport-security"] === "max-age=31536000; includeSubDomains", "HSTS header");
    out(h["x-content-type-options"] === "nosniff" && h["x-frame-options"] === "DENY" && h["referrer-policy"] === "strict-origin-when-cross-origin", "nosniff, X-Frame-Options, Referrer-Policy headers");
    out(h["permissions-policy"] === "camera=(), microphone=(), geolocation=(), payment=()", "Permissions-Policy header");
    out(/default-src 'self'/.test(h["content-security-policy"]) && /frame-ancestors 'none'/.test(h["content-security-policy"]) && !/unsafe-eval/.test(h["content-security-policy"]), "CSP header");
    eq((await page.request.get(BASE + "/_headers")).status(), 404, "_headers file itself is not served");
    out(await page.evaluate(() => document.documentElement.classList.contains("ready") && getComputedStyle(document.body).visibility === "visible"), "Page is revealed once app.js has rendered");
    await ctx.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const np = await nojs.newPage(); await np.goto(BASE + "/", { waitUntil: "load" });
    eq(await np.evaluate(() => getComputedStyle(document.body).visibility), "visible", "Without JavaScript the page is still visible");
    await nojs.close();
  }


  /* 14. Finding 1: user text never becomes markup (city from the form, the URL and storage; both languages) */
  {
    const evil = ['<a href="https://example.com">Help</a>', "<img src=x onerror=alert(1)>"];
    for (const city of evil) for (const lang of ["en", "es"]) {
      const tag = `City ${JSON.stringify(city)} (${lang})`;
      const { ctx, page } = await open(browser, { url: `/?state=TX&type=food&hire=1&lang=${lang}` });
      await page.fill("#city", city); await page.waitForTimeout(450);
      await page.$$eval(".phase", ds => ds.forEach(d => d.open = true));
      const dom = await page.evaluate(() => ({
        a: document.querySelectorAll('main a[href="https://example.com"], header a[href="https://example.com"]').length,
        img: document.querySelectorAll('main img, header img').length,
        labels: [...document.querySelectorAll(".item label")].map(l => l.textContent).join("\n"),
        title: document.querySelector("#planTitle").textContent }));
      eq(dom.a + dom.img, 0, `${tag}: no injected elements`);
      out(dom.labels.includes(city) && dom.title.includes(city), `${tag}: shown as plain text in checklist and title`);
      await page.selectOption("#lType", "advice");
      out((await page.textContent("#letterOut")).includes(city), `${tag}: letter shows it as text`);
      await page.click("#copyPlan");
      eq(await page.evaluate(() => window.__alerts), 0, `${tag}: no script ran`);
      await clean(page, tag); await ctx.close();
    }
    const viaUrl = await open(browser, { url: "/?state=TX&city=" + encodeURIComponent(evil[1]) });
    eq(await viaUrl.page.evaluate(() => document.querySelectorAll("main img").length), 0, "City from a share link is escaped");
    await viaUrl.ctx.close();
    const viaStore = await open(browser, { storage: { "biz-starter-guide-v2": JSON.stringify({ state: "Texas", city: evil[0], type: "food" }) } });
    eq(await viaStore.page.evaluate(() => document.querySelectorAll('main a[href="https://example.com"]').length), 0, "City from saved storage is escaped");
    await viaStore.ctx.close();
  }

  /* 15. Finding 2: prototype keys fall back to defaults */
  for (const bad of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
    const { ctx, page } = await open(browser, { url: `/?type=${bad}&where=${bad}&reach=${bad}&state=${bad}&picks=${bad},TX&lang=${bad}` });
    const st = await page.evaluate(() => ({ type: btype.value, where: where.value, state: document.querySelector("#state").value, reach: document.querySelector('#reach [aria-pressed="true"]').dataset.reach, lang: document.documentElement.lang, items: document.querySelectorAll(".item").length }));
    eq(JSON.stringify(st), JSON.stringify({ type: "services", where: "home", state: "", reach: "home", lang: "en", items: st.items }), `?…=${bad} falls back to defaults`);
    out(st.items > 20, `?…=${bad}: checklist still renders (${st.items} items)`);
    await clean(page, `Prototype key ${bad}`); await ctx.close();
  }

  /* 16. Finding 3: bad saved state is normalized */
  {
    const cases = {
      "pick:null, done:null, letter:\"x\"": { pick: null, done: null, letter: "x", open: null, type: "food", state: "Texas" },
      "invalid letter type": { letter: { type: "constructor", lName: "Ana", evil: "<b>x</b>", lBiz: 42 }, state: "Texas" },
      "wrong types everywhere": { zip: 75201, state: "Atlantis", city: { a: 1 }, type: "__proto__", where: "moon", hire: "yes", reach: ["all"], pick: ["Texas", "Texas", "Nowhere", 5], done: { "help-sbdc": "true", "reg-ein": true }, open: [1], llcState: "toString" },
      "not an object": [1, 2, 3]
    };
    for (const [name, data] of Object.entries(cases)) {
      const { ctx, page } = await open(browser, { storage: { "biz-starter-guide-v2": JSON.stringify(data) } });
      const st = await page.evaluate(() => ({ type: btype.value, where: where.value, state: document.querySelector("#state").value, llc: document.querySelector("#llcState").value, letterType: lType.value, items: document.querySelectorAll(".item").length, saved: JSON.parse(localStorage.getItem("biz-starter-guide-v2") || "{}") }));
      out(st.items > 20 && ["advice", "pilot", "intro", "partner", "loi", "program", "followup"].includes(st.letterType), `Saved state "${name}": page renders, letter type valid (${st.letterType})`);
      if (name === "invalid letter type") { eq(st.letterType, "advice", "Invalid saved letter type falls back to advice"); eq(await page.inputValue("#lName"), "Ana", "Valid saved letter fields are kept"); eq(await page.inputValue("#lBiz"), "", "Non-string letter fields are dropped"); }
      if (name === "wrong types everywhere") {
        eq(JSON.stringify([st.type, st.where, st.state, st.llc]), JSON.stringify(["services", "home", "", "Alabama"]), "Invalid saved choices fall back to defaults");
        out(await page.isChecked("#c-reg-ein") && !(await page.isChecked("#c-help-sbdc")), "Only boolean checkmarks survive");
      }
      await page.$eval("#c-idea-desc", e => e.click());
      const after = await page.evaluate(() => JSON.parse(localStorage.getItem("biz-starter-guide-v2")));
      out(Array.isArray(after.pick) && typeof after.done === "object" && typeof after.letter === "object" && !Array.isArray(after.open), `Saved state "${name}": stored back in clean shape`);
      await clean(page, `Saved state ${name}`); await ctx.close();
    }
    const broken = await open(browser, { storage: { "biz-starter-guide-v2": "{not json" } });
    eq(await broken.page.inputValue("#btype"), "services", "Corrupt JSON in storage recovers silently");
    await clean(broken.page, "Corrupt JSON"); await broken.ctx.close();
  }

  /* 17. Finding 6: ZIP exceptions win over three-digit ranges */
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

  /* 18. Finding 7: Texas franchise tax wording (English and Spanish) */
  {
    const { ctx, page } = await open(browser, { url: "/?state=TX&city=Dallas" });
    await page.selectOption("#llcState", "Texas");
    const card = await page.textContent("#llcCard");
    out(card.includes("Every Texas LLC files every year by May 15") && card.includes("No Tax Due Report is no longer filed") && card.includes("Above the threshold, file the franchise tax report"), "LLC card: Texas wording");
    const item = await page.textContent("#c-tx-franchise + div");
    out(item.includes("Every LLC") && item.includes("Public Information Report or Ownership Information Report") && item.includes("No Tax Due Report is no longer filed"), "Checklist: Texas franchise item wording");
    out((await page.textContent(".card:has(h3:text-is('Texas Comptroller of Public Accounts'))")).includes("No Tax Due Report is no longer filed"), "Comptroller card wording");
    await page.click("#llc summary"); await page.fill("#llcFilter", "texas");
    out((await page.textContent("#llcTable tbody")).includes("No Tax Due Report is no longer filed"), "LLC table Texas row wording");
    await page.click('[data-lang-set="es"]');
    out((await page.textContent("#llcCard")).includes("Toda LLC de Texas presenta cada año") && (await page.textContent("#llcCard")).includes("ya no se presenta"), "Spanish LLC card: Texas wording");
    out((await page.textContent("#c-tx-franchise + div")).includes("No Tax Due Report ya no se presenta"), "Spanish checklist: Texas franchise wording");
    await clean(page, "Texas wording"); await ctx.close();
  }

  /* 19. Finding 8: Greenwood Women's Business Center */
  {
    const { ctx, page } = await open(browser, { url: "/?state=OK&city=Tulsa" });
    const card = page.locator(".card:has(h3:text-is(\"Greenwood Women's Business Center\"))");
    eq(await card.count(), 1, "Greenwood card present");
    const html = await card.innerHTML();
    out(!/google\.com/.test(html) && !/539-867-4127/.test(html) && !/Greenwood Ave/.test(html), "Greenwood card has no Google link, phone or address");
    eq(await card.locator("a").getAttribute("href"), "https://www.sba.gov/local-assistance/find", "Greenwood links to the SBA locator");
    await ctx.close();
  }

  /* 20. Finding 9: without JavaScript */
  {
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 900 } });
    const np = await nojs.newPage(); await np.goto(BASE + "/", { waitUntil: "load" });
    const r = await np.evaluate(() => ({ msg: document.querySelector(".noscript-msg") && document.querySelector(".noscript-msg").offsetParent !== null ? document.querySelector(".noscript-msg").textContent : "",
      steps: [...document.querySelectorAll("#phases .fallback h3")].map(h => h.textContent), links: [...document.querySelectorAll("#helpGroups .fallback a")].map(a => a.href),
      picker: getComputedStyle(document.querySelector(".picker")).display, body: getComputedStyle(document.body).visibility, over: document.documentElement.scrollWidth - innerWidth }));
    eq(r.msg, "Turn on JavaScript to tailor this guide to your state and business type.", "No-JS message is visible");
    eq(r.steps.length, 6, "No-JS fallback lists the six checklist steps");
    out(r.links.includes("https://americassbdc.org/") && r.links.some(l => l.includes("score.org")) && r.links.some(l => l.includes("irs.gov")), "No-JS fallback links the main national resources");
    eq(r.picker, "none", "No-JS hides controls that need JavaScript");
    eq(r.body, "visible", "No-JS page is visible");
    out(r.over <= 0, "No-JS page has no horizontal scroll at 360px");
    await nojs.close();
    const { ctx, page } = await open(browser);
    out(await page.locator("#phases .fallback").count() === 0 && await page.locator("#helpGroups .fallback").count() === 0, "With JavaScript the fallback is replaced");
    eq(await page.evaluate(() => document.querySelector(".noscript-msg")), null, "With JavaScript the no-JS message is not shown");
    await ctx.close();
  }

  /* 21. Findings 5 and 10: strict CSP, HSTS, no inline styles anywhere */
  {
    const { ctx, page } = await open(browser);
    const h = (await page.request.get(BASE + "/")).headers();
    eq(h["strict-transport-security"], "max-age=31536000; includeSubDomains", "HSTS with includeSubDomains");
    const csp = h["content-security-policy"];
    out(!/unsafe-inline/.test(csp) && /style-src 'self' https:\/\/fonts\.googleapis\.com;/.test(csp), "CSP style-src has no 'unsafe-inline'");
    for (const f of ["/", "/app.js", "/i18n-es.js", "/boot.js", "/favicon.svg"]) {
      const body = await (await page.request.get(BASE + f)).text();
      out(!/\sstyle="/.test(body) && !/<style[\s>]/.test(body), `${f}: no inline style attributes or <style> blocks`);
    }
    await ctx.close();
  }


  /* 22. Round 3 finding 1: the axe filter only hides the audit's own font request */
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

  /* 23. Round 3 finding 2: Dallas Small Business Assistance Program minimums */
  {
    const { ctx, page } = await open(browser, { url: "/?state=TX&city=Dallas" });
    const card = () => page.textContent(".card:has(h3:text-is('City of Dallas Office of Economic Development'))");
    let t = await card();
    out(t.includes("$150,000 in Target Areas or $250,000 outside them") && t.includes("75% of project costs committed from non-City sources"), "English: $150,000 in Target Areas, $250,000 outside, 75% from non-City sources");
    out(!t.includes("$250,000 in Target Areas"), "English: old reversed wording is gone");
    await page.click('[data-lang-set="es"]'); t = await card();
    out(t.includes("$150,000 en Target Areas o de $250,000 fuera de ellas") && t.includes("75% del costo del proyecto comprometido de fuentes que no sean la Ciudad"), "Spanish: $150,000 en Target Areas, $250,000 fuera, 75% de fuentes que no sean la Ciudad");
    out(!t.includes("$250,000 en Target Areas"), "Spanish: old reversed wording is gone");
    await ctx.close();
  }

  /* 24. Round 3 finding 3: no deploy placeholders left anywhere under public/ */
  {
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    for (const ph of ["YOUR-DOMAIN", "YOUR_BEACON_TOKEN"]) {
      const hits = walk(PUBLIC).filter(f => fs.readFileSync(f).includes(ph)).map(f => path.relative(PUBLIC, f));
      eq(hits.join(", "), "", `No "${ph}" in public/`);
    }
  }

  await browser.close();
  finish(fail ? 1 : 0);
})().catch(e => { console.error(e); fail++; finish(1); });
