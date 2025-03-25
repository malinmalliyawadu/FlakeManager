import { LineChart, BarChart4 } from "lucide-react";
import { useState } from "react";

import { TrendVisualizer } from "~/components/thresholds/TrendVisualizer";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { type Repository, type Test } from "~/types/cypress";

interface MetricsSlideOverProps {
  repository: Repository;
  tests: Test[];
  flakeThreshold: number;
  failureThreshold: number;
}

export function MetricsSlideOver({
  repository,
  tests,
  flakeThreshold,
  failureThreshold,
}: MetricsSlideOverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BarChart4 className="h-4 w-4" />
          <span>View Metrics Visualization</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-3xl overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <LineChart className="text-primary h-5 w-5" />
            Test Metrics Dashboard
          </SheetTitle>
          <SheetDescription>
            Visualize the distribution of test metrics and the impact of your
            threshold changes
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          <TrendVisualizer
            repository={repository}
            tests={tests}
            flakeThreshold={flakeThreshold}
            failureThreshold={failureThreshold}
          />

          <MetricsOverview tests={tests} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MetricsOverview({ tests }: { tests: Test[] }) {
  // Calculate some useful metrics
  const totalTests = tests.length;
  const flakyCounts = {
    low: tests.filter((t) => t.flakeRate > 0 && t.flakeRate <= 5).length,
    medium: tests.filter((t) => t.flakeRate > 5 && t.flakeRate <= 15).length,
    high: tests.filter((t) => t.flakeRate > 15).length,
  };

  const failureCounts = {
    low: tests.filter((t) => t.failureRate > 0 && t.failureRate <= 10).length,
    medium: tests.filter((t) => t.failureRate > 10 && t.failureRate <= 20)
      .length,
    high: tests.filter((t) => t.failureRate > 20).length,
  };

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Test Health Summary</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-medium">
              Flake Rate Distribution
            </h4>
            <div className="space-y-2">
              <MetricBar
                label="No flakiness (0%)"
                count={
                  totalTests -
                  flakyCounts.low -
                  flakyCounts.medium -
                  flakyCounts.high
                }
                total={totalTests}
                color="bg-green-500"
              />
              <MetricBar
                label="Low flakiness (1-5%)"
                count={flakyCounts.low}
                total={totalTests}
                color="bg-blue-500"
              />
              <MetricBar
                label="Medium flakiness (6-15%)"
                count={flakyCounts.medium}
                total={totalTests}
                color="bg-amber-500"
              />
              <MetricBar
                label="High flakiness (>15%)"
                count={flakyCounts.high}
                total={totalTests}
                color="bg-red-500"
              />
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">
              Failure Rate Distribution
            </h4>
            <div className="space-y-2">
              <MetricBar
                label="No failures (0%)"
                count={
                  totalTests -
                  failureCounts.low -
                  failureCounts.medium -
                  failureCounts.high
                }
                total={totalTests}
                color="bg-green-500"
              />
              <MetricBar
                label="Low failures (1-10%)"
                count={failureCounts.low}
                total={totalTests}
                color="bg-blue-500"
              />
              <MetricBar
                label="Medium failures (11-20%)"
                count={failureCounts.medium}
                total={totalTests}
                color="bg-amber-500"
              />
              <MetricBar
                label="High failures (>20%)"
                count={failureCounts.high}
                total={totalTests}
                color="bg-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function MetricBar({ label, count, total, color }: MetricBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {count} tests ({percentage}%)
        </span>
      </div>
      <div className="bg-muted h-2 w-full rounded-full">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
