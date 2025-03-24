import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form as RemixForm,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Save, ChevronLeft } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { Label } from "~/components/ui/label";
import { getCypressService } from "~/services/cypress.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repository = await cypressService.getRepository(selectedRepo);
  if (!repository) {
    throw new Response("Repository not found", { status: 404 });
  }

  return json({
    repository,
    selectedRepo,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cypressService = getCypressService();

  const repoId = formData.get("repoId") as string;
  const flakeThreshold = parseInt(formData.get("flakeThreshold") as string, 10);
  const failureThreshold = parseInt(
    formData.get("failureThreshold") as string,
    10,
  );

  const errors: Record<string, string> = {};

  if (isNaN(flakeThreshold) || flakeThreshold < 0 || flakeThreshold > 100) {
    errors.flakeThreshold =
      "Flake threshold must be a number between 0 and 100";
  }

  if (
    isNaN(failureThreshold) ||
    failureThreshold < 0 ||
    failureThreshold > 100
  ) {
    errors.failureThreshold =
      "Failure threshold must be a number between 0 and 100";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { flakeThreshold, failureThreshold } });
  }

  // Update the repository thresholds
  await cypressService.updateRepositoryThresholds(
    repoId,
    flakeThreshold,
    failureThreshold,
  );

  return redirect(`/dashboard?repo=${repoId}`);
}

export default function ThresholdsPage() {
  const { repository, selectedRepo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [flakeThreshold, setFlakeThreshold] = useState(
    actionData?.values?.flakeThreshold ?? repository.flakeThreshold,
  );
  const [failureThreshold, setFailureThreshold] = useState(
    actionData?.values?.failureThreshold ?? repository.failureThreshold,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Configure Thresholds: ${repository.name}`}
        description="Set thresholds for when tests should be automatically excluded from test runs."
      />

      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
          <CardDescription>
            Tests that exceed these thresholds will be automatically excluded
            from test runs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RemixForm method="post" className="space-y-6">
            <input type="hidden" name="repoId" value={selectedRepo} />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flakeThreshold">Flake Rate Threshold (%)</Label>
                <Input
                  type="number"
                  id="flakeThreshold"
                  name="flakeThreshold"
                  min="0"
                  max="100"
                  value={flakeThreshold}
                  onChange={(e) =>
                    setFlakeThreshold(parseInt(e.target.value) || 0)
                  }
                />
                {actionData?.errors?.flakeThreshold && (
                  <p className="text-destructive text-sm">
                    {actionData.errors.flakeThreshold}
                  </p>
                )}
                <p className="text-muted-foreground text-[0.8rem]">
                  Tests with a flake rate above this percentage will be
                  automatically excluded.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="failureThreshold">
                  Failure Rate Threshold (%)
                </Label>
                <Input
                  type="number"
                  id="failureThreshold"
                  name="failureThreshold"
                  min="0"
                  max="100"
                  value={failureThreshold}
                  onChange={(e) =>
                    setFailureThreshold(parseInt(e.target.value) || 0)
                  }
                />
                {actionData?.errors?.failureThreshold && (
                  <p className="text-destructive text-sm">
                    {actionData.errors.failureThreshold}
                  </p>
                )}
                <p className="text-muted-foreground text-[0.8rem]">
                  Tests with a failure rate above this percentage will be
                  automatically excluded.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <a
                  href={`/dashboard?repo=${selectedRepo}`}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Cancel
                </a>
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </RemixForm>
        </CardContent>
      </Card>
    </div>
  );
}
