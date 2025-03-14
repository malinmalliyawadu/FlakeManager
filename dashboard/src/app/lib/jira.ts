import JiraClient from "jira-client";

// Initialize Jira client
// In a real app, these would be environment variables
const jira = new JiraClient({
  protocol: "https",
  host: process.env.JIRA_HOST || "your-domain.atlassian.net",
  username: process.env.JIRA_USERNAME || "your-email@example.com",
  password: process.env.JIRA_API_TOKEN || "your-api-token",
  apiVersion: "3",
  strictSSL: true,
});

interface JiraTicketParams {
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  labels: string[];
}

/**
 * Creates a Jira ticket for a flaky test
 */
export async function createJiraTicket(
  params: JiraTicketParams
): Promise<string> {
  try {
    const { summary, description, issueType, priority, labels } = params;

    // In a real app, you would get this from config
    const projectKey = process.env.JIRA_PROJECT_KEY || "FLAKE";

    const issue = await jira.addNewIssue({
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        description,
        issuetype: {
          name: issueType,
        },
        priority: {
          name: priority,
        },
        labels,
      },
    });

    return issue.key;
  } catch (error) {
    console.error("Error creating Jira ticket:", error);
    throw new Error("Failed to create Jira ticket");
  }
}
