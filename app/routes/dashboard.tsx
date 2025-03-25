import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { TestsTable } from "~/components/dashboard/TestsTable";
import { ThresholdsCard } from "~/components/dashboard/ThresholdsCard";
import { PageHeader } from "~/components/page-header";
import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const jiraService = getJiraService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repositories = await cypressService.getRepositories();
  const repository = await cypressService.getRepository(selectedRepo);
  const tests = await cypressService.getTestsForRepo(selectedRepo);

  // Create Jira tickets for tests that exceed thresholds and don't have a ticket
  const flakeThreshold = repository?.flakeThreshold || 5;
  const failureThreshold = repository?.failureThreshold || 10;

  // This would be handled by a background job in production
  // In this demo, we'll check for tickets on page load
  for (const test of tests) {
    // If the test exceeds thresholds and doesn't have a ticket
    if (
      (test.flakeRate > flakeThreshold ||
        test.failureRate > failureThreshold) &&
      test.excluded &&
      !test.jiraTicket
    ) {
      // Check if there's an existing ticket
      const existingTicket = await jiraService.getTicket(test.id);
      if (existingTicket) {
        // Update the test with the ticket info (mock implementation)
        test.jiraTicket = {
          id: existingTicket.id,
          key: existingTicket.key,
          url: existingTicket.url,
        };
      }
    }
  }

  return json({
    repository,
    repositories,
    selectedRepo,
    tests,
    counts: {
      total: tests.length,
      excluded: tests.filter((t) => t.excluded).length,
      included: tests.filter((t) => !t.excluded).length,
      needsTicket: tests.filter(
        (t) =>
          (t.flakeRate > flakeThreshold || t.failureRate > failureThreshold) &&
          !t.jiraTicket,
      ).length,
    },
  });
}

export default function Dashboard() {
  const { repository, tests, counts, selectedRepo } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <div className="container mx-auto">
        <PageHeader
          title={`${repository?.name || "Dashboard"}`}
          description={`Monitor and manage flaky tests in ${repository?.description || "your Cypress test suite"}.`}
        />

        <div className="space-y-8">
          <DashboardStats counts={counts} />

          <ThresholdsCard repository={repository} selectedRepo={selectedRepo} />

          <TestsTable
            tests={tests}
            repository={repository}
            selectedRepo={selectedRepo}
          />
        </div>
      </div>
    </div>
  );
}
