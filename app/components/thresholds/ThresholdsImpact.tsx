import { Test } from "@prisma/client";
import { AlertTriangle, Lightbulb, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ThresholdsImpactProps {
  tests: Test[];
  currentFlakeThreshold: number;
  currentFailureThreshold: number;
  newFlakeThreshold: number;
  newFailureThreshold: number;
}

export function ThresholdsImpact({
  tests,
  currentFlakeThreshold,
  currentFailureThreshold,
  newFlakeThreshold,
  newFailureThreshold,
}: ThresholdsImpactProps) {
  // Calculate impact of threshold changes
  const [impact, setImpact] = useState(() =>
    calculateImpact(
      tests,
      currentFlakeThreshold,
      currentFailureThreshold,
      newFlakeThreshold,
      newFailureThreshold,
    ),
  );

  // Track if we should show the pulse animation
  const [pulsing, setPulsing] = useState(false);

  // Recalculate when thresholds change
  useEffect(() => {
    setImpact(
      calculateImpact(
        tests,
        currentFlakeThreshold,
        currentFailureThreshold,
        newFlakeThreshold,
        newFailureThreshold,
      ),
    );

    // Only trigger the pulse animation when threshold values change
    const thresholdsChanged =
      currentFlakeThreshold !== newFlakeThreshold ||
      currentFailureThreshold !== newFailureThreshold;

    if (thresholdsChanged) {
      // Start pulsing
      setPulsing(true);

      // Stop pulsing after 1 second
      const timer = setTimeout(() => {
        setPulsing(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    tests,
    currentFlakeThreshold,
    currentFailureThreshold,
    newFlakeThreshold,
    newFailureThreshold,
  ]);

  // Always show the component, even if there are no changes
  const noChanges = impact.unchangedCount === tests.length;
  const noThresholdChanges =
    currentFlakeThreshold === newFlakeThreshold &&
    currentFailureThreshold === newFailureThreshold;

  const hasChanges = !noThresholdChanges;

  return (
    <div
      className={`space-y-3 transition-all duration-300 ${pulsing ? "animate-pulse" : ""}`}
    >
      {noChanges ? (
        <div
          className={`text-center transition-all duration-300 ${noThresholdChanges ? "text-muted-foreground text-sm" : "rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"}`}
        >
          {!noThresholdChanges ? (
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>All tests will maintain their current status.</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Impact Stats */}
          <div className="grid gap-3 md:grid-cols-3">
            <ImpactStat
              label="Tests to be included"
              count={impact.includeCount}
              icon={<Lightbulb className="h-4 w-4 text-emerald-500" />}
              description="Will run in CI pipeline"
              className={`${impact.includeCount > 0 && hasChanges ? "border-l-4 border-emerald-500" : ""} ${hasChanges && impact.includeCount > 0 ? "animate-fadeIn" : ""} pl-3`}
            />

            <ImpactStat
              label="Tests to be excluded"
              count={impact.excludeCount}
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              description="Won't run in CI pipeline"
              className={`${impact.excludeCount > 0 && hasChanges ? "border-l-4 border-amber-500" : ""} ${hasChanges && impact.excludeCount > 0 ? "animate-fadeIn" : ""} pl-3`}
            />

            <ImpactStat
              label="Tests unchanged"
              count={impact.unchangedCount}
              description="Status will not change"
              className="pl-3"
            />
          </div>

          {/* Changed Tests Lists */}
          {impact.testListToInclude.length > 0 ||
          impact.testListToExclude.length > 0 ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {impact.testListToInclude.length > 0 ? (
                <div
                  className={`bg-card/50 space-y-1 rounded-md border p-2 ${hasChanges ? "animate-fadeIn" : ""}`}
                >
                  <h3 className="flex items-center gap-1.5 text-xs font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <span>
                      Tests that will be included (
                      {impact.testListToInclude.length})
                    </span>
                  </h3>
                  <div className="text-muted-foreground border-muted bg-muted/10 max-h-[100px] space-y-1 overflow-y-auto rounded border p-1.5 text-xs">
                    {impact.testListToInclude.map((test) => (
                      <div key={test.id} className="flex items-center gap-1.5">
                        <span className="h-1 w-3 rounded-full bg-emerald-500"></span>
                        <span className="truncate font-medium">
                          {test.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {impact.testListToExclude.length > 0 ? (
                <div
                  className={`bg-card/50 space-y-1 rounded-md border p-2 ${hasChanges ? "animate-fadeIn" : ""}`}
                >
                  <h3 className="flex items-center gap-1.5 text-xs font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    <span>
                      Tests that will be excluded (
                      {impact.testListToExclude.length})
                    </span>
                  </h3>
                  <div className="text-muted-foreground border-muted bg-muted/10 max-h-[100px] space-y-1 overflow-y-auto rounded border p-1.5 text-xs">
                    {impact.testListToExclude.map((test) => (
                      <div key={test.id} className="flex items-center gap-1.5">
                        <span className="h-1 w-3 rounded-full bg-amber-500"></span>
                        <span className="truncate font-medium">
                          {test.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface ImpactStatProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

function ImpactStat({
  label,
  count,
  icon,
  description,
  className = "",
}: ImpactStatProps) {
  return (
    <div className={`bg-card/80 space-y-1 rounded-md border p-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium">{label}</h3>
        {icon}
      </div>
      <div className="text-xl font-bold">{count}</div>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );
}

// Helper function to calculate the impact of threshold changes
function calculateImpact(
  tests: Test[],
  currentFlakeThreshold: number,
  currentFailureThreshold: number,
  newFlakeThreshold: number,
  newFailureThreshold: number,
) {
  const testListToInclude: Test[] = [];
  const testListToExclude: Test[] = [];
  let unchangedCount = 0;

  tests.forEach((test) => {
    // Check if the test would be excluded based on current thresholds
    const currentlyExcluded =
      test.flakeRate > currentFlakeThreshold ||
      test.failureRate > currentFailureThreshold;

    // Check if the test would be excluded based on new thresholds
    const wouldBeExcluded =
      test.flakeRate > newFlakeThreshold ||
      test.failureRate > newFailureThreshold;

    // If the exclusion status would change
    if (currentlyExcluded && !wouldBeExcluded) {
      testListToInclude.push(test);
    } else if (!currentlyExcluded && wouldBeExcluded) {
      testListToExclude.push(test);
    } else {
      unchangedCount++;
    }
  });

  return {
    includeCount: testListToInclude.length,
    excludeCount: testListToExclude.length,
    unchangedCount,
    testListToInclude,
    testListToExclude,
  };
}
