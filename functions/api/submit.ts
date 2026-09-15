/**
 * POST /api/submit — records the numbers someone entered (a custom machine, a measured speed, a
 * monthly bill) in the SUBMISSIONS D1 database. Stores no IP address, cookie or identifier: only
 * the checked settings, what the site showed for them, and the country Cloudflare reports.
 */
import { SUBMISSIONS_SCHEMA, SUBMISSION_COLUMNS, submissionRow } from '../../src/submissions';
import { dataset } from '../../src/dataset';

// only the site's own pages post here
const ALLOWED_ORIGIN = /^(https:\/\/(www\.)?sunkcost\.ai|https:\/\/([a-z0-9-]+\.)?sunkcost\.pages\.dev|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

let ready: Promise<unknown> | null = null;

export async function onRequestPost(ctx: any): Promise<Response> {
  const request: Request = ctx.request;
  if (!ALLOWED_ORIGIN.test(request.headers.get('origin') ?? '')) return new Response(null, { status: 403 });
  const text = await request.text();
  if (text.length > 4000) return new Response(null, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const row = submissionRow(body, dataset);
  if (!row) return new Response(null, { status: 422 });

  const db = ctx.env.SUBMISSIONS;
  if (!db) return new Response(null, { status: 503 });
  ready ??= db.prepare(SUBMISSIONS_SCHEMA).run().catch((e: unknown) => {
    ready = null;
    throw e;
  });
  await ready;
  const columns = [...SUBMISSION_COLUMNS, 'country'];
  const values = [...SUBMISSION_COLUMNS.map((c) => row[c]), (request as any).cf?.country ?? null];
  await db.prepare(`INSERT INTO submissions (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).bind(...values).run();
  return new Response(null, { status: 204 });
}
