import { defineConfig } from 'vite'
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  optimizeDeps: {
    entries: [
      "**/*.behavior.ts"
    ]
  },
  plugins: [
    tsConfigPaths()
  ]
})