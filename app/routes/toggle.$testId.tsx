import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
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
  const current = url.searchParams.get("current");
  const repo = url.searchParams.get("repo") || "demo-repo";

  const testId = params.testId;

  if (!testId) {
    return new Response("Test ID is required", { status: 400 });
  }

  const cypressService = getCypressService();
  const tests = await cypressService.getTestsForRepo(repo);
  const test = tests.find((t: Test) => t.id === testId);

  if (!test) {
    return new Response("Test not found", { status: 404 });
  }

  await cypressService.toggleTestExclusion(
    testId,
    current === "excluded",
    repo,
  );

  return redirect(`/dashboard?repo=${repo}`);
}
