import { Form } from "@remix-run/react";
import { Save, ChevronLeft , Gauge } from "lucide-react";
import { useState, useEffect } from "react";

import { ThresholdsImpact } from "~/components/thresholds/ThresholdsImpact";
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
import { type Repository, type Test } from "~/types/cypress";

interface ThresholdsFormProps {
  repository: Repository;
  selectedRepo: string;
  tests: Test[];
  actionData?: {
    errors?: Record<string, string>;
    values?: {
      flakeThreshold?: number;
      failureThreshold?: number;
    };
  };
  onChange?: {
    flakeThreshold: (value: number) => void;
    failureThreshold: (value: number) => void;
  };
}

export function ThresholdsForm({
  repository,
  selectedRepo,
  tests,
  actionData,
  onChange,
}: ThresholdsFormProps) {
  const [flakeThreshold, setFlakeThreshold] = useState(
    actionData?.values?.flakeThreshold ?? repository.flakeThreshold,
  );

  const [failureThreshold, setFailureThreshold] = useState(
    actionData?.values?.failureThreshold ?? repository.failureThreshold,
  );

  // Update state when repository or actionData changes
  useEffect(() => {
    setFlakeThreshold(
      actionData?.values?.flakeThreshold ?? repository.flakeThreshold,
    );
    setFailureThreshold(
      actionData?.values?.failureThreshold ?? repository.failureThreshold,
    );
  }, [repository, actionData]);

  // Handler for flake threshold changes
  const handleFlakeThresholdChange = (value: number) => {
    setFlakeThreshold(value);
    if (onChange?.flakeThreshold) {
      onChange.flakeThreshold(value);
    }
  };

  // Handler for failure threshold changes
  const handleFailureThresholdChange = (value: number) => {
    setFailureThreshold(value);
    if (onChange?.failureThreshold) {
      onChange.failureThreshold(value);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Gauge className="text-primary h-5 w-5" />
          <CardTitle>Threshold Settings</CardTitle>
        </div>
        <CardDescription>
          Tests that exceed these thresholds will be automatically excluded from
          test runs. Configure these thresholds carefully to balance test
          reliability with coverage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Impact Preview Section */}
        <div
          className={`border-muted rounded-lg border p-4 ${
            flakeThreshold !== repository.flakeThreshold ||
            failureThreshold !== repository.failureThreshold
              ? "bg-amber-50 dark:bg-amber-950/20"
              : "bg-muted/5"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`h-6 w-6 rounded-full p-1 ${
                flakeThreshold !== repository.flakeThreshold ||
                failureThreshold !== repository.failureThreshold
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-primary/10"
              }`}
            >
              <div
                className={`h-full w-full rounded-full ${
                  flakeThreshold !== repository.flakeThreshold ||
                  failureThreshold !== repository.failureThreshold
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="text-base font-medium">Impact Preview</h3>
              <p className="text-muted-foreground text-xs">
                {flakeThreshold !== repository.flakeThreshold ||
                failureThreshold !== repository.failureThreshold
                  ? "Preview of your threshold changes"
                  : "See how threshold changes will affect your tests"}
              </p>
            </div>
          </div>

          <ThresholdsImpact
            tests={tests}
            currentFlakeThreshold={repository.flakeThreshold}
            currentFailureThreshold={repository.failureThreshold}
            newFlakeThreshold={flakeThreshold}
            newFailureThreshold={failureThreshold}
          />
        </div>

        <Form method="post" className="space-y-6" id="thresholds-form">
          <input type="hidden" name="repoId" value={selectedRepo} />

          <div className="grid gap-6 md:grid-cols-2">
            <ThresholdInput
              id="flakeThreshold"
              label="Flake Rate Threshold (%)"
              value={flakeThreshold}
              error={actionData?.errors?.flakeThreshold}
              onChange={handleFlakeThresholdChange}
              description="Tests with a flake rate above this percentage will be automatically excluded."
              help="Flaky tests fail intermittently and can slow down development."
              recommendation={getFlakeRecommendation(repository.testCount)}
            />

            <ThresholdInput
              id="failureThreshold"
              label="Failure Rate Threshold (%)"
              value={failureThreshold}
              error={actionData?.errors?.failureThreshold}
              onChange={handleFailureThresholdChange}
              description="Tests with a failure rate above this percentage will be automatically excluded."
              help="Consistently failing tests may indicate real issues in your code."
              recommendation={getFailureRecommendation(repository.testCount)}
            />
          </div>

          <div className="bg-muted/50 space-y-3 rounded-md border p-4">
            <h3 className="font-medium">
              What happens when a test is excluded?
            </h3>
            <p className="text-muted-foreground text-sm">
              When a test is excluded, it won't run during your CI pipeline.
              This helps maintain reliable builds while you investigate and fix
              the root causes of flakiness or failures.
            </p>
            <p className="text-muted-foreground text-sm">
              You can manually override these settings for individual tests from
              the dashboard.
            </p>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-3 border-t px-6 py-4">
        <Button variant="outline" asChild>
          <a
            href={`/dashboard?repo=${selectedRepo}`}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </a>
        </Button>
        <Button type="submit" form="thresholds-form">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ThresholdInputProps {
  id: string;
  label: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
  description: string;
  help?: string;
  recommendation?: {
    value: number;
    description: string;
  };
}

function ThresholdInput({
  id,
  label,
  value,
  error,
  onChange,
  description,
  help,
  recommendation,
}: ThresholdInputProps) {
  // Get the original value from the repository, not the recommendation
  const originalValue = recommendation?.value || 0;
  const hasChanged = value !== originalValue;

  // Handle number input changes with better validation
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
        {hasChanged ? <span className="ml-2 text-xs text-amber-500">
            (changed from {originalValue}%)
          </span> : null}
      </Label>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          id={id}
          name={id}
          min="0"
          max="100"
          value={value}
          onChange={handleInputChange}
          className={`${error ? "border-destructive" : ""} ${
            hasChanged
              ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/10"
              : ""
          }`}
        />

        <span className="text-lg font-medium">%</span>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <p className="text-muted-foreground text-sm">{description}</p>

      {help ? <p className="text-muted-foreground text-xs">{help}</p> : null}

      {recommendation ? <div className="bg-primary/5 border-primary/10 mt-2 rounded-md border p-2 text-xs">
          <span className="font-medium">Recommendation:</span>{" "}
          {recommendation.value}% - {recommendation.description}
        </div> : null}
    </div>
  );
}

// Helper functions for threshold recommendations
function getFlakeRecommendation(testCount: number): {
  value: number;
  description: string;
} {
  if (testCount < 20) {
    return {
      value: 3,
      description:
        "For smaller test suites, keep a low threshold to catch flakiness early.",
    };
  } else if (testCount < 50) {
    return {
      value: 5,
      description:
        "A moderate threshold works well for medium-sized test suites.",
    };
  } else {
    return {
      value: 8,
      description:
        "For larger test suites, a slightly higher threshold helps focus on the most problematic tests.",
    };
  }
}

function getFailureRecommendation(testCount: number): {
  value: number;
  description: string;
} {
  if (testCount < 20) {
    return {
      value: 8,
      description:
        "For smaller test suites, investigate tests that fail more than 8% of the time.",
    };
  } else if (testCount < 50) {
    return {
      value: 10,
      description:
        "A moderate threshold works well for medium-sized test suites.",
    };
  } else {
    return {
      value: 15,
      description:
        "For larger test suites, focus on the most consistently failing tests first.",
    };
  }
}
