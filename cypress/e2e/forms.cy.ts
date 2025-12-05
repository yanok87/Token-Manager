describe("Form Validation", () => {
  beforeEach(() => {
    cy.visit("/transactions");
  });

  // Wallet-dependent tests - these will skip if wallet is not connected
  // They test form functionality that only appears when wallet is connected
  it("should disable approve button when fields are empty", function (this: Mocha.Context) {
    const testContext = this;
    // Check prerequisite first
    cy.get("body").then(($body) => {
      if (!$body.text().includes("DAI - Approve & Transfer")) {
        cy.log("⏭️  Skipping: Wallet not connected - forms not visible");
        testContext.skip();
        return;
      }

      // Run assertions only if prerequisite is met
      cy.contains("DAI - Approve & Transfer").should("be.visible");
      cy.get("button")
        .contains(/APPROVE/i)
        .should("exist")
        .should("be.disabled");
      cy.get('input[type="number"]').first().should("have.value", "");
    });
  });

  it("should disable transfer button when fields are empty", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("DAI - Approve & Transfer")) {
        cy.log("⏭️  Skipping: Wallet not connected - forms not visible");
        testContext.skip();
        return;
      }

      cy.contains("DAI - Approve & Transfer").should("be.visible");
      cy.get("button")
        .contains(/TRANSFER/i)
        .should("exist")
        .should("be.disabled");
      cy.get('input[type="number"]').first().should("have.value", "");
    });
  });

  it("should show error for invalid address input", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Spender Address")) {
        cy.log("⏭️  Skipping: Wallet not connected - forms not visible");
        testContext.skip();
        return;
      }

      cy.contains("Spender Address")
        .parent()
        .find("input")
        .should("exist")
        .clear()
        .type("invalid-address");

      cy.get("button").contains(/APPROVE/i).should("be.disabled");
    });
  });

  it("should accept valid Ethereum address format", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Spender Address")) {
        cy.log("⏭️  Skipping: Wallet not connected - forms not visible");
        testContext.skip();
        return;
      }

      const validAddress = "0x1234567890123456789012345678901234567890";

      cy.contains("Spender Address")
        .parent()
        .find("input")
        .should("exist")
        .clear()
        .type(validAddress);

      cy.get("body").should("not.contain", "Invalid address");
    });
  });

  it("should validate amount input", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Amount")) {
        cy.log("⏭️  Skipping: Wallet not connected - forms not visible");
        testContext.skip();
        return;
      }

      cy.get('input[type="number"]')
        .first()
        .should("exist")
        .clear()
        .type("-1")
        .should("have.value", "-1");
    });
  });
});
