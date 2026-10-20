import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    // Most of this suite is one assertion over every model, machine or pair in the
    // data, so each test gets slower every time a row is added, and the deploy runner
    // is slower than a laptop. Vitest's 5-second default failed the deploy of the 56th
    // model on a card test that takes 1.3 seconds here. The limit is here to catch a
    // test that has stopped terminating, not to budget the data.
    testTimeout: 30_000,
  },
});
