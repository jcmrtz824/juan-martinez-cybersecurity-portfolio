#!/usr/bin/env node
/* ============================================================================
   Builds preview.html — a single self-contained file, used to publish the site
   as a shareable Claude Artifact link.

   You do NOT need this to run the real website. index.html works on its own.
   This only exists so the site can be previewed from one file.

   Run:  node build-preview.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

const html   = read("index.html");
const css    = read("styles.css");
const config = read("site-config.js");
const app    = read("app.js");

const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
if (!bodyMatch) {
  console.error("Could not find <body> in index.html");
  process.exit(1);
}

/* Drop the <script src> tags — their contents get inlined below instead. */
const body = bodyMatch[1].replace(/\s*<script src="[^"]*"><\/script>/g, "").trim();

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
const title = titleMatch ? titleMatch[1].split("—")[0].trim() : "Taqueria La Fogata";

const fontLink = (html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/) || [""])[0];

const out = `<title>${title}</title>
${fontLink}
<style>
${css}
</style>

${body}

<script>
${config}
</script>
<script>
${app}
</script>
`;

fs.writeFileSync(path.join(dir, "preview.html"), out, "utf8");
console.log(`preview.html written — ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
