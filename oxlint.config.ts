import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["import"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_+$",
        varsIgnorePattern: "^_+$",
        caughtErrorsIgnorePattern: "^_+$",
        destructuredArrayIgnorePattern: "^_+$",
      },
    ],
    "no-fallthrough": "error",
    "import/no-cycle": "error",
  },
})
