import { defineConfig } from "best-behavior/config";

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