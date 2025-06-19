// cypress/e2e/api/userinfo.cy.js

describe("Users Info Endpoint", () => {
  before(() => {
    cy.login();
  });

  it("GET /user/info/:userId returns user info and validates schema", () => {
    const userId = Cypress.env("userId");
    // No mockAlias here, so apiRequest will hit the real (or Prism) server:
    cy.apiRequest("GET", `/challenge/api/v1/user/info/${userId}`)
      .then((res) => {
        expect(res.status).to.eq(200);
        cy.validateSchema(res.body, "userinfo");
      });
  });
});
