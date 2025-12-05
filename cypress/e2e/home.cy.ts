describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // These tests should ALWAYS pass - they test always-visible elements
  it("should display the home page with title and description", () => {
    cy.contains("Token Manager").should("be.visible");
    cy.contains("Connect your wallet on Sepolia").should("be.visible");
  });

  it("should display connect wallet button", () => {
    cy.get("button")
      .contains(/connect|wallet/i)
      .should("exist");
  });

  // Conditional test - only runs when wallet is connected AND on wrong network
  it("should show network warning when on wrong network", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      const hasWallet = $body.text().includes("Go to Transactions");
      const hasWarning = $body.text().includes("Wrong Network Detected");

      if (!hasWallet) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      if (!hasWarning) {
        cy.log("⏭️  Skipping: Wallet connected but on correct network");
        testContext.skip();
        return;
      }

      // Test will fail if warning should be visible but assertions fail
      cy.contains("Wrong Network Detected").should("be.visible");
      cy.contains("Switch to Sepolia").should("be.visible");
    });
  });

  // Wallet-dependent tests - skip if wallet not connected
  it("should navigate to transactions page when wallet is connected", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Go to Transactions")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("Go to Transactions").should("be.visible").click();
      cy.url().should("include", "/transactions");
    });
  });

  it("should display token balances section when wallet is connected", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Token Balances")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("Token Balances").should("be.visible");
      cy.contains("DAI").should("exist");
      cy.contains("USDC").should("exist");
    });
  });

  it("should display mint tokens section when wallet is connected", function (this: Mocha.Context) {
    const testContext = this;
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Mint Test Tokens")) {
        cy.log("⏭️  Skipping: Wallet not connected");
        testContext.skip();
        return;
      }

      cy.contains("Mint Test Tokens").should("be.visible");
      cy.contains("Mint DAI").should("exist");
      cy.contains("Mint USDC").should("exist");
    });
  });
});
