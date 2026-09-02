'use strict'

import { defineConfig } from 'eslint/config'
import eslintJs from '@eslint/js'
import eslintTs from 'typescript-eslint'

export default defineConfig({
  files: ['./src/**/*.{js,ts}'],
  extends: [eslintJs.configs.recommended, eslintTs.configs.recommended],
  languageOptions: {
    parser: eslintTs.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    curly: 'error',
  },
})
