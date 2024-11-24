import { defineConfig } from "best-behavior/run";

export default defineConfig({
  behaviorGlobs: [
    "./behaviors/**/*.behavior.ts"
  ],
  browserBehaviors: {
    globs: [
      "**/cells/formula/**/*"
    ]
  },
  parallel: true,
  failFast: true,
})