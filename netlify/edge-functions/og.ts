/**
 * Social scrapers do not run JavaScript, so a link like /?hw=…&m=… would otherwise
 * preview as the generic card. This swaps the share tags for the ones matching the
 * configuration in the link, using cards rendered at build time. The page itself is
 * untouched: same HTML, same bundle, just different <meta> for that one request.
 */
import type { Context } from "@netlify/edge-functions";
import manifest from "./og-manifest.json" with { type: "json" };

type Pair = { image: string; headline: string; config: string };
const pairs = manifest.pairs as Record<string, Pair>;
const defaults = manifest.defaults as Record<string, string>;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  // the bare preview host is redirected to the real domain; let that happen untouched
  if (url.hostname === "sunkcost-preview.netlify.app") return context.next();
  const hw = url.searchParams.get("hw");
  if (!hw) return context.next();
  const model = url.searchParams.get("m") ?? defaults[hw];
  const pair = model ? pairs[`${hw}|${model}`] : undefined;
  if (!pair) return context.next();

  const response = await context.next();
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return response;

  const image = `${url.origin}${pair.image}`;
  const title = `${pair.headline} — Sunk Cost`;
  const description = `${pair.config}. Whether buying it beats renting the same model by the token, and how long that takes.`;
  let html = await response.text();
  html = html
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${esc(image)}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${esc(image)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${esc(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`)
    .replace(/<meta property="og:image:alt" content="[^"]*"/, `<meta property="og:image:alt" content="${esc(pair.headline)} ${esc(pair.config)}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${esc(url.origin + "/?" + url.searchParams.toString())}"`);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=300");
  return new Response(html, { status: response.status, headers });
};

export const config = { path: "/" };
