import { prisma } from "~/db.server";
import {
  type Repository as AppRepository,
  type Test as AppTest,
  type GlobalSettings as AppGlobalSettings,
} from "~/types/cypress";

interface CypressApiConfig {
  apiKey: string;
  apiUrl: string;
}

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
    reportId: string,
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
    const projects = await this.fetchFromCypressCloud<
      { project_name: string; id: string }[]
    >("project-list", { start_date: this.getDefaultStartDate() });

    // Get usage data for each project
    const usageData = await this.fetchFromCypressCloud<
      { project_name: string; test_run_count: number }[]
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
    // Get flaky test details from Cypress Cloud
    const flakyTests = await this.fetchFromCypressCloud<
      {
        project_name: string;
        spec: string;
        flaky_count: number;
        test_replay_url: string;
      }[]
    >("flaky-test-details", {
      start_date: this.getDefaultStartDate(),
      projects: repo,
    });

    // Get failure data
    const failures = await this.fetchFromCypressCloud<
      {
        project_name: string;
        spec: string;
        cnt_passed: number;
        cnt_failed: number;
        cnt_total: number;
        fail_rate: number;
        test_replay_url: string;
      }[]
    >("top-failures-per-project", {
      start_date: this.getDefaultStartDate(),
      projects: repo,
    });

    // Transform the data into our Test type
    return flakyTests.map((test) => {
      const failure = failures.find((f) => f.spec === test.spec);
      return {
        id: test.spec, // Using spec path as ID
        name: this.getTestNameFromSpec(test.spec),
        file: test.spec,
        flakeRate: test.flaky_count,
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
