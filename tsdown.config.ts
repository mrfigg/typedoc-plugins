import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  deps: {
    neverBundle: true,
  },
  dts: false,
  sourcemap: false,
  clean: true,
  minify: true,
})
