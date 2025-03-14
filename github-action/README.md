# Cypress Test Runner with Flake Suppression

This GitHub Action runs Cypress tests while automatically suppressing flaky tests identified by your dashboard.

## Features

- Integrates with the official [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- Automatically excludes flaky tests based on your flaky test dashboard data
- Reports test results back to the dashboard

## Usage

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run with flake suppression
        uses: your-org/flake-manager@v1
        with:
          dashboard-url: "https://your-flake-dashboard.example.com"
          api-key: ${{ secrets.FLAKE_DASHBOARD_API_KEY }}
          spec: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"
          browser: "chrome"
          # Additional Cypress GitHub Action parameters
          working-directory: "."
          build: "npm run build"
          start: "npm start"
```

## Inputs

### Required inputs

| Name            | Description                                   |
| --------------- | --------------------------------------------- |
| `dashboard-url` | URL to the flaky test dashboard API           |
| `api-key`       | API key for authenticating with the dashboard |

### Optional inputs

| Name       | Description                      | Default                               |
| ---------- | -------------------------------- | ------------------------------------- |
| `spec`     | Cypress spec pattern to run      | `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}` |
| `browser`  | Browser to run tests in          | `chrome`                              |
| `record`   | Whether to record test results   | `false`                               |
| `parallel` | Whether to run tests in parallel | `false`                               |

Plus all inputs from the [Cypress GitHub Action](https://github.com/cypress-io/github-action).

## Development

### Prerequisites

- Node.js v18+
- npm v8+

### Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   cd github-action
   npm install
   ```

3. Build the TypeScript files:
   ```bash
   npm run build
   ```

### Project Structure

- `src/filter-specs.ts` - Script to fetch flaky tests and filter the spec pattern
- `src/report-results.ts` - Script to report test results back to the dashboard
- `src/types.ts` - Common TypeScript types
- `src/index.ts` - Main entry point (not used directly)

### Dashboard API

This action expects your dashboard to have the following API endpoints:

- `GET /api/flaky-tests` - Returns a list of flaky tests for a repository
- `POST /api/test-results` - Accepts test results for a run

See the TypeScript types for the expected data format.

## License

MIT
