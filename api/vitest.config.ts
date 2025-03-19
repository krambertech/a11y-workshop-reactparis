/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    // Use node environment for API tests
    environment: "node",
    // Don't need DOM/CSS for API tests
    exclude: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    include: ["api/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
  },
});
