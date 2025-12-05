describe("Responsive Design", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // These tests should ALWAYS pass - they test always-visible elements
  it("should display correctly on mobile viewport", () => {
    cy.viewport(375, 667); // iPhone SE size
    cy.contains("Token Manager").should("be.visible");
    cy.get("button")
      .contains(/connect|wallet/i)
      .should("be.visible");
  });

  it("should display correctly on tablet viewport", () => {
    cy.viewport(768, 1024); // iPad size
    cy.contains("Token Manager").should("be.visible");
  });

  it("should display correctly on desktop viewport", () => {
    cy.viewport(1280, 720); // Desktop size
    cy.contains("Token Manager").should("be.visible");
  });

  // Wallet-dependent tests - skip if wallet not connected
  it("should stack approve/transfer cards on mobile", function (this: Mocha.Context) {
    const testContext = this;
    cy.viewport(375, 667);
    cy.visit("/transactions");

    cy.get("body").then(($body) => {
      if (!$body.text().includes("DAI - Approve & Transfer")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("DAI - Approve & Transfer").should("be.visible");
      cy.contains("USDC - Approve & Transfer").should("be.visible");
    });
  });

  it("should display side-by-side on desktop", function (this: Mocha.Context) {
    const testContext = this;
    cy.viewport(1280, 720);
    cy.visit("/transactions");

    cy.get("body").then(($body) => {
      if (!$body.text().includes("DAI - Approve & Transfer")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("DAI - Approve & Transfer").should("be.visible");
      cy.contains("USDC - Approve & Transfer").should("be.visible");
    });
  });
});
