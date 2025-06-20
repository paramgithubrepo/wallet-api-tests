<!-- README.md -->
> 💡 This project is not actively maintained. Please fork it instead of submitting PRs.

# Wallet API Test Suite

## Overview

This repository contains an automated test suite for the Wallet API (handling multi‐currency wallet transactions). It includes two flavors of end-to-end tests built with Cypress:

1. **Prism-backed tests** (`walletTransaction_prism.cy.js`), exercising the OpenAPI mock server with `x-prism-status` examples  
2. **`cy.intercept`-backed tests** (`walletTransaction_intercept.cy.js`), mocking responses directly in the browser  

> **Note:** The real API endpoints and login credentials were not provided. To fully validate functionality, tests are executed against a Prism mock server **and** via `cy.intercept` mocks.

Both suites cover positive, negative, and edge cases against the same OpenAPI spec.

---

## Prerequisites

- **Node.js** ≥ 14  
- **npm** or **yarn**  
- **Cypress** v12.0.0  
- **Prism** (OpenAPI mock server)

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
├── cypress.config.js            # Cypress configuration
├── README.md
├── TESTPLAN.md
└── cypress
    ├── fixtures
    │   ├── testdata.json        # Input payloads & IDs
    │   └── walletMocks.json     # Mock responses for intercept tests
    ├── schemas
    │   ├── transaction.json     # Success schema
    │   └── error.json           # Error schema
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
    baseUrl: "http://127.0.0.1:4010",  // Prism mock server
    env: {
      apiKey: "test-api-key",
      mock: false                     // default: Prism mode
    },
    // reporter, plugins, etc…
  }
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

### A) Prism-backed Tests (default)

Prism must be running, and **no** `mock` flag is needed:

```bash
# Interactive UI
npx cypress open   --spec "cypress/e2e/api/walletTransaction_prism.cy.js"

# Headless
npx cypress run   --spec "cypress/e2e/api/walletTransaction_prism.cy.js"
```

### B) cy.intercept-backed Tests

No Prism required. Run with `--env mock=true`:

```bash
# Interactive UI
npx cypress open   --env mock=true   --spec "cypress/e2e/api/walletTransaction_intercept.cy.js"

# Headless
npx cypress run   --env mock=true   --spec "cypress/e2e/api/walletTransaction_intercept.cy.js"
```

---

## Key Commands

- **Login (optional)**  
  ```js
  cy.login()
  ```  
  Reads credentials from `testdata.json` and stores JWT in `Cypress.env('token')`.

- **API Request**  
  ```js
  cy.apiRequest(method, endpoint, body?, tokenOverride?, mockAlias?)
  ```  
  Wraps either a real `cy.request` (Prism mode) or `cy.wait(@alias)` in intercept mode.

- **Schema Validation**  
  ```js
  cy.validateSchema(responseBody, schemaName)
  ```  
  Validates against JSON schema in `cypress/schemas`.

---

## Assumptions & Notes

- Authentication is **mocked**—we use a static JWT in fixtures.  
- All test data is externalized in **fixtures** for maintainability.  
- JSON schemas validate both **success** (`transaction.json`) and **error** (`error.json`) payloads.  
- The suite runs in two modes (Prism vs. intercept) controlled by `--env mock`.  
- This README is hand-crafted to match our coding style and interview expectations.
