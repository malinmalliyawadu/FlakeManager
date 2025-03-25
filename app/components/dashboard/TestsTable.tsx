import { Link } from "@remix-run/react";
import { useState } from "react";
import { type Repository, type Test } from "~/types/cypress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  HandMetal,
  Ticket,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TestsTableProps {
  tests: Test[];
  repository: Repository | null;
  selectedRepo: string;
}

export function TestsTable({
  tests,
  repository,
  selectedRepo,
}: TestsTableProps) {
  const [showOnlyExceededThreshold, setShowOnlyExceededThreshold] =
    useState(false);

  const filteredTests = showOnlyExceededThreshold
    ? tests.filter(
        (test) =>
          test.flakeRate > (repository?.flakeThreshold || 5) ||
          test.failureRate > (repository?.failureThreshold || 10),
      )
    : tests;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Test Status</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setShowOnlyExceededThreshold(!showOnlyExceededThreshold)
            }
            className="flex items-center gap-2"
          >
            {showOnlyExceededThreshold ? (
              <>
                <Eye className="h-4 w-4" />
                <span>Show All</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Show Only Above Threshold</span>
              </>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
        </div>
      </div>
      <Card className="shadow-sm">
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
              {filteredTests.map((test: Test) => {
                return (
                  <TableRow
                    key={test.id}
                    className={
                      test.manualOverride
                        ? "bg-amber-50 dark:bg-amber-950/20"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/test/${test.id}?repo=${selectedRepo}`}
                          className="hover:text-primary hover:underline"
                        >
                          {test.name}
                        </Link>
                        {test.manualOverride && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HandMetal className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Manually{" "}
                                  {test.excluded ? "excluded" : "included"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center">
                        <span className="ml-2">{test.file}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <FlakeRateBadge
                        rate={test.flakeRate}
                        threshold={repository?.flakeThreshold || 5}
                      />
                    </TableCell>
                    <TableCell>
                      <FailureRateBadge
                        rate={test.failureRate}
                        threshold={repository?.failureThreshold || 10}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={test.excluded ? "destructive" : "success"}
                        className={`font-medium ${test.manualOverride ? "border-2 border-amber-500" : ""}`}
                      >
                        {test.excluded ? "Excluded" : "Included"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {test.jiraTicket ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                            asChild
                          >
                            <a
                              href={test.jiraTicket.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {test.jiraTicket.key}
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className={
                              test.flakeRate >
                                (repository?.flakeThreshold || 5) ||
                              test.failureRate >
                                (repository?.failureThreshold || 10)
                                ? "text-yellow-600 dark:text-yellow-400"
                                : ""
                            }
                          >
                            <Link
                              to={`/create-jira-ticket?testId=${test.id}&testName=${encodeURIComponent(test.name)}&repo=${selectedRepo}`}
                            >
                              <Ticket className="mr-1 h-4 w-4" />
                              {test.flakeRate >
                                (repository?.flakeThreshold || 5) ||
                              test.failureRate >
                                (repository?.failureThreshold || 10)
                                ? "Create Ticket (Needed)"
                                : "Create Ticket"}
                            </Link>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-muted/50"
                        >
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FlakeRateBadge({
  rate,
  threshold,
}: {
  rate: number;
  threshold: number;
}) {
  const isExceeded = rate > threshold;

  return (
    <div className="flex items-center">
      <div
        className={`rounded-md px-2 py-1 text-xs font-medium ${
          isExceeded
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        }`}
      >
        {rate}%
      </div>
      {isExceeded && (
        <span className="ml-2 text-xs text-muted-foreground">
          (&gt;{threshold}%)
        </span>
      )}
    </div>
  );
}

function FailureRateBadge({
  rate,
  threshold,
}: {
  rate: number;
  threshold: number;
}) {
  const isExceeded = rate > threshold;

  return (
    <div className="flex items-center">
      <div
        className={`rounded-md px-2 py-1 text-xs font-medium ${
          isExceeded
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        }`}
      >
        {rate}%
      </div>
      {isExceeded && (
        <span className="ml-2 text-xs text-muted-foreground">
          (&gt;{threshold}%)
        </span>
      )}
    </div>
  );
}
