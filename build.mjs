/**
 * The dashboard is authored as an Artifact page fragment (no doctype or
 * <html>/<head>/<body> — those are supplied at publish time). Vercel needs a
 * real document, so wrap the same single source into dist/index.html.
 *
 *   node build.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const SRC = "founderbee-dashboard.html";
const OUT_DIR = "dist";

const fragment = await readFile(SRC, "utf8");
const title = fragment.match(/<title>([^<]*)<\/title>/)?.[1] ?? "FounderBee Metrics";

// The <title> and font <link>s belong in <head>; everything else stays in <body>.
const HEAD_TAGS = /^\s*<(?:title|link)\b[^>]*>(?:[^<]*<\/title>)?\s*$/gim;
const head = (fragment.match(HEAD_TAGS) ?? []).map((t) => t.trim());
const body = fragment.replace(HEAD_TAGS, "").trim();

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Paying accounts, MRR, plan mix, billing mix and account health for FounderBee.">
<meta name="color-scheme" content="light dark">
${head.join("\n")}
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0}</style>
</head>
<body>
${body}
</body>
</html>
`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/index.html`, html, "utf8");
console.log(`Built ${OUT_DIR}/index.html — ${title} (${(html.length / 1024).toFixed(1)} KB)`);
