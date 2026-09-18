import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import models from '../data/models.json';
import throughput from '../data/throughput.json';

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const ledger = read('seo/MODEL-WATCH.md');
const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };

describe('the daily model watch', () => {
  it('says when it last ran, in a date the script can read', () => {
    const at = ledger.match(/^Last checked:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
    expect(at).toBeDefined();
    expect(Number.isNaN(Date.parse(at!))).toBe(false);
    // a date in the future would make the watch look done when it is not
    expect(Date.parse(at!)).toBeLessThanOrEqual(Date.now() + 24 * 60 * 60 * 1000);
  });

  it('is runnable by the command it tells you to run', () => {
    expect(pkg.scripts['model-watch']).toBe('tsx scripts/model-watch.ts');
    expect(ledger).toContain('npm run model-watch');
    expect(read('scripts/model-watch.ts')).toContain('MODEL-WATCH.md');
  });

  it('asks for fields the data actually has', () => {
    // every field named in the ledger's table of what a new model needs
    const named = [...ledger.matchAll(/^\| `([a-z0-9_, `]+)` \|/gm)]
      .flatMap((m) => m[1].split(/`?,\s*`?/))
      .map((f) => f.trim());
    expect(named.length).toBeGreaterThan(5);
    for (const field of named) for (const m of models) expect(m).toHaveProperty(field);
  });

  it('is right that a model can be added without a measured speed', () => {
    const measured = new Set(throughput.map((t) => t.model_id));
    const current = models.filter((m) => m.generation !== 'legacy');
    expect(current.filter((m) => !measured.has(m.id)).length).toBeGreaterThan(0);
  });

  it('never tells the agent to write the data itself', () => {
    expect(ledger).toContain('does not edit `data/*.json`');
    expect(read('scripts/model-watch.ts')).not.toMatch(/writeFileSync|writeFile\(/);
  });
});
