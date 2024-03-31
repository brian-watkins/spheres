import { defineConfig } from 'vite'
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "vite"
    ]
  },
  plugins: [
    tsConfigPaths()
  ]
})