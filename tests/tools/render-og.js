/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — renders tools/og-image.svg to public/og-image.png (1200×630) with headless Chromium
*/
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "og-image.svg"), "utf8");
  const html = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Public+Sans:wght@500&display=block"><style>html,body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() => document.fonts.check('800 40px "Archivo"') && document.fonts.check('500 20px "Public Sans"'));
  if (!ok) { console.error("Fonts did not load; refusing to render with fallback fonts."); process.exit(1); }
  const out = path.join(__dirname, "..", "..", "public", "og-image.png");
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log("Wrote " + out);
})();
