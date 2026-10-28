<!--
Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
Project: Strike Right — repository guide
-->

# Strike Right

Strike Right is a free, multi-page guide to starting a business in any U.S. state. It provides a tailored checklist, state LLC fees and requirements, sales-tax nexus guidance, business resources, letter templates and funding information in English and Spanish. Choices, checkmarks and letter drafts are saved in the visitor's browser.

Live site: **https://strikeright.app**

## Project layout

```text
public/                     Deployable static assets only
  index.html                Home: tailoring form, progress and Start here cards
  checklist/ help/ llc/ selling/ grow/ letters/ guides/ about/
                            One index.html per page, served at clean URLs (/llc/ …)
  404.html                  Not-found page (wrangler not_found_handling)
  boot.js                   First paint: script detection and old /#anchor redirects
  js/data.js                Shared data: states, types, LLC table, nexus, ZIP ranges
  js/resources.js           Resource directory (national, OK, Tulsa, TX, Dallas)
  js/core.js                Saved state, share links, language, print, theme, helpers
  js/layout.js              Header: tailoring form, profile panel, mobile menu, logo
  js/plan.js                Checklist builder (Home and Checklist)
  js/home.js, js/checklist.js, js/help.js, js/llc.js, js/selling.js, js/grow.js, js/letters.js
                            One small script per page
  js/es/                    Spanish: core.js plus one file per page
  styles.css                Screen and print styles
  _headers                  Security headers
  robots.txt, sitemap.xml    Crawler rules and sitemap
  favicon.svg, og-image.png  Brand and social assets
tests/
  package.json              Test and tooling dependencies
  package-lock.json         Locked dependency versions
  run-tests.js              Playwright and accessibility suite
  check-exit-code.js         Test failure and logging verification
  tools/                    Social-image source and renderer
  results/                  Generated logs and reports; ignored by Git
.github/workflows/test.yml  Pull-request and main-branch tests
wrangler.jsonc             Static-assets Worker configuration
LICENSE                    MIT license
```

## Run locally

Use Node.js 24 and npm. From the project root:

```sh
npm ci --prefix tests
tests/node_modules/.bin/wrangler dev --config wrangler.jsonc --port 8787
```

Open http://localhost:8787. Wrangler serves `public/` with the configured security headers.

## Run tests

Install Chromium and its operating system dependencies once:

```sh
cd tests
npx playwright install --with-deps chromium
```

With the local server running in another terminal:

```sh
npm run test:log
```

The suite covers responsive layouts at 360, 768 and 1280 pixels, light and dark themes, English and Spanish, accessibility, state handling, shared links, letters, print output, metadata and security headers. The command writes the date, command, results and exit status to `tests/results/run.txt` and returns a non-zero status when tests fail.

Stop the local server before checking failure handling:

```sh
npm run test:exitcheck
```

This check expects the site to be unavailable and verifies that `test:log` fails and records the failure. It overwrites `results/run.txt`; restart the server and rerun `npm run test:log` to record a passing full run.

## Deployment

Deployed automatically from main via Cloudflare Workers Builds.

`wrangler.jsonc` configures the existing Cloudflare Worker named `strike-right` to serve only `public/`. There is no site compilation step. Tests, logs and repository documentation are outside the deployment directory.

From the project root, after installing the test/tooling dependencies:

```sh
npx --prefix tests --no-install wrangler deploy --dry-run --config wrangler.jsonc
```

Cloudflare Workers Builds is connected to `Frandycode/strike_right`, with `main` as the production branch and `/` as the root directory. Leave the build command empty and use `npx wrangler deploy` as the production deploy command. Preview builds run through Workers Builds using `npx wrangler preview`, with preview URLs enabled; `"previews": {}` in `wrangler.jsonc` enables the preview configuration. Keep `strikeright.app` attached to the existing Worker.

The GitHub Actions workflow runs tests on every pull request and push to `main`, and uploads `tests/results/run.txt` as an artifact even if tests fail. It does not deploy and requires no Cloudflare secrets. Workers Builds authenticates deployments with a dedicated Workers Builds API token configured in Cloudflare.

### Not-found page

Unknown paths are served `public/404.html` with HTTP status 404 (`not_found_handling: "404-page"` in `wrangler.jsonc`). When the error page itself is requested directly (`/404`, or `/404.html`, which redirects to `/404`), Cloudflare serves it with status 200. So it is kept out of search another way: the page carries `<meta name="robots" content="noindex">`, `_headers` adds `X-Robots-Tag: noindex` for `/404` and `/404.html`, and it is not listed in `sitemap.xml`.

## Branch workflow

Feature branch → full tests → Independent review until CLEAR → pull request → merge to `main` deploys automatically once Workers Builds is connected.

Protect `main` by requiring a pull request and the `Tests` status check, and blocking force-pushes. Review the test log artifact before merging a failing or unexpected run.

## License

The source code is licensed under the [MIT License](LICENSE). The Strike Right name and step-check logo are not licensed for reuse.

## Credits

Strike Right created by Frandy Slueue, a production of CodeBreeder LLC.

© 2026 CodeBreeder LLC. All Rights Reserved.
