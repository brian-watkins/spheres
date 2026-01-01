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
    sourcePath(filePath, info) {
      const startIndex = info.distFile?.indexOf("src/") ?? -1
      if (startIndex > -1) {
        return info.distFile!.substring(startIndex)
      }
      return filePath
    },
    clean: true
  }),
  failFast: true,
  viteConfig: "./behaviors/vite.config.js"
})