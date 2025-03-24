import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getCypressService } from "~/services/cypress.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const testId = params.testId;

  if (!testId) {
    return json({ error: "Test ID is required" }, { status: 400 });
  }

  // Get the current status from URL query params
  const url = new URL(request.url);
  const currentStatus = url.searchParams.get("current");
  const excluded = currentStatus !== "excluded"; // Toggle the status

  const cypressService = getCypressService();
  const updatedTest = await cypressService.toggleTestExclusion(
    testId,
    excluded,
  );

  if (!updatedTest) {
    return json({ error: "Test not found" }, { status: 404 });
  }

  return redirect("/flake-manager");
}

export async function loader() {
  // Redirect direct visits to this route to the dashboard
  return redirect("/flake-manager");
}
