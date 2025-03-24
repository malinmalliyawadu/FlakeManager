import { Link } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { type Repository } from "~/types/cypress";
import { AlertTriangle, Gauge, Settings } from "lucide-react";

interface ThresholdsCardProps {
  repository: Repository | null;
  selectedRepo: string;
}

export function ThresholdsCard({
  repository,
  selectedRepo,
}: ThresholdsCardProps) {
  const flakeThreshold = repository?.flakeThreshold || 5;
  const failureThreshold = repository?.failureThreshold || 10;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="text-primary h-5 w-5" />
            <CardTitle>Current Thresholds</CardTitle>
          </div>
          {needsAttention(flakeThreshold, failureThreshold) && (
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">Review recommended</span>
            </div>
          )}
        </div>
        <CardDescription>
          Tests that exceed these thresholds are automatically excluded from
          your CI pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <ThresholdItem
            label="Flake Threshold"
            value={`${flakeThreshold}%`}
            description="Tests with flakiness above this threshold are excluded"
            status={getThresholdStatus(flakeThreshold, "flake")}
          />
          <ThresholdItem
            label="Failure Threshold"
            value={`${failureThreshold}%`}
            description="Tests with failure rate above this threshold are excluded"
            status={getThresholdStatus(failureThreshold, "failure")}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t px-6 py-4">
        <Button asChild variant="outline">
          <Link to={`/thresholds?repo=${selectedRepo}`}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Thresholds
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ThresholdItemProps {
  label: string;
  value: string;
  description: string;
  status: "default" | "warning" | "critical";
}

function ThresholdItem({
  label,
  value,
  description,
  status,
}: ThresholdItemProps) {
  const statusColors = {
    default:
      "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    warning:
      "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    critical: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-semibold">{value}</div>
        <div
          className={`rounded-md px-2 py-1 text-xs font-medium ${statusColors[status]}`}
        >
          {status === "default"
            ? "Good"
            : status === "warning"
              ? "Review"
              : "High"}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

// Helper functions
function getThresholdStatus(
  value: number,
  type: "flake" | "failure",
): "default" | "warning" | "critical" {
  if (type === "flake") {
    if (value < 3) return "default";
    if (value < 7) return "warning";
    return "critical";
  } else {
    if (value < 8) return "default";
    if (value < 15) return "warning";
    return "critical";
  }
}

function needsAttention(flake: number, failure: number): boolean {
  return (
    getThresholdStatus(flake, "flake") !== "default" ||
    getThresholdStatus(failure, "failure") !== "default"
  );
}
