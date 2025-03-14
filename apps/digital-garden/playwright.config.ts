import { defineConfig, devices } from "@playwright/test";
import dotenvConfig from "./dotenv.config";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: dotenvConfig.CI,
  retries: dotenvConfig.CI ? 2 : 0,
  workers: dotenvConfig.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    baseURL:
      dotenvConfig.NODE_ENV === "production"
        ? "https://vorant94.dev"
        : "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
      grep: [/@desktop/],
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12 Pro"] },
      grep: [/@mobile/],
    },
  ],
  webServer:
    dotenvConfig.NODE_ENV === "production"
      ? undefined
      : {
          command: "npm run start:dev",
          url: "http://localhost:4321",
          reuseExistingServer: !dotenvConfig.CI,
        },
});
