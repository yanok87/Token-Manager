// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions from the application
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore certain errors that are expected in test environment
  // Return false to prevent Cypress from failing the test
  if (
    err.message.includes("ResizeObserver loop limit exceeded") ||
    err.message.includes("Non-Error promise rejection captured") ||
    err.message.includes("ChunkLoadError")
  ) {
    return false;
  }
  // For syntax errors, log them but don't fail silently
  if (err.message.includes("SyntaxError") || err.message.includes("Invalid")) {
    console.error("Application error detected:", err.message);
    // Return true to fail the test with the error
    return true;
  }
  // Let other errors fail the test normally
  return true;
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (
  app &&
  app.document &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}
