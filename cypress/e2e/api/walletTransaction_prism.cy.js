// walletTransaction_prism.cy.js

describe("Wallet API Tests - POST and GET (PRISM)", () => {
  beforeEach(() => {
    cy.fixture("testdata").as("data");
  });

  it("TC01 - Valid credit transaction", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.validCredit,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq("finished");
      expect(res.body.outcome).to.eq("approved");
    });
  });

  it("TC02 - Valid debit transaction", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.validDebit,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq("finished");
      expect(res.body.outcome).to.eq("approved");
    });
  });

  it("TC03 - Invalid token", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.validCredit,
      "invalid-token"
    ).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("TC04 - Invalid currency", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.invalidCurrency,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC05 - Invalid amount string", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.invalidAmountString,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC06 - Negative amount", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.negativeAmount,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC07 - Invalid type", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.invalidType,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC08 - Missing amount", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.missingAmount,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC09 - Extra field in body", function () {
    cy.apiRequest(
      "POST",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction`,
      this.data.extraField,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("TC10 - GET transaction approved", function () {
    cy.apiRequest(
      "GET",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction/${this.data.approvedTransactionId}`,
      null,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq("finished");
      expect(res.body.outcome).to.eq("approved");
    });
  });

  it("TC11 - GET transaction denied", function () {
    cy.apiRequest(
      "GET",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction/${this.data.deniedTransactionId}`,
      null,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq("finished");
      expect(res.body.outcome).to.eq("denied");
    });
  });

  it("TC12 - GET transaction pending", function () {
    cy.apiRequest(
      "GET",
      `/challenge/api/v1/wallet/${this.data.walletId}/transaction/${this.data.pendingTransactionId}`,
      null,
      this.data.token
    ).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq("pending");
    });
  });
});
