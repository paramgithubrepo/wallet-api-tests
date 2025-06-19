// cypress/e2e/api/login.cy.js

describe('Login API', () => {
  it('should log in and store token', () => {
    cy.login();
  });
});
