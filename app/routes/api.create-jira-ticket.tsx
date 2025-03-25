import { json, type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";

// Validation schema
const ticketSchema = z.object({
  testId: z.string(),
  repo: z.string(),
  board: z.string().min(1, "Board is required"),
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  returnTo: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const jiraService = getJiraService();
  const cypressService = getCypressService();

  try {
    const {
      testId,
      repository,
      summary,
      description,
      board,
      isManualCreation,
      returnTo,
    } = await request.json();

    if (!testId || !repository) {
      return json(
        {
          error: "Missing required fields: testId and repository are required",
        },
        { status: 400 },
      );
    }

    // Get the test details
    const tests = await cypressService.getTestsForRepo(repository);
    const test = tests.find((t) => t.id === testId);

    if (!test) {
      return json(
        {
          error: `Test with ID ${testId} not found in repository ${repository}`,
        },
        { status: 404 },
      );
    }

    // Get repository details to fetch default JIRA board if needed
    const repo = await cypressService.getRepository(repository);
    const boardToUse = board || repo?.defaultJiraBoard || undefined;

    // Create a JIRA ticket for the test
    const ticket = await jiraService.createTicket(test, repository, {
      board: boardToUse,
      summary,
      description,
      isManualCreation: isManualCreation === true,
    });

    // If there's a returnTo URL provided, redirect there
    if (returnTo) {
      return Response.redirect(returnTo);
    }

    return json({ ticket });
  } catch (error) {
    console.error("Error creating JIRA ticket:", error);
    return json({ error: "Failed to create JIRA ticket" }, { status: 500 });
  }
}
