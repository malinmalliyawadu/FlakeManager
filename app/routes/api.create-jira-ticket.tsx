import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
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
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const validatedData = ticketSchema.parse(data);

    const cypressService = getCypressService();
    const jiraService = getJiraService();

    // Get the test to create a ticket for
    const tests = await cypressService.getTestsForRepo(validatedData.repo);
    const test = tests.find((t) => t.id === validatedData.testId);

    if (!test) {
      return json({ success: false, error: "Test not found" }, { status: 404 });
    }

    // Create the Jira ticket
    const ticket = await jiraService.createTicket(test, validatedData.repo, {
      board: validatedData.board,
      summary: validatedData.summary,
      description: validatedData.description,
      isManualCreation: true,
    });

    // In a real implementation, we would update the test record with the Jira ticket details
    test.jiraTicket = {
      id: ticket.id,
      key: ticket.key,
      url: ticket.url,
    };

    // If there's a returnTo URL provided, redirect there
    if (validatedData.returnTo) {
      return redirect(validatedData.returnTo);
    }

    // Otherwise return success JSON
    return json({ success: true, ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(
        {
          success: false,
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return json(
      {
        success: false,
        error: "Failed to create Jira ticket",
      },
      { status: 500 },
    );
  }
}
