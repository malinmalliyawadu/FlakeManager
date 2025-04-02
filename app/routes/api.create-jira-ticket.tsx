import { json } from "node:stream/consumers";

import { type ActionFunctionArgs } from "react-router";

import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";

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
      return {
        error: "Missing required fields: testId and repository are required",
        status: 400,
      };
    }

    // Get the test details
    const tests = await cypressService.getTestsForRepo(repository);
    const test = tests.find((t) => t.id === testId);

    if (!test) {
      return {
        error: `Test with ID ${testId} not found in repository ${repository}`,
        status: 404,
      };
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

    return { ticket };
  } catch (error) {
    console.error("Error creating JIRA ticket:", error);
    return { error: "Failed to create JIRA ticket", status: 500 };
  }
}
