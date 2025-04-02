import { Test } from "@prisma/client";

import { prisma } from "~/db.server";

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

export class JiraService {
  private config: JiraConfig;

  constructor(config: Partial<JiraConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async getBoards(): Promise<JiraBoard[]> {
    // In a real-world scenario, we'd store boards in the database
    // For now, we're using hardcoded values as a placeholder
    return [
      { id: "1", key: "FLAKE", name: "Flaky Tests" },
      { id: "2", key: "BUG", name: "Bug Tracking" },
      { id: "3", key: "FRONTEND", name: "Frontend Development" },
      { id: "4", key: "BACKEND", name: "Backend Development" },
      { id: "5", key: "API", name: "API Development" },
      { id: "6", key: "ADMIN", name: "Admin Portal" },
      { id: "7", key: "QA", name: "Quality Assurance" },
    ];
  }

  async getTicket(testId: string): Promise<JiraTicket | null> {
    // Find the test to get its JIRA ticket information
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (
      !test ||
      !test.jiraTicketId ||
      !test.jiraTicketKey ||
      !test.jiraTicketUrl
    ) {
      return null;
    }

    // Construct the ticket from the test data
    return {
      id: test.jiraTicketId,
      key: test.jiraTicketKey,
      summary: `Fix test: ${test.name}`,
      description: `Test ${test.name} needs attention`,
      status: "Open",
      url: test.jiraTicketUrl,
    };
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

    const ticketId = `1000${Math.floor(Math.random() * 1000)}`;
    const ticketKey = `${board}-${Math.floor(Math.random() * 100)}`;
    const ticketUrl = `https://your-domain.atlassian.net/browse/${ticketKey}`;

    // Create a new ticket and update the test in the database
    const newTicket: JiraTicket = {
      id: ticketId,
      key: ticketKey,
      summary,
      description,
      status: "Open",
      url: ticketUrl,
    };

    // Update the test with the JIRA ticket information
    await prisma.test.update({
      where: { id: test.id },
      data: {
        jiraTicketId: ticketId,
        jiraTicketKey: ticketKey,
        jiraTicketUrl: ticketUrl,
      },
    });

    return newTicket;
  }
}

export function getJiraService(config: Partial<JiraConfig> = {}): JiraService {
  return new JiraService(config);
}
