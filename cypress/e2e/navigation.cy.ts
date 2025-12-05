describe("Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // Wallet-dependent test
  it("should navigate from home to transactions page", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Go to Transactions")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("Go to Transactions").should("be.visible").click();
      cy.url().should("include", "/transactions");
      cy.contains("Transactions").should("be.visible");
    });
  });

  // This test should ALWAYS work - Home button is always visible
  it("should navigate from transactions to home page", () => {
    cy.visit("/transactions");
    cy.contains("Home").should("be.visible");
    cy.contains("Home").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("Token Manager").should("be.visible");
  });

  // Wallet-dependent test
  it("should maintain page state during navigation", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Go to Transactions")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("Go to Transactions").should("be.visible").click();
      cy.url().should("include", "/transactions");
      cy.contains("Home").should("be.visible").click();
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });
});
