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
        ? "https://subs-savvy.pages.dev"
        : "http://localhost:5173",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer:
    dotenvConfig.NODE_ENV === "production"
      ? undefined
      : {
          command: "npm run start:dev",
          url: "http://localhost:5173",
          reuseExistingServer: !dotenvConfig.CI,
        },
});
