import { defineConfig } from "best-behavior";

export default defineConfig({
  behaviorGlobs: [
    "./behaviors/**/*.behavior.ts"
  ],
  browserBehaviors: {
    globs: [
      "**/cells/formula/**/*"
    ]
  },
  failFast: true
})