/**
 * A share page whose link carries its own settings (usage, ratio, electricity, context, price
 * paid, API decline): serve the static page, but point its preview at a card drawn for those
 * settings, with a title to match. Links on default settings keep the pre-built card untouched.
 * Cheap: no rendering here, just the calculation and a streaming tag rewrite.
 */
import { parseSharePath, parseState } from '../../../src/state';
import { cardQuery } from '../../../src/share';
import { cardView } from '../../../src/card';
import { dataset } from '../../../src/dataset';
import build from '../../../.generated/card-build.json';

declare const HTMLRewriter: any;

export async function onRequest(ctx: any): Promise<Response> {
  const res: Response = await ctx.next();
  const request: Request = ctx.request;
  if (res.status !== 200 || (request.method !== 'GET' && request.method !== 'HEAD')) return res;
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) return res;

  const url = new URL(request.url);
  const pair = parseSharePath(url.pathname);
  if (!pair) return res;
  const state = parseState(url.search, dataset, url.pathname);
  if (state.hw !== pair.hw || state.model !== pair.model) return res;
  const q = cardQuery(state, dataset);
  const view = q ? cardView(state, dataset) : null;
  if (!q || !view) return res;

  const site = String(dataset.defaults.site_url).replace(/\/$/, '');
  const image = `${site}/card/${state.hw}/${state.model}.png?${q}&v=${build.version}`;
  const title = `${view.verdict.headline} — Sunk Cost`;
  const description = `${view.configLine} · ${view.usageLine}. Whether buying it beats renting the same model by the token, and how long that takes.`;
  const set = (value: string) => ({ element: (e: any) => e.setAttribute('content', value) });
  return new HTMLRewriter()
    .on('meta[property="og:image"]', set(image))
    .on('meta[name="twitter:image"]', set(image))
    .on('meta[property="og:title"]', set(title))
    .on('meta[name="twitter:title"]', set(title))
    .on('meta[property="og:description"]', set(description))
    .on('meta[name="twitter:description"]', set(description))
    .on('meta[property="og:image:alt"]', set(`${view.verdict.headline} ${view.configLine} · ${view.usageLine}`))
    .transform(res);
}
