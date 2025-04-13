import { MonocartCoverageReporter } from "best-behavior/coverage"
import { defineConfig } from "best-behavior/run"

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
    all: {
      dir: [ "./src" ],
      filter: {
        "**/src/view/htmlElements.ts": false,
        "**/src/view/specialAttributes.ts": false,
        "**/src/view/svgElements.ts": false,
        "**/*": true
      }
    },
    entryFilter: (entry) => {
      return entry.url.includes("src") && !entry.url.includes("node_modules")
    },
    clean: true
  }),
  failFast: true,
  viteConfig: "./behaviors/vite.config.js"
})