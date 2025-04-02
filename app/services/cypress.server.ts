import {
  type Repository as AppRepository,
  type Test as AppTest,
  type GlobalSettings as AppGlobalSettings,
} from "@prisma/client";

import { prisma } from "~/db.server";

interface CypressApiConfig {
  apiKey: string;
  apiUrl: string;
}

// Report Response Types
interface ProjectListResponse {
  project_name: string;
  id: string;
}

interface UsagePerProjectResponse {
  project_name: string;
  test_run_count: number;
}

interface SpecDetailsResponse {
  project_name: string;
  spec: string;
  test_replay_url: string;
}

interface FlakyTestDetailsResponse {
  project_name: string;
  spec: string;
  flaky_count: number;
  test_replay_url: string;
}

interface TopFailuresResponse {
  project_name: string;
  spec: string;
  cnt_passed: number;
  cnt_failed: number;
  cnt_total: number;
  fail_rate: number;
  test_replay_url: string;
}

type ReportId =
  | "project-list"
  | "usage-per-project-summary"
  | "usage-per-project-over-time"
  | "cypress-test-types"
  | "test-suite-size-summary"
  | "test-suite-over-time"
  | "project-test-count-and-status"
  | "status-by-run"
  | "status-by-run-over-time"
  | "status-by-spec"
  | "status-by-spec-over-time"
  | "status-by-test-run"
  | "status-by-test-run-over-time"
  | "cypress-run-versions"
  | "cypress-run-versions-over-time"
  | "cypress-run-versions-per-project-over-time"
  | "browsers-tested"
  | "browser-versions-tested"
  | "browser-versions-tested-over-time"
  | "browser-versions-tested-per-project-over-time"
  | "spec-details"
  | "failed-test-details"
  | "test-details"
  | "average-run-duration-over-time"
  | "average-spec-duration-over-time"
  | "test-flake-detail-over-time"
  | "flake-rate-per-project"
  | "flake-rate-per-project-over-time"
  | "flaky-test-details"
  | "top-flaky-per-project"
  | "top-failures-per-project"
  | "top-errors-per-project"
  | "ui-coverage-per-project-summary"
  | "ui-coverage-per-project-over-time"
  | "ui-coverage-details"
  | "accessibility-per-project-summary"
  | "accessibility-per-project-over-time"
  | "accessibility-details";

// Default values for a static setup
const defaultConfig: CypressApiConfig = {
  apiKey: process.env.CYPRESS_API_KEY || "NOT_SET",
  apiUrl: "https://cloud.cypress.io/enterprise-reporting/report",
};

export class CypressService {
  private config: CypressApiConfig;

  constructor(config: Partial<CypressApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private async fetchFromCypressCloud<T>(
    reportId: ReportId,
    params: Record<string, string> = {},
  ): Promise<T> {
    const queryParams = new URLSearchParams({
      token: this.config.apiKey,
      report_id: reportId,
      export_format: "json",
      ...params,
    });

    const response = await fetch(`${this.config.apiUrl}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Cypress Cloud API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRepositories(): Promise<AppRepository[]> {
    // Get project list from Cypress Cloud
    const projects = await this.fetchFromCypressCloud<ProjectListResponse[]>(
      "project-list",
      { start_date: this.getDefaultStartDate() },
    );

    // Get usage data for each project
    const usageData = await this.fetchFromCypressCloud<
      UsagePerProjectResponse[]
    >("usage-per-project-summary", { start_date: this.getDefaultStartDate() });

    // Transform the data into our Repository type
    return projects.map((project) => {
      const usage = usageData.find(
        (u) => u.project_name === project.project_name,
      );
      return {
        id: project.id,
        name: project.project_name,
        description: `Cypress Cloud project: ${project.project_name}`,
        testCount: usage?.test_run_count || 0,
        flakeThreshold: 5, // Default values, should be stored in database
        failureThreshold: 10,
      };
    });
  }

  async getRepository(repoId: string): Promise<AppRepository | null> {
    const repos = await this.getRepositories();
    return repos.find((repo) => repo.id === repoId) || null;
  }

  async getTestsForRepo(repo: string, timePeriod?: string): Promise<AppTest[]> {
    // First get the repository to get its name
    const repository = await this.getRepository(repo);
    if (!repository) {
      console.error(`Repository not found: ${repo}`);
      return [];
    }

    // Get all test details from Cypress Cloud
    const allTests = await this.fetchFromCypressCloud<SpecDetailsResponse[]>(
      "spec-details",
      {
        start_date: this.getDefaultStartDate(),
        projects: repository.name,
      },
    );

    // Get flaky test details
    const flakyTests = await this.fetchFromCypressCloud<
      FlakyTestDetailsResponse[]
    >("flaky-test-details", {
      start_date: this.getDefaultStartDate(),
      projects: repository.name,
    });

    // Get failure data
    const failures = await this.fetchFromCypressCloud<TopFailuresResponse[]>(
      "top-failures-per-project",
      {
        start_date: this.getDefaultStartDate(),
        projects: repository.name,
      },
    );

    // Transform the data into our Test type
    return allTests.map((test) => {
      const flakyTest = flakyTests.find((f) => f.spec === test.spec);
      const failure = failures.find((f) => f.spec === test.spec);
      return {
        id: test.spec, // Using spec path as ID
        name: this.getTestNameFromSpec(test.spec),
        file: test.spec,
        flakeRate: flakyTest?.flaky_count || 0,
        failureRate: failure?.fail_rate || 0,
        excluded: false, // This should be managed in our database
        manualOverride: false, // This should be managed in our database
      };
    });
  }

  private getDefaultStartDate(): string {
    // Default to last 30 days if no time period specified
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }

  private getTestNameFromSpec(specPath: string): string {
    // Convert spec path to a readable test name
    return specPath
      .split("/")
      .pop()!
      .replace(".cy.ts", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  async updateRepositoryThresholds(
    repoId: string,
    flakeThreshold: number,
    failureThreshold: number,
    timePeriod?: string,
  ): Promise<AppRepository | null> {
    try {
      const updatedRepo = await prisma.repository.update({
        where: { id: repoId },
        data: {
          flakeThreshold,
          failureThreshold,
          ...(timePeriod ? { timePeriod } : {}),
        },
      });
      return updatedRepo as unknown as AppRepository;
    } catch (error) {
      console.error(`Error updating repository thresholds: ${error}`);
      return null;
    }
  }

  async updateRepositoryJiraBoard(
    repoId: string,
    defaultJiraBoard: string,
  ): Promise<AppRepository | null> {
    try {
      const updatedRepo = await prisma.repository.update({
        where: { id: repoId },
        data: {
          defaultJiraBoard,
        },
      });
      return updatedRepo as unknown as AppRepository;
    } catch (error) {
      console.error(`Error updating repository Jira board: ${error}`);
      return null;
    }
  }

  async updateRepository(
    repoId: string,
    updates: Partial<Omit<AppRepository, "id">>,
  ): Promise<AppRepository | null> {
    try {
      const updatedRepo = await prisma.repository.update({
        where: { id: repoId },
        data: updates,
      });
      return updatedRepo as unknown as AppRepository;
    } catch (error) {
      console.error(`Error updating repository: ${error}`);
      return null;
    }
  }

  async toggleTestExclusion(
    testId: string,
    excluded: boolean,
    repo = "demo-repo",
  ): Promise<AppTest | null> {
    try {
      console.log(
        `toggleTestExclusion called with testId=${testId}, excluded=${excluded}, repo=${repo}`,
      );

      // Get the test and repository info
      const test = await prisma.test.findUnique({
        where: { id: testId },
      });

      console.log("Found test from database:", test);

      if (!test) return null;

      const repository = await this.getRepository(repo);
      console.log("Repository info:", repository);

      const flakeThreshold = repository?.flakeThreshold || 5;
      const failureThreshold = repository?.failureThreshold || 10;

      const wouldExceedThreshold =
        test.flakeRate > flakeThreshold || test.failureRate > failureThreshold;

      // It's a manual override if:
      // 1. It should be excluded by thresholds but is being included (excluded=false)
      // 2. It shouldn't be excluded by thresholds but is being excluded (excluded=true)
      const isManualOverride =
        (wouldExceedThreshold && !excluded) ||
        (!wouldExceedThreshold && excluded);

      console.log("Update logic:", {
        wouldExceedThreshold,
        isManualOverride,
        newExcluded: excluded,
      });

      // Update the test
      console.log("Attempting to update test in database...");

      try {
        const updatedTest = await prisma.test.update({
          where: { id: testId },
          data: {
            excluded,
            manualOverride: isManualOverride,
          },
        });

        console.log("Database update successful:", updatedTest);
        return updatedTest as unknown as AppTest;
      } catch (dbError) {
        console.error("Database update error:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error(`Error toggling test exclusion: ${error}`);
      return null;
    }
  }

  // Global settings methods
  async getGlobalSettings(): Promise<AppGlobalSettings | null> {
    try {
      const settings = await prisma.globalSettings.findUnique({
        where: { id: "global" },
      });

      return settings as unknown as AppGlobalSettings | null;
    } catch (error) {
      console.error(`Error getting global settings: ${error}`);
      return null;
    }
  }

  async updateGlobalSettings(
    globalSettings: AppGlobalSettings,
  ): Promise<boolean> {
    try {
      await prisma.globalSettings.upsert({
        where: { id: "global" },
        update: {
          flakeRecommendations: globalSettings.flakeRecommendations,
          failureRecommendations: globalSettings.failureRecommendations,
          repoSizeThresholds: globalSettings.repoSizeThresholds,
          guardrails: globalSettings.guardrails,
        },
        create: {
          id: "global",
          flakeRecommendations: globalSettings.flakeRecommendations,
          failureRecommendations: globalSettings.failureRecommendations,
          repoSizeThresholds: globalSettings.repoSizeThresholds,
          guardrails: globalSettings.guardrails,
        },
      });

      return true;
    } catch (error) {
      console.error(`Error updating global settings: ${error}`);
      return false;
    }
  }
}

let cypressService: CypressService | null = null;

export function getCypressService(
  config: Partial<CypressApiConfig> = {},
): CypressService {
  if (cypressService === null) {
    cypressService = new CypressService(config);
  }
  return cypressService;
}
