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
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { getCypressService } from "~/services/cypress.server";
import { ThresholdsForm } from "~/components/thresholds/ThresholdsForm";
import { ThresholdsImpact } from "~/components/thresholds/ThresholdsImpact";
import { MetricsSlideOver } from "~/components/thresholds/MetricsSlideOver";
import { RepoSelector } from "~/components/dashboard/RepoSelector";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repositories = await cypressService.getRepositories();
  const repository = await cypressService.getRepository(selectedRepo);
  if (!repository) {
    throw new Response("Repository not found", { status: 404 });
  }

  // Get all tests to show the impact of threshold changes
  const tests = await cypressService.getTestsForRepo(selectedRepo);

  return json({
    repository,
    repositories,
    selectedRepo,
    tests,
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

export default function Thresholds() {
  const { repository, repositories, selectedRepo, tests } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [thresholds, setThresholds] = useState({
    flakeThreshold: repository?.flakeThreshold || 0,
    failureThreshold: repository?.failureThreshold || 0,
  });

  // Handle threshold changes from the form
  const handleThresholdChange = ({
    flakeThreshold,
    failureThreshold,
  }: {
    flakeThreshold?: number;
    failureThreshold?: number;
  }) => {
    setThresholds((prev) => ({
      flakeThreshold:
        flakeThreshold !== undefined ? flakeThreshold : prev.flakeThreshold,
      failureThreshold:
        failureThreshold !== undefined
          ? failureThreshold
          : prev.failureThreshold,
    }));
  };

  if (!repository) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Thresholds</h1>
          <p className="text-muted-foreground mt-2">
            Set the thresholds for test flakiness and failure rate
          </p>
        </header>
        <MetricsSlideOver
          repository={repository}
          tests={tests}
          flakeThreshold={thresholds.flakeThreshold}
          failureThreshold={thresholds.failureThreshold}
        />
      </div>

      <div className="space-y-6">
        <ThresholdsForm
          repository={repository}
          selectedRepo={selectedRepo}
          tests={tests}
          actionData={actionData}
          onChange={{
            flakeThreshold: (value: number) =>
              handleThresholdChange({ flakeThreshold: value }),
            failureThreshold: (value: number) =>
              handleThresholdChange({ failureThreshold: value }),
          }}
        />
      </div>
    </div>
  );
}
