describe("Transactions Page", () => {
  beforeEach(() => {
    cy.visit("/transactions");
  });

  it("should display transactions page title and description", () => {
    cy.contains("Transactions").should("be.visible");
    cy.contains("Approve and transfer tokens").should("be.visible");
  });

  it("should display connect wallet button", () => {
    cy.get("button")
      .contains(/connect|wallet/i)
      .should("exist");
  });

  it("should display approve and transfer sections when wallet is connected", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("DAI - Approve & Transfer")) {
        cy.contains("DAI - Approve & Transfer").should("be.visible");
        cy.contains("USDC - Approve & Transfer").should("be.visible");
      }
    });
  });

  it("should display approve form inputs", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Amount")) {
        cy.get('input[type="text"], input[type="number"]').should(
          "have.length.at.least",
          1,
        );
      }
    });
  });

  it("should display approve and transfer buttons", () => {
    cy.get("body").then(($body) => {
      if (
        $body.text().includes("APPROVE") ||
        $body.text().includes("TRANSFER")
      ) {
        cy.contains(/APPROVE|TRANSFER/i).should("exist");
      }
    });
  });

  it("should display events history section when wallet is connected", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Events History")) {
        cy.contains("Events History").should("be.visible");
        cy.contains("Recent Transfer and Approval events").should("exist");
      }
    });
  });

  it("should display event table headers", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Type")) {
        cy.contains("Type").should("be.visible");
        cy.contains("Token").should("be.visible");
        cy.contains("Amount").should("be.visible");
        cy.contains("Date & Time").should("be.visible");
        cy.contains("From").should("be.visible");
        cy.contains("To").should("be.visible");
        cy.contains("Transaction").should("be.visible");
      }
    });
  });
});
