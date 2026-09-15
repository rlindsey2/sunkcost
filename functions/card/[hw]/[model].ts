/**
 * /card/<hardware>/<model>.png?u=…&r=…&kwh=…&ctx=…&p=…&d=…&v=…
 * Draws the share card for exactly those settings with the same code as the pre-built cards,
 * then keeps it in Cloudflare's cache. Settings with nothing honest to draw (no price, the
 * model does not fit) fall back to the pair's pre-built card.
 */
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import wasm from '../../../node_modules/@resvg/resvg-wasm/index_bg.wasm';
import fontData from '../../../.generated/fonts/sans.bin';
import { parseState } from '../../../src/state';
import { cardSvg } from '../../../src/card';
import { OG_WIDTH } from '../../../src/og';
import { dataset } from '../../../src/dataset';
import build from '../../../.generated/card-build.json';

declare const caches: any;
let ready: Promise<unknown> | null = null;

export async function onRequest(ctx: any): Promise<Response> {
  const request: Request = ctx.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
  const hw = String(ctx.params.hw);
  const model = String(ctx.params.model).replace(/\.png$/, '');
  const url = new URL(request.url);

  const hit = await caches.default.match(request);
  if (hit) return hit;

  const state = parseState(url.search, dataset, `/s/${hw}/${model}/`);
  if (state.hw !== hw || state.model !== model) return new Response('No such card', { status: 404 });
  const svg = cardSvg(state, dataset);
  if (!svg) return Response.redirect(`${url.origin}/og/${hw}--${model}.png`, 302);

  ready ??= initWasm(wasm);
  await ready;
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
    font: { fontBuffers: [new Uint8Array(fontData)], defaultFontFamily: build.fontFamily, loadSystemFonts: false },
  }).render().asPng();

  const res = new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
  ctx.waitUntil(caches.default.put(request, res.clone()));
  return res;
}
