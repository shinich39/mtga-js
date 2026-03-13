import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",

  webServer: {
    command: "npx serve .",
    port: 3000,
    reuseExistingServer: true,
  },

  use: {
    baseURL: "http://localhost:3000",
  },
});
