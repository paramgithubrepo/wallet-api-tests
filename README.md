<!-- README.md -->

> This project is not actively maintained. Please fork it instead of submitting PRs.

# Wallet API Test Suite

## Overview

This repository contains an automated test suite for the Wallet API (handling multi‐currency wallet transactions). It includes two flavors of end-to-end tests built with Cypress:

1. **Prism-backed tests** (`walletTransaction_prism.cy.js`), exercising the OpenAPI mock server with `x-prism-status` examples
2. **`cy.intercept`-backed tests** (`walletTransaction_intercept.cy.js`), mocking responses directly in the browser

> **Note:** The real API endpoints and login credentials were not provided. To fully validate functionality, tests are executed against a Prism mock server **and** via `cy.intercept` mocks.

Both suites cover positive, negative, and edge cases against the same OpenAPI spec.

---

## Prerequisites

- **Node.js** ≥ 16
- **npm** or **yarn**
- **Cypress** v12.0.0
- **Prism** (OpenAPI mock server)
- **cypress-mochawesome-reporter** for HTML reporting

---

## Installation

```bash
git clone <repo-url>
cd wallet-api-tests
npm install
```

(Optional) Globally install Prism:

```bash
npm install -g @stoplight/prism-cli
```

---

## Project Structure

```
.
├── walletApi.json               # OpenAPI spec with x-prism-status mocks
├── cypress.config.js            # Default Cypress configuration
├── cypress.config.dev.js        # Development environment config
├── cypress.config.staging.js    # Staging environment config
├── cypress.config.prod.js       # Production environment config
├── package.json                 # Project dependencies and scripts
├── README.md
├── TESTPLAN.md
└── cypress
    ├── fixtures
    │   ├── testdata.json        # Input payloads & IDs
    │   └── walletMocks.json     # Mock responses for intercept tests
    ├── schemas
    │   ├── transaction.json     # Success schema
    │   └── error.json           # Error schema
    ├── reports/                 # Generated test reports
    │   ├── html/                # HTML reports from cypress-mochawesome-reporter
    │   ├── screenshots/         # Test failure screenshots
    │   └── videos/              # Test execution videos
    ├── e2e
    │   └── api
    │       ├── walletTransaction_prism.cy.js       # Prism-based tests
    │       └── walletTransaction_intercept.cy.js   # cy.intercept tests
    └── support
        └── commands.js           # Custom Cypress commands
```

---

## Configuration

All key settings live in `cypress.config.js`:

```js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:4010", // Prism mock server
    env: {
      apiKey: "test-api-key",
      mock: false, // default: Prism mode
    },
    // reporter, plugins, etc…
  },
});
```

- **`mock=false`** (default) → Cypress will prepend `baseUrl` and issue real HTTP requests (to Prism).
- **`mock=true`** → Cypress will skip `baseUrl` and use `cy.intercept` aliases only (no real HTTP).

---

## Running the Mock Server

Start the Prism mock server (on port 4010 by default):

```bash
npx prism mock walletApi.json
```

---

## Running Tests

### Environment-Specific Testing

The project can support multiple environments with dedicated configuration files:

```bash
# Development environment
npm run test:dev
npm run open:dev           # Interactive mode
npm run report:dev         # With HTML report

# Staging environment
npm run test:staging
npm run open:staging       # Interactive mode
npm run report:staging     # With HTML report

# Production environment
npm run test:prod
npm run open:prod          # Interactive mode

# Default environment
npm test                   # Uses default cypress.config.js
npm run report            # With HTML report
```

---

## Test Reports

### HTML Reports with Cypress Mochawesome Reporter

The test suite uses `cypress-mochawesome-reporter` for generating comprehensive HTML reports:

```bash
# Generate HTML report with npm script
npm run report

# Or run directly with reporter
cypress run --reporter cypress-mochawesome-reporter
```

**Environment-specific reporting:**

```bash
# Development environment
npm run report:dev

# Staging environment
npm run report:staging
```

### Report Features

Generated reports include:

- **Test execution summary** with pass/fail statistics and duration
- **Detailed test case results** with step-by-step execution
- **Screenshots** of failed tests automatically captured
- **Error stack traces** for debugging failed assertions
- **Interactive HTML format** for easy navigation and filtering
- **Execution timeline** and performance metrics

### Report Location

Reports are generated in `cypress/reports/` directory:

```
cypress/reports/
├── html/
│   ├── index.html           # Main report file
│   └── assets/              # CSS, JS, and image assets
├── screenshots/             # Failure screenshots
└── videos/                  # Test execution videos
```

### Custom Report Configuration

The reporter is configured in `cypress.config.js`:

```js
module.exports = defineConfig({
  e2e: {
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      charts: true,
      reportPageTitle: "Wallet API Test Report",
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
    },
  },
});
```

---

## GitHub Workflow Enhancements

### Automated CI/CD Pipeline

The repository uses GitHub Actions for continuous integration with the actual workflow:

#### `.github/workflows/api-tests.yml`

```yaml
name: API Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  cypress-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run API Tests
        run: npm test

      - name: Upload Test Report
        uses: actions/upload-artifact@v3
        with:
          name: cypress-report
          path: cypress/reports
```

### Branch Protection Rules

Recommended branch protection settings:

- **Require status checks** before merging
- **Require branches to be up to date** before merging
- **Require pull request reviews** (minimum 1 reviewer)
- **Dismiss stale reviews** when new commits are pushed
- **Restrict push access** to administrators only

## Key Commands

- **Login (optional)**

  ```js
  cy.login();
  ```

  Reads credentials from `testdata.json` and stores JWT in `Cypress.env('token')`.

- **API Request**

  ```js
  cy.apiRequest(method, endpoint, body?, tokenOverride?, mockAlias?)
  ```

  Wraps either a real `cy.request` (Prism mode) or `cy.wait(@alias)` in intercept mode.

- **Schema Validation**
  ```js
  cy.validateSchema(responseBody, schemaName);
  ```
  Validates against JSON schema in `cypress/schemas`.

---

## LLM Disclosure

### AI-Assisted Development

This project utilized Large Language Models (LLMs) during development for the following purposes:

#### Code Generation

- **Test case scaffolding**: Generated initial test structure and boilerplate code
- **Configuration files**: Created Cypress configuration and GitHub workflow templates
- **Documentation**: Generated initial README structure and API documentation

#### Documentation Enhancement

- **README improvements**: Enhanced documentation clarity and completeness
- **Code comments**: Added explanatory comments for complex test logic
- **User guides**: Created comprehensive setup and usage instructions

### Human Oversight

All LLM-generated content has been:

- **Reviewed** by human developers for accuracy and relevance
- **Tested** in actual development environments
- **Customized** to meet specific project requirements
- **Validated** against real API specifications

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the full test suite
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow existing code style and conventions
- Add appropriate test coverage for new features
- Update documentation for any API changes
- Ensure all GitHub Actions workflows pass

---

## Assumptions & Notes

- Authentication is **mocked**—we use a static JWT in fixtures.
- All test data is externalized in **fixtures** for maintainability.
- JSON schemas validate both **success** (`transaction.json`) and **error** (`error.json`) payloads.
- The suite runs in two modes (Prism vs. intercept) controlled by `--env mock`.
- This README documents LLM assistance used during development for transparency.
- GitHub workflows are designed for enterprise-grade CI/CD requirements.

---
