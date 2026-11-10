import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config'
import js from '@eslint/js'
import ts from 'typescript-eslint'
// import next from 'eslint-config-next'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  // Capacitor copies the built web app here. It's only ignored by the nested
  // android/.gitignore, which includeIgnoreFile (root .gitignore only) doesn't see.
  globalIgnores(['packages/app/android/app/src/main/assets/public/**']),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    // The actor's `consistent-type-assertions` disables say why each cast is safe; the rule is
    // not on, but they stay as the record of it.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    rules: {
      // A name starting with `_` is unused on purpose: a rest sibling that drops a field, a
      // parameter a signature requires, a type-level check that only has to compile.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Every `URLSearchParams` and `Date` here is built and read in one expression, never kept
      // as state; the maps that are state use `SvelteMap` by hand.
      'svelte/prefer-svelte-reactivity': 'off',
      // Yield-less generators are deliberate: the actor dispatches on generator vs plain
      // function, and a stream that ends at once, `refusedStream` or a test's system, must still
      // be an AsyncGenerator.
      'require-yield': 'off',
      'no-void': 'warn',
      // `{}` is the empty default of a generic (`S extends object = {}`), the no-extra-fields branch
      // of a conditional type, and the body of an interface that names an `Observable`.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    // Tests check types as much as behaviour: a bare `result.meta` under `@ts-expect-error`, a fake
    // cast `as any`, a counter or parameter kept so a system has the right shape.
    files: ['**/*.test.ts', '**/__tests__/**', 'packages/sync/test/**'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
])
