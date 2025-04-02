import { useReducer } from "react";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";

import { PageHeader } from "~/components/page-header";
import { MetricsSlideOver } from "~/components/thresholds/MetricsSlideOver";
import { ThresholdsForm } from "~/components/thresholds/ThresholdsForm";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";
  const timePeriod = url.searchParams.get("timePeriod") || "30d";

  const repositories = await prisma.repository.findMany();
  const repository = await prisma.repository.findUnique({
    where: { id: selectedRepo },
  });
  if (!repository) {
    throw new Response("Repository not found", { status: 404 });
  }

  // Get all tests to show the impact of threshold changes, filtered by time period
  const tests = await prisma.test.findMany({
    where: { repositoryId: selectedRepo },
  });

  return {
    repository,
    repositories,
    selectedRepo,
    tests,
    timePeriod,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

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
    return {
      errors,
      values: { flakeThreshold, failureThreshold, timePeriod },
    };
  }

  // Update the repository thresholds
  await prisma.repository.update({
    where: { id: repoId },
    data: {
      flakeThreshold,
      failureThreshold,
      timePeriod,
    },
  });

  // Include timePeriod in the redirect URL
  return redirect(`/dashboard?repo=${repoId}&timePeriod=${timePeriod}`);
}

// Define the state type and action types for our reducer
interface ThresholdsState {
  flakeThreshold: number;
  failureThreshold: number;
  timePeriod: string;
}

type ThresholdsAction =
  | { type: "SET_FLAKE_THRESHOLD"; payload: number }
  | { type: "SET_FAILURE_THRESHOLD"; payload: number }
  | { type: "SET_TIME_PERIOD"; payload: string }
  | { type: "RESET"; payload: ThresholdsState };

// Create the reducer function
function thresholdsReducer(
  state: ThresholdsState,
  action: ThresholdsAction,
): ThresholdsState {
  switch (action.type) {
    case "SET_FLAKE_THRESHOLD":
      return { ...state, flakeThreshold: action.payload };
    case "SET_FAILURE_THRESHOLD":
      return { ...state, failureThreshold: action.payload };
    case "SET_TIME_PERIOD":
      return { ...state, timePeriod: action.payload };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

export default function Thresholds() {
  const { repository, selectedRepo, tests, timePeriod } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Initialize state with repository data
  const initialState: ThresholdsState = {
    flakeThreshold: repository?.flakeThreshold || 0,
    failureThreshold: repository?.failureThreshold || 0,
    timePeriod: timePeriod || repository?.timePeriod || "30d",
  };

  const [thresholds, dispatch] = useReducer(thresholdsReducer, initialState);

  // Define handler functions for the ThresholdsForm component
  const handleThresholdChange = {
    flakeThreshold: (value: number) =>
      dispatch({ type: "SET_FLAKE_THRESHOLD", payload: value }),
    failureThreshold: (value: number) =>
      dispatch({ type: "SET_FAILURE_THRESHOLD", payload: value }),
    timePeriod: (value: string) =>
      dispatch({ type: "SET_TIME_PERIOD", payload: value }),
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
          onChange={handleThresholdChange}
          thresholdValues={thresholds}
        />
      </div>
    </div>
  );
}
