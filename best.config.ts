import { defineConfig, MonocartCoverageReporter } from "best-behavior";

export default defineConfig({
  behaviorGlobs: [
    "./behaviors/**/*.behavior.ts"
  ],
  browserBehaviors: {
    globs: [
      "**/store/*",
      "**/vdom/*"
    ]
  },
  coverageReporter: new MonocartCoverageReporter({
    reports: [
      "v8",
      "text"
    ],
    entryFilter: (entry) => {
      return entry.url.includes("src") && !entry.url.includes("node_modules")
    },
    clean: true
  }),
  failFast: true,
  viteConfig: "./behaviors/vite.config.js"
})