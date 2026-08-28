import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  forbidOnly: isCI,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      // The sandbox image ships Chromium at a fixed path and cannot use the
      // Chrome sandbox.
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  webServer: {
    // CI runs against a production build: closer to what ships, and it removes
    // the first-hit compile latency that makes dev-server runs flaky.
    command: isCI ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
