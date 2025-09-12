import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  envDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '..'), // Look for .env files in the parent directory (root)
})
