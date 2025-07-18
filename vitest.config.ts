/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/firebase-config.ts', // Exclude Firebase config from coverage
        'src/constants.ts', // Exclude constants from coverage
      ],
    },
    // Mock Firebase modules globally
    deps: {
      inline: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore', '@firebase/storage']
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
