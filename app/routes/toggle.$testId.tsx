import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { getCypressService } from "~/services/cypress.server";
import { type Test } from "~/types/cypress";

export async function loader() {
  // Redirect any direct visits to this page back to the dashboard
  return redirect("/dashboard");
}

export async function action({ params, request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const current = url.searchParams.get("current");

  const testId = params.testId;

  if (!testId) {
    return new Response("Test ID is required", { status: 400 });
  }

  const cypressService = getCypressService();
  const tests = await cypressService.getTestsForRepo("demo/repo");
  const test = tests.find((t: Test) => t.id === testId);

  if (!test) {
    return new Response("Test not found", { status: 404 });
  }

  await cypressService.toggleTestExclusion(testId, current === "excluded");

  return redirect("/dashboard");
}
