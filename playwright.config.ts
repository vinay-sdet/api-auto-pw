import "dotenv/config";
import { defineConfig } from "@playwright/test";
import { env } from "./config/env";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: env.baseUrl,
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    trace: "retain-on-failure",
  },
});