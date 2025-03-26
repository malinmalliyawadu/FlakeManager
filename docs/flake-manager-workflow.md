# Flake Manager Workflow

This diagram visualizes how Flake Manager integrates with GitHub Actions workflows to exclude flaky Cypress tests from CI runs.

## CI Integration Flow

```mermaid
flowchart LR
    %% GitHub Actions CI process
    subgraph "GitHub Actions CI"
        start[Start CI Workflow]
        getExclusions[API Call to Get Tests to Exclude]
        configGrep[Configure cypress-grep]
        runTests[Run Cypress Tests]

        start --> getExclusions
        getExclusions --> configGrep
        configGrep --> runTests
    end

    %% Flake Manager application
    subgraph "Flake Manager"
        api[API Endpoint\n/api/excluded-tests]
        service[Cypress Service]
        db[(Database)]
        calc[Calculate Exclusions\nBased on Thresholds]

        api --> service
        service --> db
        db --> calc
        calc --> response[Return Tests to Exclude]
    end

    %% Cypress Data Extract API
    subgraph "Cypress Data Extract API"
        cypressAPI[Cypress API]
        testHistory[Historical Test Runs]
        flakeAnalysis[Calculate Flake/Failure Rates]

        cypressAPI --> testHistory
        testHistory --> flakeAnalysis
    end

    %% Flow between systems
    getExclusions --> api
    response --> configGrep
    service --> cypressAPI

    %% Styling - adjusted for dark mode readability
    classDef ghactions fill:#4a235a,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef flakemanager fill:#1a5276,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef cypress fill:#0e6655,stroke:#ffffff,stroke-width:2px,color:#ffffff

    class start,getExclusions,configGrep,runTests ghactions
    class api,service,calc,response flakemanager
    class cypressAPI,testHistory,flakeAnalysis cypress
```

## Manual Test Management Flow

```mermaid
flowchart LR
    %% UI operations
    subgraph "Manual Operations"
        ui[Flake Manager Dashboard]
        view[View Test Details]
        toggle[Toggle Test Inclusion/Exclusion]
        createTicket[Create JIRA Ticket]

        ui --> view
        view --> toggle
        view --> createTicket
    end

    %% Backend services
    subgraph "Flake Manager Backend"
        dbService[Database Service]
        jiraIntegration[JIRA Integration]
    end

    %% External integrations
    subgraph "External APIs"
        jiraAPI[JIRA API]
        cypressAPI[Cypress Data Extract API]
    end

    %% Flow connections
    toggle --> dbService
    createTicket --> jiraIntegration
    jiraIntegration --> jiraAPI
    dbService <--> cypressAPI

    %% Styling - adjusted for dark mode readability
    classDef manual fill:#4a235a,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef backend fill:#1a5276,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef external fill:#0e6655,stroke:#ffffff,stroke-width:2px,color:#ffffff

    class ui,view,toggle,createTicket manual
    class dbService,jiraIntegration backend
    class jiraAPI,cypressAPI external
```

## How It Works

### Automated Test Exclusion Process

1. **GitHub Actions Workflow** initiates a CI run
2. The workflow makes an API call to Flake Manager's `/api/excluded-tests` endpoint
3. **Flake Manager**:
   - Gets repository settings with configured thresholds
   - Queries the Cypress Data Extract API for historical test data
   - Calculates which tests exceed flake/failure thresholds
   - Respects any manual overrides set by users
   - Returns a list of test names that should be excluded
4. **GitHub Actions**:
   - Configures cypress-grep with the test names to exclude
   - Runs Cypress tests, skipping the problematic tests

### Manual Test Management Process

1. **Teams use the Flake Manager UI** to:
   - View flaky test metrics and status
   - Manually override exclusion decisions when needed
   - Create JIRA tickets for tests that need developer attention
2. **When overrides happen**:
   - Test exclusion status is stored in the database
   - Future CI runs will respect these manual decisions
   - JIRA tickets can be automatically linked to tests

This approach lets you maintain stable CI pipelines while systematically addressing flaky tests.
