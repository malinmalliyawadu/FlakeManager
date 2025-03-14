"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  MoreHorizontal,
  Bug,
  TicketIcon,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// This would typically come from an API call in a real implementation
const dummyFlakyTests = [
  {
    id: "1",
    testName: "should submit form with valid data",
    specFile: "cypress/e2e/forms/submission.cy.ts",
    flakinessRate: 0.25,
    occurrences: 5,
    lastDetectedAt: new Date(Date.now() - 3600000),
    suppressed: true,
    jiraTicket: "FLAKE-123",
  },
  {
    id: "2",
    testName: "should display error message for invalid input",
    specFile: "cypress/e2e/forms/validation.cy.ts",
    flakinessRate: 0.4,
    occurrences: 8,
    lastDetectedAt: new Date(Date.now() - 7200000),
    suppressed: false,
    jiraTicket: null,
  },
  // More tests would be here
];

export default function FlakyTestsTable() {
  const [flakyTests, setFlakyTests] = useState(dummyFlakyTests);
  const router = useRouter();

  const toggleSuppression = async (id: string, currentValue: boolean) => {
    // In a real app, this would call an API endpoint
    setFlakyTests(
      flakyTests.map((test) =>
        test.id === id ? { ...test, suppressed: !currentValue } : test
      )
    );
  };

  const createJiraTicket = async (
    id: string,
    testName: string,
    specFile: string
  ) => {
    // In a real app, this would call an API endpoint to create a Jira ticket
    alert(`Creating Jira ticket for: ${testName}`);

    // Simulate API response
    setFlakyTests(
      flakyTests.map((test) =>
        test.id === id
          ? { ...test, jiraTicket: "FLAKE-" + Math.floor(Math.random() * 1000) }
          : test
      )
    );
  };

  const viewTestDetails = (id: string) => {
    router.push(`/dashboard/tests/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>;
      case "investigating":
        return <Badge variant="secondary">Investigating</Badge>;
      case "suppressed":
        return <Badge variant="outline">Suppressed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSuppress = (id: string) => {
    setFlakyTests(
      flakyTests.map((test) =>
        test.id === id ? { ...test, suppressed: true } : test
      )
    );
  };

  const handleCreateJiraTicket = (id: string) => {
    // This would call an API to create a Jira ticket in a real application
    console.log(`Creating Jira ticket for test ${id}`);
    setFlakyTests(
      flakyTests.map((test) =>
        test.id === id ? { ...test, suppressed: false } : test
      )
    );
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Name</TableHead>
            <TableHead>Spec File</TableHead>
            <TableHead>Flakiness Rate</TableHead>
            <TableHead>Occurrences</TableHead>
            <TableHead>Last Detected</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Jira</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flakyTests.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="font-medium">{test.testName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {test.specFile}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    test.flakinessRate > 0.3 ? "destructive" : "secondary"
                  }
                >
                  {(test.flakinessRate * 100).toFixed(1)}%
                </Badge>
              </TableCell>
              <TableCell>{test.occurrences}</TableCell>
              <TableCell>
                {formatDistanceToNow(test.lastDetectedAt, { addSuffix: true })}
              </TableCell>
              <TableCell>
                {getStatusBadge(test.suppressed ? "suppressed" : "active")}
              </TableCell>
              <TableCell>
                {test.jiraTicket ? (
                  <a
                    href="#"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <TicketIcon className="mr-1 h-3 w-3" />
                    {test.jiraTicket}
                  </a>
                ) : (
                  <Badge variant="outline" className="bg-gray-100">
                    None
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => viewTestDetails(test.id)}>
                      View Details
                    </DropdownMenuItem>
                    {test.suppressed ? (
                      <DropdownMenuItem onClick={() => handleSuppress(test.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        <span>Remove Suppression</span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleSuppress(test.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          <span>Suppress Test</span>
                        </DropdownMenuItem>
                        {!test.jiraTicket && (
                          <DropdownMenuItem
                            onClick={() => handleCreateJiraTicket(test.id)}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            <span>Create Jira Ticket</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
