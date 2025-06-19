// cypress/support/commands.js

// Import AJV for JSON schema validation and addFormats for format keywords (e.g., date-time)
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Enable support for formats like "date-time", "uuid", etc.

// -- LOGIN COMMAND --
// Logs in via the /user/login endpoint using credentials from testData fixture
// Stores returned JWT token and userId in Cypress.env for later reuse
Cypress.Commands.add("login", () => {
  cy.fixture("testData").then((data) => {
    cy.request({
      method: "POST",
      url: Cypress.env("baseUrl") + "/challenge/api/v1/user/login",
      headers: { "x-api-key": Cypress.env("apiKey") },
      body: {
        username: data.username,
        password: data.password,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      cy.validateSchema(res.body, "login");
      Cypress.env("token", res.body.token);
      Cypress.env("userId", res.body.userId);
    });
  });
});

// -- GENERIC API REQUEST COMMAND --
// Wraps cy.request or cy.wait(alias) depending on mock flag
//   - method:    HTTP method ("GET", "POST", etc.)
//   - endpoint:  path portion (e.g. "/wallet/…/transaction")
//   - body:      optional request payload
//   - token:     Bearer token string override
//   - mockAlias: alias for cy.intercept() (e.g. "@postCredit")
Cypress.Commands.add(
  "apiRequest",
  (method, endpoint, body, token, mockAlias = null) => {
    const isMock =
      Cypress.env("mock") === true || Cypress.env("mock") === "true";

    const baseUrl = Cypress.config("baseUrl") || "";
    const resolvedUrl = `${baseUrl}${endpoint}`;

    cy.log(`Mock Mode: ${isMock}`);
    cy.log(`Resolved URL: ${resolvedUrl}`);

    if (isMock && mockAlias) {
      // -- MOCK PATH --
      // Trigger a real window.fetch to activate the intercept() handler
      cy.window().then((win) => {
        return win.fetch(resolvedUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: method === "POST" ? JSON.stringify(body) : undefined,
        });
      });

      // Wait for the intercept alias, then wrap its response to mimic cy.request
      return cy.wait(mockAlias).then((interception) => {
        cy.log(
          "Intercepted response:",
          JSON.stringify(interception.response.body)
        );
        return cy.wrap({
          status: interception.response.statusCode,
          body: interception.response.body,
        });
      });
    }

    // -- REAL API PATH --
    // Directly send the HTTP request to the live service
    return cy.request({
      method,
      url: resolvedUrl,
      body,
      failOnStatusCode: false,
      headers: {
        Authorization: token || "",
      },
    });
  }
);

// -- SCHEMA VALIDATION COMMAND --
// Validates a response body against a JSON schema in cypress/schemas/<schemaName>.json
Cypress.Commands.add("validateSchema", (body, schemaName) => {
  const Ajv = require("ajv");
  const addFormats = require("ajv-formats");
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  cy.fixture(`schemas/${schemaName}.json`).then((schema) => {
    const validate = ajv.compile(schema);
    const valid = validate(body);
    if (!valid) {
      // Throw with full error detail if validation fails
      throw new Error(
        "Schema validation failed: " + JSON.stringify(validate.errors, null, 2)
      );
    }
  });
});
