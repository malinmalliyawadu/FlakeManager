import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { getCypressService } from "~/services/cypress.server";
import { type ApiResponse } from "~/types/cypress";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo");
  const flakeThreshold = url.searchParams.get("flakeThreshold")
    ? parseInt(url.searchParams.get("flakeThreshold") as string, 10)
    : undefined;
  const failureThreshold = url.searchParams.get("failureThreshold")
    ? parseInt(url.searchParams.get("failureThreshold") as string, 10)
    : undefined;

  if (!repo) {
    return json<ApiResponse>(
      {
        status: "error",
        message: "Repository name is required",
      },
      { status: 400 },
    );
  }

  try {
    const cypressService = getCypressService();
    const tests = await cypressService.getTestsForRepo(repo, {
      flakeThreshold,
      failureThreshold,
    });

    return json<ApiResponse>({
      status: "success",
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return json<ApiResponse>(
      {
        status: "error",
        message: "Failed to fetch test data",
      },
      { status: 500 },
    );
  }
}
