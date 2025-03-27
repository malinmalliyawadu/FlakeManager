import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { prisma } from "~/db.server";
import { getCypressService } from "~/services/cypress.server";
import { type Test } from "~/types/cypress";

export async function loader({ request }: ActionFunctionArgs) {
  // Redirect any direct visits to this page back to the dashboard
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") || "demo-repo";
  return redirect(`/dashboard?repo=${repo}`);
}

export async function action({ params, request }: ActionFunctionArgs) {
  const url = new URL(request.url);

  // Get data from either URL params or form data
  let current: string | null = url.searchParams.get("current");
  let repo: string | null = url.searchParams.get("repo") || "demo-repo";

  // Also check form data if it exists (for server actions)
  const formData = await request.formData();
  if (formData.has("current")) {
    current = formData.get("current") as string;
  }
  if (formData.has("repo")) {
    repo = formData.get("repo") as string;
  }

  const testId = params.testId;

  // Get the test directly from the database
  const test = await prisma.test.findUnique({
    where: { id: testId },
  });

  if (!test) {
    console.error(`Test not found: ${testId}`);
    return new Response("Test not found", { status: 404 });
  }

  // Update the test
  const updatedTest = await prisma.test.update({
    where: { id: testId },
    data: {
      excluded: current !== "excluded",
      manualOverride: true,
    },
  });

  // For server actions, return the updated test data
  if (request.headers.get("Accept") === "application/json") {
    return { success: true, test: updatedTest };
  }

  // For traditional form submissions, redirect back to the dashboard
  return redirect(`/dashboard?repo=${repo}`);
}
