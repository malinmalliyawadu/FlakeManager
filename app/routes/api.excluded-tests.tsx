import { type LoaderFunctionArgs } from "react-router";
import { getCypressService } from "~/services/cypress.server";
import type { ApiResponse, Test } from "~/types/cypress";

/**
 * API endpoint that returns a list of tests to exclude from a repository.
 * This endpoint is designed to be called from GitHub Actions or other CI systems.
 *
 * Example: GET /api/excluded-tests?repo=demo-repo&flakeThreshold=5&failureThreshold=10
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") || "demo-repo";
  const flakeThresholdParam = url.searchParams.get("flakeThreshold");
  const failureThresholdParam = url.searchParams.get("failureThreshold");

  try {
    const cypressService = getCypressService();

    // Get repository settings
    const repository = await cypressService.getRepository(repo);

    if (!repository) {
      return {
        status: "error",
        message: `Repository '${repo}' not found`,
      };
    }

    // Use custom thresholds if provided, otherwise use repository defaults
    const flakeThreshold = flakeThresholdParam
      ? parseInt(flakeThresholdParam, 10)
      : repository.flakeThreshold;

    const failureThreshold = failureThresholdParam
      ? parseInt(failureThresholdParam, 10)
      : repository.failureThreshold;

    // Get all tests for the repository
    const allTests = await cypressService.getTestsForRepo(repo);

    // Filter tests that should be excluded (either marked as excluded or exceed thresholds)
    const testsToExclude = allTests.filter((test: Test) => {
      // If manually included despite thresholds, don't exclude
      if (test.manualOverride && !test.excluded) {
        return false;
      }

      // If manually excluded despite not exceeding thresholds, exclude
      if (test.manualOverride && test.excluded) {
        return true;
      }

      // Exclude if it exceeds either threshold
      return (
        test.excluded ||
        test.flakeRate > flakeThreshold ||
        test.failureRate > failureThreshold
      );
    });

    return {
      status: "success",
      data: testsToExclude.map((test: Test) => ({
        id: test.id,
        name: test.name,
        file: test.file,
        flakeRate: test.flakeRate,
        failureRate: test.failureRate,
        excluded: true,
        jiraTicket: test.jiraTicket,
      })),
    };
  } catch (error) {
    console.error("Error retrieving excluded tests:", error);
    return {
      status: "error",
      message: "Failed to retrieve excluded tests",
    };
  }
}
