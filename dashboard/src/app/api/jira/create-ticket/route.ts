import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createJiraTicket } from "@/app/lib/jira";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { flakyTestId } = data;

    if (!flakyTestId) {
      return NextResponse.json(
        { error: "Missing flakyTestId in request." },
        { status: 400 }
      );
    }

    // Get flaky test details
    const flakyTest = await prisma.flakyTest.findUnique({
      where: { id: flakyTestId },
    });

    if (!flakyTest) {
      return NextResponse.json(
        { error: "Flaky test not found." },
        { status: 404 }
      );
    }

    // If ticket already exists, return it
    if (flakyTest.jiraTicket) {
      return NextResponse.json({
        success: true,
        ticketKey: flakyTest.jiraTicket,
        message: "Ticket already exists",
      });
    }

    // Create Jira ticket
    const ticketKey = await createJiraTicket({
      summary: `Fix flaky test: ${flakyTest.testName}`,
      description: `
## Flaky Test Details

- **Test Name**: ${flakyTest.testName}
- **Spec File**: ${flakyTest.specFile}
- **Flakiness Rate**: ${(flakyTest.flakinessRate * 100).toFixed(1)}%
- **Occurrences**: ${flakyTest.occurrences}
- **Last Detected**: ${flakyTest.lastDetectedAt}

This test has been identified as flaky by our automated system. Please investigate and fix the underlying issues.

## Possible Causes
- Race conditions
- Timeouts
- Network issues
- State bleeding between tests
- Selectors that might be timing-dependent
      `,
      issueType: "Bug",
      priority: "Medium",
      labels: ["flaky-test", "automation", "ci-stability"],
    });

    // Update flaky test with Jira ticket reference
    await prisma.flakyTest.update({
      where: { id: flakyTestId },
      data: { jiraTicket: ticketKey },
    });

    return NextResponse.json({
      success: true,
      ticketKey,
      message: "Jira ticket created successfully",
    });
  } catch (error) {
    console.error("Error creating Jira ticket:", error);
    return NextResponse.json(
      { error: "Failed to create Jira ticket." },
      { status: 500 }
    );
  }
}
