import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000", browserName: "chromium" },
  webServer: {
    command: "ENABLE_DEV_CATALOG=1 npm run dev",
    url: "http://localhost:3000/dev/dishes",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
