import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  deps: {
    neverBundle: true,
  },
  dts: true,
  sourcemap: false,
  clean: true,
  minify: true,
})
