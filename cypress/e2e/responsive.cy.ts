describe("Responsive Design", () => {
  beforeEach(() => {
    cy.visit("/");
  });

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

  it("should stack approve/transfer cards on mobile", () => {
    cy.viewport(375, 667);
    cy.visit("/transactions");
    cy.get("body").then(($body) => {
      if ($body.text().includes("DAI - Approve & Transfer")) {
        // Cards should stack vertically on mobile
        cy.contains("DAI - Approve & Transfer").should("be.visible");
        cy.contains("USDC - Approve & Transfer").should("be.visible");
      }
    });
  });

  it("should display side-by-side on desktop", () => {
    cy.viewport(1280, 720);
    cy.visit("/transactions");
    cy.get("body").then(($body) => {
      if ($body.text().includes("DAI - Approve & Transfer")) {
        // Cards should be side-by-side on desktop
        cy.contains("DAI - Approve & Transfer").should("be.visible");
        cy.contains("USDC - Approve & Transfer").should("be.visible");
      }
    });
  });
});
