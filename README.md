# Flake Manager

A Remix application for managing flaky tests in Cypress test automation suites.

## Features

- Dashboard for monitoring flaky tests
- Configuration of flake and failure thresholds
- Ability to manually include/exclude tests
- API endpoint for retrieving test status

## Overview

Flake Manager helps you maintain a reliable test suite by identifying and managing flaky Cypress tests. Tests with high flake rates or failure rates can be automatically excluded from your test runs based on configurable thresholds.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/flake-manager.git
   cd flake-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Dashboard

The main dashboard displays all tests with their flake and failure rates, as well as their current status (included or excluded). From here, you can:

- View test statistics
- Toggle test inclusion/exclusion
- Navigate to the thresholds configuration

### Thresholds Configuration

You can configure the automatic exclusion thresholds:

- **Flake Rate Threshold**: Tests with a flake rate above this percentage will be automatically excluded
- **Failure Rate Threshold**: Tests with a failure rate above this percentage will be automatically excluded

### API

#### Get Tests

```
GET /api/tests?repo={repository-name}
```

Optional query parameters:

- `flakeThreshold`: Custom flake rate threshold
- `failureThreshold`: Custom failure rate threshold

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "1",
      "name": "should load home page",
      "file": "home.spec.ts",
      "flakeRate": 1,
      "failureRate": 2,
      "excluded": false
    },
    ...
  ]
}
```

## Cypress Data Extract API Integration

This application is designed to integrate with the [Cypress Data Extract API](https://docs.cypress.io/cloud/integrations/data-extract-api). In a production environment, you would:

1. Configure your Cypress Cloud API key
2. Use endpoints like "Flaky test details" to retrieve actual flaky test data
3. Store threshold configurations in a database

The current implementation uses static data for demonstration purposes.

## Project Structure

The main components of the application are:

- `app/routes/flake-manager._index.tsx`: Main dashboard
- `app/routes/flake-manager.thresholds.tsx`: Threshold configuration
- `app/routes/flake-manager.toggle.$testId.tsx`: Toggle test exclusion endpoint
- `app/routes/api.tests.tsx`: API endpoint for retrieving tests
- `app/services/cypress.server.ts`: Service for Cypress API interactions
- `app/types/cypress.ts`: Type definitions

## Future Enhancements

- Complete Prisma database integration for persistent storage
- Authentication and authorization for multi-user environments
- Direct integration with Cypress Cloud API
- Historical trend analysis and charts

## License

This project is licensed under the MIT License.
