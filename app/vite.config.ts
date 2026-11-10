/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  // Runes in `.svelte.ts` modules need the client runtime under vitest too
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
