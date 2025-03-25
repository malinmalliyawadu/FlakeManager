import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Ticket,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const testId = params.id;
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") || "demo-repo";

  if (!testId) {
    throw new Response("Test ID is required", { status: 400 });
  }

  const cypressService = getCypressService();
  const jiraService = getJiraService();

  const tests = await cypressService.getTestsForRepo(repo);
  const test = tests.find((t) => t.id === testId);

  if (!test) {
    throw new Response("Test not found", { status: 404 });
  }

  const repository = await cypressService.getRepository(repo);
  const jiraTicket = await jiraService.getTicket(testId);

  return json({
    test,
    repository,
    repo,
    jiraTicket,
  });
}

export default function TestDetails() {
  const { test, repository, repo, jiraTicket } = useLoaderData<typeof loader>();

  const isAboveFlakeThreshold =
    test.flakeRate > (repository?.flakeThreshold || 5);
  const isAboveFailureThreshold =
    test.failureRate > (repository?.failureThreshold || 10);
  const needsAction = isAboveFlakeThreshold || isAboveFailureThreshold;

  return (
    <div className="space-y-8">
      <div className="container mx-auto">
        <div className="mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard?repo=${repo}`} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <PageHeader
          title={test.name}
          description={`Test details for ${test.file}`}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                Information about this test's status and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Test File</div>
                <div className="font-mono text-sm">{test.file}</div>
              </div>

              <div>
                <div className="text-sm font-medium">Current Status</div>
                <div className="mt-1">
                  <Badge
                    variant={test.excluded ? "destructive" : "success"}
                    className={`${
                      test.manualOverride ? "border-2 border-amber-500" : ""
                    }`}
                  >
                    {test.excluded ? "Excluded from CI" : "Included in CI"}
                    {test.manualOverride && " (Manual Override)"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium">Flake Rate</div>
                  <div
                    className={`mt-1 rounded-md px-2 py-1 text-sm font-medium ${
                      isAboveFlakeThreshold
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {test.flakeRate}%
                    {isAboveFlakeThreshold && (
                      <span className="ml-1 text-xs">
                        (Threshold: {repository?.flakeThreshold || 5}%)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Failure Rate</div>
                  <div
                    className={`mt-1 rounded-md px-2 py-1 text-sm font-medium ${
                      isAboveFailureThreshold
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {test.failureRate}%
                    {isAboveFailureThreshold && (
                      <span className="ml-1 text-xs">
                        (Threshold: {repository?.failureThreshold || 10}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button asChild variant="outline">
                <Link
                  to={`/toggle/${test.id}?current=${
                    test.excluded ? "excluded" : "included"
                  }&repo=${repo}`}
                >
                  {test.excluded ? (
                    <>
                      <ToggleRight className="mr-2 h-4 w-4" />
                      Include in CI
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="mr-2 h-4 w-4" />
                      Exclude from CI
                    </>
                  )}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jira Ticket</CardTitle>
              <CardDescription>
                {test.jiraTicket || jiraTicket
                  ? "This test has an associated Jira ticket"
                  : "Create a Jira ticket to track issues with this test"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {test.jiraTicket || jiraTicket ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Ticket Key</div>
                    <div className="flex items-center gap-2 font-mono text-sm text-blue-600 dark:text-blue-400">
                      {test.jiraTicket?.key || jiraTicket?.key}
                      <a
                        href={test.jiraTicket?.url || jiraTicket?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Summary</div>
                    <div className="text-sm">
                      {jiraTicket?.summary || "Fix flaky test"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div>
                      <Badge variant="outline">
                        {jiraTicket?.status || "Open"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Ticket className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-1 text-lg font-medium">No Jira Ticket</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {needsAction
                      ? "This test exceeds thresholds and should have a ticket created"
                      : "Create a ticket to track issues with this test"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              {test.jiraTicket || jiraTicket ? (
                <Button asChild variant="outline">
                  <a
                    href={test.jiraTicket?.url || jiraTicket?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Jira
                  </a>
                </Button>
              ) : (
                <Button
                  asChild
                  variant={needsAction ? "default" : "outline"}
                  className={
                    needsAction ? "bg-yellow-600 hover:bg-yellow-700" : ""
                  }
                >
                  <Link
                    to={`/create-jira-ticket?testId=${test.id}&testName=${encodeURIComponent(
                      test.name,
                    )}&repo=${repo}`}
                    className="flex items-center"
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    Create Jira Ticket
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
