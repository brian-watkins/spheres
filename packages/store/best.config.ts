import { defineConfig } from "best-behavior";

export default defineConfig({
  behaviorGlobs: [
    "behaviors/**/*.behavior.ts"
  ],
  browserBehaviors: {
    globs: [
      "**/*"
    ]
  },
  failFast: true,
  viteConfig: "./behaviors/vite.config.js"
})