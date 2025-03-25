import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";
import { PageHeader } from "~/components/page-header";
import { AlertCircle } from "lucide-react";

// Validation schema
const ticketSchema = z.object({
  testId: z.string(),
  repo: z.string(),
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ActionData =
  | { errors: Record<string, string[]> }
  | { error: string }
  | undefined;

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
      return json({ error: "Test not found" }, { status: 404 });
    }

    // Create the Jira ticket
    const ticket = await jiraService.createTicket(test, validatedData.repo, {
      summary: validatedData.summary,
      description: validatedData.description,
      isManualCreation: true,
    });

    // In a real implementation, we would update the test record with the Jira ticket details

    return redirect(`/dashboard?repo=${validatedData.repo}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }

    return json({ error: "Failed to create Jira ticket" }, { status: 500 });
  }
}

export default function CreateJiraTicket() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Get query params
  const url =
    typeof window !== "undefined" ? new URL(window.location.href) : null;
  const testId = url?.searchParams.get("testId") || "";
  const testName = url?.searchParams.get("testName") || "";
  const repo = url?.searchParams.get("repo") || "demo-repo";

  return (
    <div className="space-y-8">
      <div className="container mx-auto">
        <PageHeader
          title="Create Jira Ticket"
          description="Create a Jira ticket to track and fix test issues"
        />

        <div className="mx-auto max-w-2xl space-y-6">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="testId" value={testId} />
            <input type="hidden" name="repo" value={repo} />

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                name="summary"
                defaultValue={`Fix test: ${testName}`}
                required
              />
              {actionData &&
                "errors" in actionData &&
                actionData.errors.summary && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {actionData.errors.summary[0]}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={`This ticket is for resolving issues with the test "${testName}" in the ${repo} repository.`}
                required
              />
              {actionData &&
                "errors" in actionData &&
                actionData.errors.description && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {actionData.errors.description[0]}
                  </p>
                )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <a href={`/dashboard?repo=${repo}`}>Cancel</a>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Jira Ticket"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
