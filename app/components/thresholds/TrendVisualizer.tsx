import { type Repository, type Test } from "~/types/cypress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TrendVisualizerProps {
  repository: Repository;
  tests: Test[];
  flakeThreshold: number;
  failureThreshold: number;
}

export function TrendVisualizer({
  repository,
  tests,
  flakeThreshold,
  failureThreshold,
}: TrendVisualizerProps) {
  // Get value to determine the position of the markers
  const maxFlakeRate = Math.max(
    ...tests.map((test) => test.flakeRate),
    flakeThreshold,
    repository.flakeThreshold || 5,
    20, // Ensure we always have at least a 0-20% range for better visualization
  );
  const maxFailureRate = Math.max(
    ...tests.map((test) => test.failureRate),
    failureThreshold,
    repository.failureThreshold || 10,
    20, // Ensure we always have at least a 0-20% range for better visualization
  );

  // Calculate histogram data
  const flakeRateHistogram = calculateHistogram(
    tests.map((test) => test.flakeRate),
    10,
  );
  const failureRateHistogram = calculateHistogram(
    tests.map((test) => test.failureRate),
    10,
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <h3 className="text-lg font-semibold">
              Test Metrics Visualization
            </h3>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="hover:bg-muted rounded-full p-1">
                  <Info className="text-muted-foreground h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  This chart shows the distribution of flake and failure rates
                  across your tests. The lines represent your current and new
                  thresholds.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-8">
          <ThresholdVisualizer
            label="Flake Rate Distribution"
            data={flakeRateHistogram}
            currentThreshold={repository.flakeThreshold || 5}
            newThreshold={flakeThreshold}
            maxValue={maxFlakeRate}
          />

          <ThresholdVisualizer
            label="Failure Rate Distribution"
            data={failureRateHistogram}
            currentThreshold={repository.failureThreshold || 10}
            newThreshold={failureThreshold}
            maxValue={maxFailureRate}
          />
        </div>
      </div>
    </div>
  );
}

interface ThresholdVisualizerProps {
  label: string;
  data: { bin: number; count: number }[];
  currentThreshold: number;
  newThreshold: number;
  maxValue: number;
}

function ThresholdVisualizer({
  label,
  data,
  currentThreshold,
  newThreshold,
  maxValue,
}: ThresholdVisualizerProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1); // Ensure we don't divide by zero

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{label}</h3>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span>Current: {currentThreshold}%</span>
          </div>
          {newThreshold !== currentThreshold && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>New: {newThreshold}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-border relative h-40 border-b border-l">
        {/* Histogram bars */}
        <div className="absolute inset-0 flex items-end">
          {data.map((item, index) => (
            <div
              key={index}
              className="mx-px flex-1"
              style={{ height: `${(item.count / maxCount) * 100}%` }}
            >
              <div
                className="bg-primary/20 hover:bg-primary/30 h-full w-full transition-colors"
                title={`${item.bin}-${item.bin + 10}%: ${item.count} tests`}
              />
            </div>
          ))}
        </div>

        {/* Current threshold marker */}
        <div
          className="absolute h-px w-full bg-amber-500"
          style={{ bottom: `${(currentThreshold / maxValue) * 100}%` }}
        >
          <div className="bg-background absolute -left-2 -top-2 h-4 w-4 rounded-full border border-amber-500"></div>
        </div>

        {/* New threshold marker (only if different) */}
        {newThreshold !== currentThreshold && (
          <div
            className="absolute h-px w-full border-t border-dashed bg-blue-500"
            style={{ bottom: `${(newThreshold / maxValue) * 100}%` }}
          >
            <div className="bg-background absolute -bottom-2 -right-2 h-4 w-4 rounded-full border border-blue-500"></div>
          </div>
        )}

        {/* Y-axis ticks */}
        <div className="text-muted-foreground absolute -left-6 top-0 flex h-full flex-col justify-between text-xs">
          <div>{maxValue}%</div>
          <div>{Math.round(maxValue / 2)}%</div>
          <div>0%</div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="text-muted-foreground mt-1 flex justify-between text-xs">
        <div>0%</div>
        <div>50%</div>
        <div>100%</div>
      </div>
    </div>
  );
}

// Helper function to create histogram data
function calculateHistogram(
  values: number[],
  bins: number,
): { bin: number; count: number }[] {
  const result: { bin: number; count: number }[] = [];
  const binSize = 100 / bins;

  for (let i = 0; i < bins; i++) {
    const minValue = i * binSize;
    const maxValue = (i + 1) * binSize;

    const count = values.filter(
      (value) =>
        value >= minValue &&
        (i === bins - 1 ? value <= maxValue : value < maxValue),
    ).length;

    result.push({ bin: minValue, count });
  }

  return result;
}
