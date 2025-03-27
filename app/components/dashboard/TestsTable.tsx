import { Link } from "@remix-run/react";
import {
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  HandMetal,
  Ticket,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";

import { CreateTicketSheet } from "~/components/jira/CreateTicketSheet";
import { TablePagination } from "~/components/dashboard/TablePagination";
import { TableSearch } from "~/components/dashboard/TableSearch";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type Repository, type Test } from "~/types/cypress";

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
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter tests based on threshold and search term
  const filteredTests = useMemo(() => {
    let filtered = showOnlyExceededThreshold
      ? tests.filter(
          (test) =>
            test.flakeRate > (repository?.flakeThreshold || 5) ||
            test.failureRate > (repository?.failureThreshold || 10),
        )
      : tests;

    // Apply search filter if searchTerm exists
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.name.toLowerCase().includes(lowerSearchTerm) ||
          test.file.toLowerCase().includes(lowerSearchTerm),
      );
    }

    return filtered;
  }, [tests, showOnlyExceededThreshold, repository, searchTerm]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTests.length / itemsPerPage),
  );

  // Get current page items
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredTests.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTests, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateTicket = (test: Test) => {
    setSelectedTest(test);
    setIsCreateTicketOpen(true);
  };

  return (
    <div>
      <div className="mb-1 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Test Status</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
          <TableSearch
            onSearch={handleSearch}
            placeholder="Search by test name or file..."
          />
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
        </div>
      </div>

      <div className="mb-3 text-right text-sm text-muted-foreground">
        Showing {currentItems.length} of {filteredTests.length} tests
        {searchTerm && (
          <span>
            {" "}
            matching "<strong>{searchTerm}</strong>"
          </span>
        )}
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
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((test: Test) => {
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
                          {test.manualOverride ? (
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
                          ) : null}
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
                              onClick={() => handleCreateTicket(test)}
                              className={
                                test.flakeRate >
                                  (repository?.flakeThreshold || 5) ||
                                test.failureRate >
                                  (repository?.failureThreshold || 10)
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : ""
                              }
                            >
                              <Ticket className="mr-1 h-4 w-4" />
                              {test.flakeRate >
                                (repository?.flakeThreshold || 5) ||
                              test.failureRate >
                                (repository?.failureThreshold || 10)
                                ? "Create Ticket (Needed)"
                                : "Create Ticket"}
                            </Button>
                          )}

                          <Button
                            variant="outline"
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Show pagination only if there are more than one page */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <CreateTicketSheet
        isOpen={isCreateTicketOpen}
        onOpenChange={setIsCreateTicketOpen}
        test={selectedTest}
        repositoryId={selectedRepo}
      />
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
      {isExceeded ? (
        <span className="ml-2 text-xs text-muted-foreground">
          (&gt;{threshold}%)
        </span>
      ) : null}
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
      {isExceeded ? (
        <span className="ml-2 text-xs text-muted-foreground">
          (&gt;{threshold}%)
        </span>
      ) : null}
    </div>
  );
}
