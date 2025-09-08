import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    includeSource: [
      "netlify/**/*.{js,ts,mts}",
      "src/**/*.{js,ts}",
    ],
  },
})
