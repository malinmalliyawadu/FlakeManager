"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitMerge, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

// This would be fetched from an API in a real application
const metrics = {
  totalTests: 245,
  flakyTests: 12,
  suppressedTests: 8,
  averageFlakiness: 7.2,
  ciRunsSaved: 23,
};

export default function FlakinessMetrics() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flaky Tests</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.flakyTests}/{metrics.totalTests}
          </div>
          <p className="text-xs text-muted-foreground">
            {((metrics.flakyTests / metrics.totalTests) * 100).toFixed(1)}% of
            your tests are flaky
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Suppressed Tests
          </CardTitle>
          <GitMerge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.suppressedTests}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.suppressedTests} tests currently suppressed in CI
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Flakiness
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageFlakiness}%</div>
          <p className="text-xs text-muted-foreground">
            Average failure rate of flaky tests
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CI Runs Saved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ciRunsSaved}</div>
          <p className="text-xs text-muted-foreground">
            CI runs that would have failed due to flakiness
          </p>
        </CardContent>
      </Card>
    </>
  );
}
