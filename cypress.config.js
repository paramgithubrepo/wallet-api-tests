const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // This is the default configuration for Prism API tests
    // can be overriden like npx cypress run --spec cypress/e2e/api/walletTransaction_prism.cy.js --config baseUrl=https://api.example.com
    baseUrl: "http://127.0.0.1:4010",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      reportDir: "cypress/reports",
      charts: true,
      reportPageTitle: "API Test Report",
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    video: false,
  },
  env: {
    apiKey: "test-api-key",
    mock: false, // PRISM mode can be overridden via CLI: --env mock=true for cy.intercept() tests
  },
});
