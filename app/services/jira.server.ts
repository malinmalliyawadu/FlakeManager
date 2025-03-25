import { type Test } from "~/types/cypress";

interface JiraConfig {
  apiUrl: string;
  projectKey: string;
  username: string;
  apiToken: string;
}

interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  url: string;
}

export interface JiraBoard {
  id: string;
  key: string;
  name: string;
  description?: string;
}

// Default values for a static setup
const defaultConfig: JiraConfig = {
  apiUrl: "https://your-domain.atlassian.net/rest/api/3",
  projectKey: "FLAKE",
  username: "jira_user@example.com",
  apiToken: "your_api_token", // In production, this should be loaded from environment variables
};

// Sample boards for development purposes
const sampleBoards: JiraBoard[] = [
  { id: "1", key: "FLAKE", name: "Flaky Tests" },
  { id: "2", key: "BUG", name: "Bug Tracking" },
  { id: "3", key: "FRONTEND", name: "Frontend Development" },
  { id: "4", key: "BACKEND", name: "Backend Development" },
  { id: "5", key: "API", name: "API Development" },
  { id: "6", key: "ADMIN", name: "Admin Portal" },
  { id: "7", key: "QA", name: "Quality Assurance" },
];

// Mock data for development purposes
const sampleTickets: Record<string, JiraTicket> = {
  "4": {
    id: "10001",
    key: "FLAKE-1",
    summary: "Fix flaky test: should add item to cart",
    description: "This test exceeds the flake threshold (12% > 5%)",
    status: "Open",
    url: "https://your-domain.atlassian.net/browse/FLAKE-1",
  },
  "5": {
    id: "10002",
    key: "FLAKE-2",
    summary: "Fix failing test: should process payment",
    description: "This test exceeds the failure threshold (15% > 10%)",
    status: "Open",
    url: "https://your-domain.atlassian.net/browse/FLAKE-2",
  },
};

export class JiraService {
  private config: JiraConfig;

  constructor(config: Partial<JiraConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async getBoards(): Promise<JiraBoard[]> {
    // In a real implementation, this would make an API call to Jira
    return sampleBoards;
  }

  async getTicket(testId: string): Promise<JiraTicket | null> {
    // In a real implementation, this would make an API call to Jira
    return sampleTickets[testId] || null;
  }

  async createTicket(
    test: Test,
    repository: string,
    options: {
      board?: string;
      summary?: string;
      description?: string;
      isManualCreation?: boolean;
    } = {},
  ): Promise<JiraTicket> {
    const isFlaky = test.flakeRate > 5;
    const isFailing = test.failureRate > 10;
    const board = options.board || this.config.projectKey;

    // Default summary and description if not provided
    const summary =
      options.summary ||
      `${options.isManualCreation ? "[Manual] " : ""}${isFlaky ? "Fix flaky test" : isFailing ? "Fix failing test" : "Investigate test"}: ${test.name}`;

    const description =
      options.description ||
      `Test details:
- Name: ${test.name}
- File: ${test.file}
- Repository: ${repository}
- Flake rate: ${test.flakeRate}%
- Failure rate: ${test.failureRate}%
- Excluded from CI: ${test.excluded ? "Yes" : "No"}
- Board: ${board}

${isFlaky ? `This test exceeds the flake threshold (${test.flakeRate}% > 5%)` : ""}
${isFailing ? `This test exceeds the failure threshold (${test.failureRate}% > 10%)` : ""}
${options.isManualCreation ? "This ticket was manually created." : "This ticket was automatically created due to threshold violation."}`;

    // In a real implementation, this would make an API call to Jira
    // Mock implementation for development
    const newTicket: JiraTicket = {
      id: `1000${Object.keys(sampleTickets).length + 1}`,
      key: `${board}-${Object.keys(sampleTickets).length + 1}`,
      summary,
      description,
      status: "Open",
      url: `https://your-domain.atlassian.net/browse/${board}-${Object.keys(sampleTickets).length + 1}`,
    };

    // Store in mock data
    sampleTickets[test.id] = newTicket;

    return newTicket;
  }
}

export function getJiraService(config: Partial<JiraConfig> = {}): JiraService {
  return new JiraService(config);
}
