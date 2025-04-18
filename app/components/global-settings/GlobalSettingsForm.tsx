import { Repository } from "@prisma/client";
import { Save, ChevronLeft, Gauge, InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Form } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type GlobalSettings } from "~/routes/global-settings";

interface GlobalSettingsFormProps {
  globalSettings: GlobalSettings;
  repositories: Repository[];
  actionData?: {
    errors?: Record<string, string>;
    values?: Partial<GlobalSettings>;
  };
}

export function GlobalSettingsForm({
  globalSettings,
  repositories,
  actionData,
}: GlobalSettingsFormProps) {
  // Create state values for each flake recommendation
  const [smallFlakeThreshold, setSmallFlakeThreshold] = useState(
    actionData?.values?.flakeRecommendations?.small?.threshold ??
      globalSettings.flakeRecommendations.small.threshold,
  );

  const [mediumFlakeThreshold, setMediumFlakeThreshold] = useState(
    actionData?.values?.flakeRecommendations?.medium?.threshold ??
      globalSettings.flakeRecommendations.medium.threshold,
  );

  const [largeFlakeThreshold, setLargeFlakeThreshold] = useState(
    actionData?.values?.flakeRecommendations?.large?.threshold ??
      globalSettings.flakeRecommendations.large.threshold,
  );

  // Create state values for each failure recommendation
  const [smallFailureThreshold, setSmallFailureThreshold] = useState(
    actionData?.values?.failureRecommendations?.small?.threshold ??
      globalSettings.failureRecommendations.small.threshold,
  );

  const [mediumFailureThreshold, setMediumFailureThreshold] = useState(
    actionData?.values?.failureRecommendations?.medium?.threshold ??
      globalSettings.failureRecommendations.medium.threshold,
  );

  const [largeFailureThreshold, setLargeFailureThreshold] = useState(
    actionData?.values?.failureRecommendations?.large?.threshold ??
      globalSettings.failureRecommendations.large.threshold,
  );

  // Create state values for descriptions
  const [smallFlakeDescription, setSmallFlakeDescription] = useState(
    actionData?.values?.flakeRecommendations?.small?.description ??
      globalSettings.flakeRecommendations.small.description,
  );

  const [mediumFlakeDescription, setMediumFlakeDescription] = useState(
    actionData?.values?.flakeRecommendations?.medium?.description ??
      globalSettings.flakeRecommendations.medium.description,
  );

  const [largeFlakeDescription, setLargeFlakeDescription] = useState(
    actionData?.values?.flakeRecommendations?.large?.description ??
      globalSettings.flakeRecommendations.large.description,
  );

  const [smallFailureDescription, setSmallFailureDescription] = useState(
    actionData?.values?.failureRecommendations?.small?.description ??
      globalSettings.failureRecommendations.small.description,
  );

  const [mediumFailureDescription, setMediumFailureDescription] = useState(
    actionData?.values?.failureRecommendations?.medium?.description ??
      globalSettings.failureRecommendations.medium.description,
  );

  const [largeFailureDescription, setLargeFailureDescription] = useState(
    actionData?.values?.failureRecommendations?.large?.description ??
      globalSettings.failureRecommendations.large.description,
  );

  // Create state values for guardrails
  const [maxExcludedTests, setMaxExcludedTests] = useState(
    actionData?.values?.guardrails?.maxExcludedTests ??
      globalSettings.guardrails.maxExcludedTests,
  );

  const [maxExcludedTestsPercentage, setMaxExcludedTestsPercentage] = useState(
    actionData?.values?.guardrails?.maxExcludedTestsPercentage ??
      globalSettings.guardrails.maxExcludedTestsPercentage,
  );

  const [requireJiraTicket, setRequireJiraTicket] = useState(
    actionData?.values?.guardrails?.requireJiraTicket ??
      globalSettings.guardrails.requireJiraTicket,
  );

  // Add state values for repo size thresholds
  const [smallRepoThreshold, setSmallRepoThreshold] = useState(
    actionData?.values?.repoSizeThresholds?.small ??
      globalSettings.repoSizeThresholds.small,
  );

  const [mediumRepoThreshold, setMediumRepoThreshold] = useState(
    actionData?.values?.repoSizeThresholds?.medium ??
      globalSettings.repoSizeThresholds.medium,
  );

  // Define the activeTab as a state with union type
  const [activeTab, setActiveTab] = useState<
    "recommendations" | "guardrails" | "repoSizes"
  >("recommendations");

  // Update state when global settings or actionData changes
  useEffect(() => {
    // Update flake recommendation states
    setSmallFlakeThreshold(
      actionData?.values?.flakeRecommendations?.small?.threshold ??
        globalSettings.flakeRecommendations.small.threshold,
    );
    setMediumFlakeThreshold(
      actionData?.values?.flakeRecommendations?.medium?.threshold ??
        globalSettings.flakeRecommendations.medium.threshold,
    );
    setLargeFlakeThreshold(
      actionData?.values?.flakeRecommendations?.large?.threshold ??
        globalSettings.flakeRecommendations.large.threshold,
    );

    // Update failure recommendation states
    setSmallFailureThreshold(
      actionData?.values?.failureRecommendations?.small?.threshold ??
        globalSettings.failureRecommendations.small.threshold,
    );
    setMediumFailureThreshold(
      actionData?.values?.failureRecommendations?.medium?.threshold ??
        globalSettings.failureRecommendations.medium.threshold,
    );
    setLargeFailureThreshold(
      actionData?.values?.failureRecommendations?.large?.threshold ??
        globalSettings.failureRecommendations.large.threshold,
    );

    // Update description states
    setSmallFlakeDescription(
      actionData?.values?.flakeRecommendations?.small?.description ??
        globalSettings.flakeRecommendations.small.description,
    );
    setMediumFlakeDescription(
      actionData?.values?.flakeRecommendations?.medium?.description ??
        globalSettings.flakeRecommendations.medium.description,
    );
    setLargeFlakeDescription(
      actionData?.values?.flakeRecommendations?.large?.description ??
        globalSettings.flakeRecommendations.large.description,
    );
    setSmallFailureDescription(
      actionData?.values?.failureRecommendations?.small?.description ??
        globalSettings.failureRecommendations.small.description,
    );
    setMediumFailureDescription(
      actionData?.values?.failureRecommendations?.medium?.description ??
        globalSettings.failureRecommendations.medium.description,
    );
    setLargeFailureDescription(
      actionData?.values?.failureRecommendations?.large?.description ??
        globalSettings.failureRecommendations.large.description,
    );

    // Update repo size threshold states
    setSmallRepoThreshold(
      actionData?.values?.repoSizeThresholds?.small ??
        globalSettings.repoSizeThresholds.small,
    );
    setMediumRepoThreshold(
      actionData?.values?.repoSizeThresholds?.medium ??
        globalSettings.repoSizeThresholds.medium,
    );

    // Update guardrail states
    setMaxExcludedTests(
      actionData?.values?.guardrails?.maxExcludedTests ??
        globalSettings.guardrails.maxExcludedTests,
    );
    setMaxExcludedTestsPercentage(
      actionData?.values?.guardrails?.maxExcludedTestsPercentage ??
        globalSettings.guardrails.maxExcludedTestsPercentage,
    );
    setRequireJiraTicket(
      actionData?.values?.guardrails?.requireJiraTicket ??
        globalSettings.guardrails.requireJiraTicket,
    );
  }, [globalSettings, actionData]);

  // Check if recommendations have changed from original values
  const recommendationsChanged =
    smallFlakeThreshold !==
      globalSettings.flakeRecommendations.small.threshold ||
    mediumFlakeThreshold !==
      globalSettings.flakeRecommendations.medium.threshold ||
    largeFlakeThreshold !==
      globalSettings.flakeRecommendations.large.threshold ||
    smallFailureThreshold !==
      globalSettings.failureRecommendations.small.threshold ||
    mediumFailureThreshold !==
      globalSettings.failureRecommendations.medium.threshold ||
    largeFailureThreshold !==
      globalSettings.failureRecommendations.large.threshold;

  // Add description constants for thresholds
  const flakeDescriptions = {
    small:
      "For smaller test suites, keep a low threshold to catch flakiness early.",
    medium: "A moderate threshold works well for medium-sized test suites.",
    large:
      "For larger test suites, a slightly higher threshold helps focus on the most problematic tests.",
  };

  const failureDescriptions = {
    small:
      "For smaller test suites, investigate tests that fail more than 8% of the time.",
    medium: "A moderate threshold works well for medium-sized test suites.",
    large:
      "For larger test suites, focus on the most consistently failing tests first.",
  };

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Gauge className="text-primary h-5 w-5" />
          <CardTitle>Global Flake Management Settings</CardTitle>
        </div>
        <CardDescription>
          Configure default threshold recommendations and guardrails that apply
          globally to all repositories. Individual repositories can still be
          configured with custom thresholds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Custom Tab UI */}
        <div className="border-b">
          <div className="flex">
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "recommendations"
                  ? "border-primary text-primary border-b-2"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("recommendations")}
            >
              Threshold Recommendations
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "repoSizes"
                  ? "border-primary text-primary border-b-2"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("repoSizes")}
            >
              Repository Sizes
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "guardrails"
                  ? "border-primary text-primary border-b-2"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("guardrails")}
            >
              Exclusion Guardrails
            </button>
          </div>
        </div>

        <Form method="post" className="space-y-6" id="global-settings-form">
          {/* Hidden inputs for descriptions */}
          <input
            type="hidden"
            name="smallFlakeDescription"
            value={flakeDescriptions.small}
          />
          <input
            type="hidden"
            name="mediumFlakeDescription"
            value={flakeDescriptions.medium}
          />
          <input
            type="hidden"
            name="largeFlakeDescription"
            value={flakeDescriptions.large}
          />
          <input
            type="hidden"
            name="smallFailureDescription"
            value={failureDescriptions.small}
          />
          <input
            type="hidden"
            name="mediumFailureDescription"
            value={failureDescriptions.medium}
          />
          <input
            type="hidden"
            name="largeFailureDescription"
            value={failureDescriptions.large}
          />

          {/* Recommendations Tab Content */}
          {activeTab === "recommendations" ? <div className="space-y-6">
              {/* Impact Preview Section */}
              <div
                className={`border-muted rounded-lg border p-4 ${
                  recommendationsChanged
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : "bg-muted/5"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full p-1 ${
                      recommendationsChanged
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-primary/10"
                    }`}
                  >
                    <div
                      className={`h-full w-full rounded-full ${
                        recommendationsChanged ? "bg-amber-500" : "bg-primary"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">
                      Recommendations Impact
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {recommendationsChanged
                        ? "Preview of your recommendation changes across all repositories"
                        : "See how recommendation changes will affect your repositories"}
                    </p>
                  </div>
                </div>

                {/* Simple impact preview */}
                <div className="mt-4 space-y-4">
                  <div className="rounded-md border p-3">
                    <h4 className="text-sm font-medium">Impact Summary</h4>
                    <p className="text-muted-foreground text-sm">
                      {recommendationsChanged
                        ? "These changes would affect how thresholds are recommended for new repositories and when using the 'reset to defaults' option."
                        : "Change the threshold values to see the impact on repository recommendations."}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md border p-3">
                      <p className="text-sm font-medium">Small Repositories</p>
                      <div className="mt-1 text-sm">
                        <div>
                          Flake:{" "}
                          <span className="font-medium">
                            {smallFlakeThreshold}%
                          </span>
                        </div>
                        <div>
                          Failure:{" "}
                          <span className="font-medium">
                            {smallFailureThreshold}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-3">
                      <p className="text-sm font-medium">Medium Repositories</p>
                      <div className="mt-1 text-sm">
                        <div>
                          Flake:{" "}
                          <span className="font-medium">
                            {mediumFlakeThreshold}%
                          </span>
                        </div>
                        <div>
                          Failure:{" "}
                          <span className="font-medium">
                            {mediumFailureThreshold}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-3">
                      <p className="text-sm font-medium">Large Repositories</p>
                      <div className="mt-1 text-sm">
                        <div>
                          Flake:{" "}
                          <span className="font-medium">
                            {largeFlakeThreshold}%
                          </span>
                        </div>
                        <div>
                          Failure:{" "}
                          <span className="font-medium">
                            {largeFailureThreshold}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flake Rate Recommendations Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">
                  Flake Rate Recommendations
                </h2>
                <p className="text-muted-foreground text-sm">
                  Configure the default flake rate threshold recommendations
                  based on test suite size. These values will be recommended
                  when setting up a new repository.
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                  <ThresholdInput
                    id="smallFlakeThreshold"
                    name="smallFlakeThreshold"
                    label="Small Test Suites"
                    description={`For repositories with fewer than ${smallRepoThreshold} tests`}
                    value={smallFlakeThreshold}
                    error={actionData?.errors?.smallFlakeThreshold}
                    onChange={setSmallFlakeThreshold}
                    infoText={flakeDescriptions.small}
                  />

                  <ThresholdInput
                    id="mediumFlakeThreshold"
                    name="mediumFlakeThreshold"
                    label="Medium Test Suites"
                    description={`For repositories with ${smallRepoThreshold}-${mediumRepoThreshold} tests`}
                    value={mediumFlakeThreshold}
                    error={actionData?.errors?.mediumFlakeThreshold}
                    onChange={setMediumFlakeThreshold}
                    infoText={flakeDescriptions.medium}
                  />

                  <ThresholdInput
                    id="largeFlakeThreshold"
                    name="largeFlakeThreshold"
                    label="Large Test Suites"
                    description={`For repositories with more than ${mediumRepoThreshold} tests`}
                    value={largeFlakeThreshold}
                    error={actionData?.errors?.largeFlakeThreshold}
                    onChange={setLargeFlakeThreshold}
                    infoText={flakeDescriptions.large}
                  />
                </div>
              </div>

              {/* Failure Rate Recommendations Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">
                  Failure Rate Recommendations
                </h2>
                <p className="text-muted-foreground text-sm">
                  Configure the default failure rate threshold recommendations
                  based on test suite size. These values will be recommended
                  when setting up a new repository.
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                  <ThresholdInput
                    id="smallFailureThreshold"
                    name="smallFailureThreshold"
                    label="Small Test Suites"
                    description={`For repositories with fewer than ${smallRepoThreshold} tests`}
                    value={smallFailureThreshold}
                    error={actionData?.errors?.smallFailureThreshold}
                    onChange={setSmallFailureThreshold}
                    infoText={failureDescriptions.small}
                  />

                  <ThresholdInput
                    id="mediumFailureThreshold"
                    name="mediumFailureThreshold"
                    label="Medium Test Suites"
                    description={`For repositories with ${smallRepoThreshold}-${mediumRepoThreshold} tests`}
                    value={mediumFailureThreshold}
                    error={actionData?.errors?.mediumFailureThreshold}
                    onChange={setMediumFailureThreshold}
                    infoText={failureDescriptions.medium}
                  />

                  <ThresholdInput
                    id="largeFailureThreshold"
                    name="largeFailureThreshold"
                    label="Large Test Suites"
                    description={`For repositories with more than ${mediumRepoThreshold} tests`}
                    value={largeFailureThreshold}
                    error={actionData?.errors?.largeFailureThreshold}
                    onChange={setLargeFailureThreshold}
                    infoText={failureDescriptions.large}
                  />
                </div>
              </div>
            </div> : null}

          {/* Add Repository Sizes Tab Content */}
          {activeTab === "repoSizes" ? <div className="space-y-6">
              <div className="border-muted bg-muted/5 rounded-lg border p-4">
                <h2 className="text-lg font-semibold">
                  Repository Size Configuration
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Configure the thresholds that determine whether a repository
                  is considered small, medium, or large. These values affect
                  which recommendations are applied to repositories based on
                  their test count.
                </p>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="smallRepoThreshold" className="text-base">
                      Small Repository Threshold
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        id="smallRepoThreshold"
                        name="smallRepoThreshold"
                        min="1"
                        value={smallRepoThreshold}
                        onChange={(e) =>
                          setSmallRepoThreshold(Number(e.target.value))
                        }
                        className={
                          actionData?.errors?.smallRepoThreshold
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <span className="text-lg font-medium">tests</span>
                    </div>
                    {actionData?.errors?.smallRepoThreshold ? (
                      <p className="text-destructive text-sm">
                        {actionData.errors.smallRepoThreshold}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-sm">
                      Repositories with fewer than this number of tests are
                      considered small.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="mediumRepoThreshold" className="text-base">
                      Medium Repository Threshold
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        id="mediumRepoThreshold"
                        name="mediumRepoThreshold"
                        min="1"
                        value={mediumRepoThreshold}
                        onChange={(e) =>
                          setMediumRepoThreshold(Number(e.target.value))
                        }
                        className={
                          actionData?.errors?.mediumRepoThreshold
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <span className="text-lg font-medium">tests</span>
                    </div>
                    {actionData?.errors?.mediumRepoThreshold ? (
                      <p className="text-destructive text-sm">
                        {actionData.errors.mediumRepoThreshold}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-sm">
                      Repositories with test count between the small threshold
                      and this number are considered medium. Anything above this
                      is large.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 mt-6 space-y-2 rounded-md border p-4">
                  <h3 className="text-sm font-medium">
                    Repository Size Classification
                  </h3>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>
                      • <strong>Small:</strong> Fewer than {smallRepoThreshold}{" "}
                      tests
                    </li>
                    <li>
                      • <strong>Medium:</strong> Between {smallRepoThreshold}{" "}
                      and {mediumRepoThreshold} tests
                    </li>
                    <li>
                      • <strong>Large:</strong> More than {mediumRepoThreshold}{" "}
                      tests
                    </li>
                  </ul>
                </div>

                <div className="mt-6 rounded-md border bg-blue-50 p-4 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="mt-1 h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">
                        How Repository Sizes Affect Recommendations
                      </h4>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                        These settings determine which threshold recommendations
                        apply to each repository based on its test count.
                        Changing these values will update the descriptions in
                        the threshold recommendations tab to reflect the new
                        size ranges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div> : null}

          {/* Guardrails Tab Content */}
          {activeTab === "guardrails" ? <div className="space-y-6">
              <h2 className="text-lg font-semibold">Exclusion Guardrails</h2>
              <p className="text-muted-foreground text-sm">
                Configure guardrails to prevent excessive test exclusion and
                enforce best practices. These guardrails apply to all
                repositories.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="maxExcludedTests" className="text-base">
                    Maximum Excluded Tests
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="maxExcludedTests"
                      name="maxExcludedTests"
                      min="0"
                      value={maxExcludedTests}
                      onChange={(e) =>
                        setMaxExcludedTests(Number(e.target.value))
                      }
                      className={
                        actionData?.errors?.maxExcludedTests
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <span className="text-lg font-medium">tests</span>
                  </div>
                  {actionData?.errors?.maxExcludedTests ? (
                    <p className="text-destructive text-sm">
                      {actionData.errors.maxExcludedTests}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-sm">
                    The maximum number of tests that can be excluded per
                    repository.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="maxExcludedTestsPercentage"
                    className="text-base"
                  >
                    Maximum Excluded Tests (%)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="maxExcludedTestsPercentage"
                      name="maxExcludedTestsPercentage"
                      min="0"
                      max="100"
                      value={maxExcludedTestsPercentage}
                      onChange={(e) =>
                        setMaxExcludedTestsPercentage(Number(e.target.value))
                      }
                      className={
                        actionData?.errors?.maxExcludedTestsPercentage
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <span className="text-lg font-medium">%</span>
                  </div>
                  {actionData?.errors?.maxExcludedTestsPercentage ? (
                    <p className="text-destructive text-sm">
                      {actionData.errors.maxExcludedTestsPercentage}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-sm">
                    The maximum percentage of tests that can be excluded per
                    repository.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-muted h-4 w-10 cursor-pointer rounded-full">
                    <div
                      className={`h-4 w-4 transform rounded-full transition-transform ${
                        requireJiraTicket
                          ? "bg-primary translate-x-6"
                          : "bg-muted-foreground translate-x-0"
                      }`}
                      onClick={() => setRequireJiraTicket(!requireJiraTicket)}
                    ></div>
                  </div>
                  <Label
                    htmlFor="requireJiraTicket"
                    className="cursor-pointer text-base"
                    onClick={() => setRequireJiraTicket(!requireJiraTicket)}
                  >
                    Require JIRA Ticket for Manual Exclusions
                  </Label>
                </div>
                <p className="text-muted-foreground pl-12 text-sm">
                  When enabled, a JIRA ticket must be created and linked when
                  manually excluding a test. This helps track exclusions and
                  ensures they are addressed eventually.
                </p>

                <input
                  type="hidden"
                  name="requireJiraTicket"
                  value={requireJiraTicket.toString()}
                />
              </div>

              <div className="bg-muted/50 space-y-3 rounded-md border p-4">
                <h3 className="font-medium">How guardrails work</h3>
                <p className="text-muted-foreground text-sm">
                  These guardrails prevent teams from excluding too many tests
                  which could hide real issues. When a repository exceeds these
                  guardrails, users will be prompted to fix the flaky tests
                  before excluding more.
                </p>
                <p className="text-muted-foreground text-sm">
                  The system will enforce the more restrictive of the two limits
                  (absolute count or percentage).
                </p>
              </div>
            </div> : null}
        </Form>
      </CardContent>

      <CardFooter className="flex justify-end space-x-3 border-t px-6 py-4">
        <Button variant="outline" asChild>
          <a href={`/dashboard`} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </a>
        </Button>
        <Button type="submit" form="global-settings-form">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ThresholdInputProps {
  id: string;
  name: string;
  label: string;
  description: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
  infoText?: string;
}

function ThresholdInput({
  id,
  name,
  label,
  description,
  value,
  error,
  onChange,
  infoText,
}: ThresholdInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          id={id}
          name={name}
          min="0"
          max="100"
          value={value}
          onChange={handleInputChange}
          className={error ? "border-destructive" : ""}
        />
        <span className="text-lg font-medium">%</span>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <p className="text-muted-foreground text-sm">{description}</p>

      {infoText ? <div className="bg-muted/50 mt-2 flex items-start gap-2 rounded-md p-2">
          <InfoIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
          <p className="text-muted-foreground text-xs">{infoText}</p>
        </div> : null}
    </div>
  );
}
