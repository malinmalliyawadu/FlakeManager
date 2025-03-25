# <div align="center">❄️ Flake Manager</div>

<div align="center">
  <p><strong>Automated flaky test management for Cypress test suites</strong></p>
</div>

## 📋 Overview

Flake Manager is a professional, Remix-based solution that helps QA teams and developers maintain reliable test suites by identifying and managing flaky Cypress tests. With configurable thresholds and automatic exclusion capabilities, it ensures your CI pipeline is protected from unnecessary failures while giving you the visibility needed to address test reliability issues systematically.

## ✨ Features

- **Interactive Dashboard** - Monitor flaky tests with detailed metrics and insights
- **Configurable Thresholds** - Set custom flake and failure rate thresholds for automatic test exclusion
- **Manual Override Controls** - Flexibility to manually include/exclude tests as needed
- **REST API** - Integrate with CI/CD pipelines via a robust API for test status retrieval
- **JIRA Integration** - Automatically create tickets for flaky tests that exceed thresholds
- **Repository Management** - Handle multiple test repositories from a single interface

## 🖼️ Screenshots

<div align="center">
  <img src="public/images/dashboard-screenshot.png" alt="Dashboard Screenshot" width="800"/>
  <p><em>The Flake Manager dashboard showing test metrics, thresholds, and test status</em></p>
</div>

<div align="center">
  <img src="public/images/threshold-config-screenshot.png" alt="Threshold Configuration" width="800"/>
  <p><em>Configuring custom flake and failure thresholds</em></p>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Optional: Database for production deployment

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

## 💻 Usage

### Dashboard

The main dashboard provides a comprehensive view of your test suite's health:

- **Test Statistics** - View overall metrics including total tests, excluded tests, and tests needing attention
- **Threshold Indicators** - Visual indicators of threshold status with recommendations
- **Test Table** - Detailed list of all tests with their metrics and status
- **Repository Selection** - Switch between different test repositories

### Thresholds Configuration

Configure the automatic exclusion thresholds to match your team's quality standards:

- **Flake Rate Threshold** - Tests with a flake rate above this percentage will be automatically excluded
- **Failure Rate Threshold** - Tests with a failure rate above this percentage will be automatically excluded
- **Threshold Recommendations** - Get intelligent recommendations based on industry best practices

### Test Management

For each test, you can:

- View detailed metrics and history
- Manually override automatic exclusion decisions
- Create JIRA tickets for tests requiring developer attention
- Add notes and context for team collaboration

## 🔌 API

### Get Tests

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
      "excluded": false,
      "jiraTicket": null
    }
    // Additional tests...
  ]
}
```

## 🔄 Cypress Data Extract API Integration

This application is designed to integrate with the [Cypress Data Extract API](https://docs.cypress.io/cloud/integrations/data-extract-api). In a production environment, you would:

1. Configure your Cypress Cloud API key in the environment variables
2. Use endpoints like "Flaky test details" to retrieve actual flaky test data
3. Store threshold configurations in a database

The current implementation uses static data for demonstration purposes.

## 🏗️ Project Structure

The main components of the application are:

- `app/routes/dashboard.tsx`: Main dashboard with test metrics
- `app/routes/thresholds.tsx`: Threshold configuration interface
- `app/routes/toggle.$testId.tsx`: Toggle test exclusion endpoint
- `app/routes/api.tests.tsx`: API endpoint for retrieving tests
- `app/services/cypress.server.ts`: Service for Cypress API interactions
- `app/types/cypress.ts`: Type definitions

## 🔮 Future Enhancements

- Complete Prisma database integration for persistent storage
- Authentication and authorization for multi-user environments
- Enhanced analytics with trend visualizations and predictive insights
- CI/CD pipeline integration plugins
- Team collaboration features with commenting and notifications

## 📄 License

This project is licensed under the MIT License.
