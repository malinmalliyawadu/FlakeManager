import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCypressService } from "~/services/cypress.server";
import { type Repository, type Test } from "~/types/cypress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader } from "~/components/page-header";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repository = await cypressService.getRepository(selectedRepo);
  const tests = await cypressService.getTestsForRepo(selectedRepo);

  return json({
    repository,
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
  const { repository, tests, counts, selectedRepo } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${repository?.name || "Dashboard"}`}
        description={`Monitor and manage flaky tests in ${repository?.description || "your Cypress test suite"}.`}
      >
        <Button asChild>
          <Link to={`/thresholds?repo=${selectedRepo}`}>
            Configure Thresholds
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Excluded Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-3xl font-bold">
              {counts.excluded}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Included Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {counts.included}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Thresholds</CardTitle>
          <CardDescription>
            Tests that exceed these thresholds are automatically excluded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-sm font-medium">Flake Threshold</div>
              <div className="text-2xl font-semibold">
                {repository?.flakeThreshold || 5}%
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Failure Threshold</div>
              <div className="text-2xl font-semibold">
                {repository?.failureThreshold || 10}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight">Test Status</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Flake Rate</TableHead>
                  <TableHead>Failure Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test: Test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {test.file}
                    </TableCell>
                    <TableCell
                      className={
                        test.flakeRate > (repository?.flakeThreshold || 5)
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {test.flakeRate}%
                    </TableCell>
                    <TableCell
                      className={
                        test.failureRate > (repository?.failureThreshold || 10)
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {test.failureRate}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={test.excluded ? "destructive" : "success"}
                      >
                        {test.excluded ? "Excluded" : "Included"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          to={`/toggle/${test.id}?current=${test.excluded ? "excluded" : "included"}&repo=${selectedRepo}`}
                        >
                          {test.excluded ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Include
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Exclude
                            </>
                          )}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
