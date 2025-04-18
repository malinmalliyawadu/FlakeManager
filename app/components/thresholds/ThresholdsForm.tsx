import { Repository, Test } from "@prisma/client";
import { Save, ChevronLeft, Gauge, CalendarRange } from "lucide-react";
import { Form, useNavigate } from "react-router";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ThresholdsFormProps {
  repository: Repository;
  selectedRepo: string;
  tests: Test[];
  actionData?: {
    errors?: Record<string, string>;
    values?: {
      flakeThreshold?: number;
      failureThreshold?: number;
      timePeriod?: string;
    };
  };
  onChange?: {
    flakeThreshold: (value: number) => void;
    failureThreshold: (value: number) => void;
    timePeriod?: (value: string) => void;
  };
  thresholdValues?: {
    flakeThreshold?: number;
    failureThreshold?: number;
    timePeriod?: string;
  };
}

export function ThresholdsForm({
  repository,
  selectedRepo,
  tests,
  actionData,
  onChange,
  thresholdValues,
}: ThresholdsFormProps) {
  const flakeThreshold = thresholdValues?.flakeThreshold ?? 0;
  const failureThreshold = thresholdValues?.failureThreshold ?? 0;
  const timePeriod = thresholdValues?.timePeriod ?? "30d";

  // Handler for flake threshold changes
  const handleFlakeThresholdChange = (value: number) => {
    if (onChange?.flakeThreshold) {
      onChange.flakeThreshold(value);
    }
  };

  // Handler for failure threshold changes
  const handleFailureThresholdChange = (value: number) => {
    if (onChange?.failureThreshold) {
      onChange.failureThreshold(value);
    }
  };

  // Handler for time period changes
  const handleTimePeriodChange = (value: string) => {
    if (onChange?.timePeriod) {
      onChange.timePeriod(value);
    }
  };

  const navigate = useNavigate();

  return (
    <Card className="shadow-xs">
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
          <input type="hidden" name="timePeriod" value={timePeriod} />

          <div className="grid gap-6 md:grid-cols-3">
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

            <TimePeriodInput
              id="timePeriod"
              label="Analysis Time Period"
              value={timePeriod}
              error={actionData?.errors?.timePeriod}
              onChange={handleTimePeriodChange}
              description="Select the time period for calculating test metrics and applying thresholds."
              help="Shorter periods show recent trends while longer periods provide historical context."
            />
          </div>

          <div className="bg-muted/50 space-y-3 rounded-md border p-4">
            <h3 className="font-medium">
              What happens when a test is excluded?
            </h3>
            <p className="text-muted-foreground text-sm">
              When a test is excluded, it won&apos;t run during your CI
              pipeline. This helps maintain reliable builds while you
              investigate and fix the root causes of flakiness or failures.
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
        {hasChanged ? (
          <span className="ml-2 text-xs text-amber-500">
            (changed from {originalValue}%)
          </span>
        ) : null}
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

      {recommendation ? (
        <div className="border-primary/10 bg-primary/5 mt-2 rounded-md border p-2 text-xs">
          <span className="font-medium">Recommendation:</span>{" "}
          {recommendation.value}% - {recommendation.description}
        </div>
      ) : null}
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

interface TimePeriodInputProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  description: string;
  help?: string;
}

function TimePeriodInput({
  id,
  label,
  value,
  error,
  onChange,
  description,
  help,
}: TimePeriodInputProps) {
  const options = [
    { value: "7d", label: "Last 7 days" },
    { value: "14d", label: "Last 14 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  const navigate = useNavigate();

  const handleValueChange = (newValue: string) => {
    onChange(newValue);

    // Update the URL with the new time period to get updated test data
    const url = new URL(window.location.href);
    url.searchParams.set("timePeriod", newValue);
    navigate(url.toString(), { replace: true });
  };

  // Find the current selected period for display
  const selectedOption =
    options.find((option) => option.value === value)?.label ||
    "Select time period";

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>

      <div>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger
            id={id}
            className={`flex items-center ${error ? "border-destructive" : ""}`}
          >
            <div className="flex items-center gap-2">
              <CalendarRange className="text-muted-foreground h-4 w-4" />
              <SelectValue placeholder="Select time period" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <p className="text-muted-foreground text-sm">{description}</p>

      {help ? <p className="text-muted-foreground text-xs">{help}</p> : null}

      <div className="border-primary/10 bg-primary/5 mt-2 rounded-md border p-2 text-xs">
        <span className="font-medium">Note:</span> Changing the time period
        affects which test data is considered when applying thresholds.
      </div>
    </div>
  );
}
