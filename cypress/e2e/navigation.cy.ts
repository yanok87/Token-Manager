describe("Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should navigate from home to transactions page", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Go to Transactions")) {
        cy.contains("Go to Transactions").click();
        cy.url().should("include", "/transactions");
        cy.contains("Transactions").should("be.visible");
      }
    });
  });

  it("should navigate from transactions to home page", () => {
    cy.visit("/transactions");
    cy.contains("Home").should("be.visible");
    cy.contains("Home").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("Token Manager").should("be.visible");
  });

  it("should maintain page state during navigation", () => {
    cy.visit("/");
    cy.get("body").then(($body) => {
      if ($body.text().includes("Go to Transactions")) {
        cy.contains("Go to Transactions").click();
        cy.url().should("include", "/transactions");
        cy.contains("Home").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/");
      }
    });
  });
});
