import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FlakyTestsTable from "@/components/tables/flaky-tests-table";
import TestResultsChart from "@/components/charts/test-results-chart";
import RepositorySelector from "@/components/repository-selector";
import FlakinessMetrics from "@/components/flakiness-metrics";
import { Header } from "@/components/header";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <RepositorySelector />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FlakinessMetrics />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium">Test Results Trend</h3>
                <TestResultsChart />
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium">Flaky Test Manager</h3>
                <p className="text-sm text-muted-foreground">
                  Identify, analyze, and fix flaky tests in your CI pipeline.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Tabs defaultValue="flaky-tests">
            <TabsList>
              <TabsTrigger value="flaky-tests">Flaky Tests</TabsTrigger>
              <TabsTrigger value="suppressed-tests">
                Suppressed Tests
              </TabsTrigger>
              <TabsTrigger value="fixed-tests">Fixed Tests</TabsTrigger>
            </TabsList>
            <TabsContent value="flaky-tests" className="pt-4">
              <FlakyTestsTable />
            </TabsContent>
            <TabsContent value="suppressed-tests" className="pt-4">
              <div className="rounded-xl border p-8 text-center">
                <p className="text-muted-foreground">
                  Tests that are currently suppressed in the CI pipeline.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="fixed-tests" className="pt-4">
              <div className="rounded-xl border p-8 text-center">
                <p className="text-muted-foreground">
                  Tests that were previously flaky but have been fixed.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
