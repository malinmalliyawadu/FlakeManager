import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCypressService } from "~/services/cypress.server";
import { Button } from "~/components/ui/button";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { TestsTable } from "~/components/dashboard/TestsTable";
import { DashboardStats } from "~/components/dashboard/DashboardStats";
import { ThresholdsCard } from "~/components/dashboard/ThresholdsCard";
import { RepoSelector } from "~/components/dashboard/RepoSelector";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repositories = await cypressService.getRepositories();
  const repository = await cypressService.getRepository(selectedRepo);
  const tests = await cypressService.getTestsForRepo(selectedRepo);

  return json({
    repository,
    repositories,
    selectedRepo,
    tests,
    counts: {
      total: tests.length,
      excluded: tests.filter((t) => t.excluded).length,
      included: tests.filter((t) => !t.excluded).length,
    },
  });
}

export default function Dashboard() {
  const { repository, repositories, tests, counts, selectedRepo } =
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
