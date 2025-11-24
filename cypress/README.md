# Cypress E2E Tests

This directory contains end-to-end tests for the Token Manager application.

## Test Structure

- `e2e/` - End-to-end test files
  - `home.cy.ts` - Tests for the home page (wallet connection, token balances, minting)
  - `navigation.cy.ts` - Tests for navigation between pages
  - `transactions.cy.ts` - Tests for the transactions page (approve, transfer, events)
  - `forms.cy.ts` - Tests for form validation
  - `responsive.cy.ts` - Tests for responsive design

- `support/` - Support files and custom commands
  - `e2e.ts` - Main support file
  - `commands.ts` - Custom Cypress commands

- `fixtures/` - Test data fixtures

## Running Tests

### Open Cypress Test Runner (Interactive)

```bash
npm run cypress:open
```

### Run Tests Headlessly

```bash
npm run cypress:run
```

### Run Tests in CI/CD

```bash
npm run e2e
```

## Prerequisites

1. Start the development server:

```bash
npm run dev
```

2. The app should be running on `http://localhost:3000`

## Test Coverage

The E2E tests cover the following key workflows:

1. **Home Page**
   - Page title and description display
   - Wallet connection button
   - Network warning display
   - Token balances section
   - Mint tokens section
   - Navigation to transactions page

2. **Navigation**
   - Navigation between home and transactions pages
   - Page state maintenance

3. **Transactions Page**
   - Page title and description
   - Approve and transfer sections
   - Form inputs
   - Event table display
   - Historical events loading

4. **Form Validation**
   - Button disabled states
   - Invalid address validation
   - Valid address acceptance
   - Amount input validation

5. **Responsive Design**
   - Mobile viewport (375x667)
   - Tablet viewport (768x1024)
   - Desktop viewport (1280x720)
   - Card layout on different screen sizes

## Notes

- These tests focus on UI interactions and do not require actual wallet connections
- Wallet-dependent features are tested conditionally (only when wallet UI elements are present)
- Tests use conditional checks to handle both connected and disconnected wallet states
