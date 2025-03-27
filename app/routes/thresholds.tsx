import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { PageHeader } from "~/components/page-header";
import { MetricsSlideOver } from "~/components/thresholds/MetricsSlideOver";
import { ThresholdsForm } from "~/components/thresholds/ThresholdsForm";
import { getCypressService } from "~/services/cypress.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";
  const timePeriod = url.searchParams.get("timePeriod") || "30d";

  const repositories = await cypressService.getRepositories();
  const repository = await cypressService.getRepository(selectedRepo);
  if (!repository) {
    throw new Response("Repository not found", { status: 404 });
  }

  // Get all tests to show the impact of threshold changes, filtered by time period
  const tests = await cypressService.getTestsForRepo(selectedRepo, timePeriod);

  return json({
    repository,
    repositories,
    selectedRepo,
    tests,
    timePeriod,
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
  const timePeriod = formData.get("timePeriod") as string;

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

  if (!timePeriod || !["7d", "30d", "90d", "all"].includes(timePeriod)) {
    errors.timePeriod = "Please select a valid time period";
  }

  if (Object.keys(errors).length > 0) {
    return json({
      errors,
      values: { flakeThreshold, failureThreshold, timePeriod },
    });
  }

  // Update the repository thresholds
  await cypressService.updateRepositoryThresholds(
    repoId,
    flakeThreshold,
    failureThreshold,
    timePeriod,
  );

  // Include timePeriod in the redirect URL
  return redirect(`/dashboard?repo=${repoId}&timePeriod=${timePeriod}`);
}

export default function Thresholds() {
  const { repository, selectedRepo, tests, timePeriod } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [thresholds, setThresholds] = useState({
    flakeThreshold: repository?.flakeThreshold || 0,
    failureThreshold: repository?.failureThreshold || 0,
    timePeriod: timePeriod || repository?.timePeriod || "30d",
  });

  // Handle threshold changes from the form
  const handleThresholdChange = ({
    flakeThreshold,
    failureThreshold,
    timePeriod,
  }: {
    flakeThreshold?: number;
    failureThreshold?: number;
    timePeriod?: string;
  }) => {
    setThresholds((prev) => ({
      flakeThreshold:
        flakeThreshold !== undefined ? flakeThreshold : prev.flakeThreshold,
      failureThreshold:
        failureThreshold !== undefined
          ? failureThreshold
          : prev.failureThreshold,
      timePeriod: timePeriod !== undefined ? timePeriod : prev.timePeriod,
    }));
  };

  if (!repository) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="contents-start flex items-center justify-between">
        <PageHeader
          title="Thresholds"
          description={`Set the thresholds for test flakiness and failure rate`}
        />
        <MetricsSlideOver
          repository={repository}
          tests={tests}
          flakeThreshold={thresholds.flakeThreshold}
          failureThreshold={thresholds.failureThreshold}
          timePeriod={thresholds.timePeriod}
        />
      </div>

      <div className="space-y-6">
        <ThresholdsForm
          repository={{
            ...repository,
            timePeriod: thresholds.timePeriod,
          }}
          selectedRepo={selectedRepo}
          tests={tests}
          actionData={actionData}
          onChange={{
            flakeThreshold: (value: number) =>
              handleThresholdChange({ flakeThreshold: value }),
            failureThreshold: (value: number) =>
              handleThresholdChange({ failureThreshold: value }),
            timePeriod: (value: string) =>
              handleThresholdChange({ timePeriod: value }),
          }}
        />
      </div>
    </div>
  );
}
