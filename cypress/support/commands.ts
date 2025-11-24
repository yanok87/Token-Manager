/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mock wallet connection state
       * @example cy.mockWalletConnection({ isConnected: true, address: '0x123...' })
       */
      mockWalletConnection(options: {
        isConnected: boolean;
        address?: string;
        chainId?: number;
      }): Chainable<void>;

      /**
       * Wait for wallet connection UI to appear
       */
      waitForWalletConnection(): Chainable<void>;

      /**
       * Check if element is visible and contains text
       */
      shouldBeVisibleWithText(text: string): Chainable<void>;
    }
  }
}

// Mock wallet connection by intercepting wagmi hooks
Cypress.Commands.add("mockWalletConnection", (options) => {
  const { isConnected, address, chainId = 11155111 } = options;

  // Intercept wagmi hooks by stubbing window.ethereum
  cy.window().then((win) => {
    // Mock ethereum provider
    win.ethereum = {
      isMetaMask: true,
      request: cy.stub().as("eth_request"),
      on: cy.stub(),
      removeListener: cy.stub(),
    } as any;
  });
});

Cypress.Commands.add("waitForWalletConnection", () => {
  cy.get('[data-testid="connect-button"], button:contains("Connect")', {
    timeout: 10000,
  }).should("be.visible");
});

Cypress.Commands.add("shouldBeVisibleWithText", (text: string) => {
  cy.contains(text).should("be.visible");
});

export {};
