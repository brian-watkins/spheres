import { defineConfig } from "best-behavior"

export default defineConfig({
  behaviorGlobs: [
    "renderBehaviors/**/*.behavior.ts",
    "behaviors/**/*.behavior.ts"
  ],
  browserBehaviors: {
    globs: [
      "renderBehaviors/**/*.behavior.ts"
    ]
  },
  viteConfig: "./behaviors/vite.config.js",
  failFast: true
})