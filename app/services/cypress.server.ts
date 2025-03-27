import {
  type Repository as AppRepository,
  type Test as AppTest,
} from "~/types/cypress";
import { prisma } from "~/db.server";

interface CypressApiConfig {
  projectId: string;
  recordKey: string;
  apiUrl: string;
}

// Default values for a static setup
const defaultConfig: CypressApiConfig = {
  projectId: "abc123",
  recordKey: "def456",
  apiUrl: "https://api.cypress.io",
};

export class CypressService {
  private config: CypressApiConfig;

  constructor(config: Partial<CypressApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async getRepositories(): Promise<AppRepository[]> {
    const repositories = await prisma.repository.findMany();
    return repositories as unknown as AppRepository[];
  }

  async getRepository(repoId: string): Promise<AppRepository | null> {
    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
    });
    return repo as unknown as AppRepository | null;
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

  async getTestsForRepo(repo: string, timePeriod?: string): Promise<AppTest[]> {
    const tests = await prisma.test.findMany({
      where: { repositoryId: repo },
    });

    // In a real implementation, we would filter tests based on timePeriod
    // For now, we're just returning all tests, but in a real app
    // this would use the timePeriod to filter data from the database
    return tests as unknown as AppTest[];
  }

  async toggleTestExclusion(
    testId: string,
    excluded: boolean,
    repo = "demo-repo",
  ): Promise<AppTest | null> {
    try {
      // Get the test and repository info
      const test = await prisma.test.findUnique({
        where: { id: testId },
      });

      if (!test) return null;

      const repository = await this.getRepository(repo);
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

      // Update the test
      const updatedTest = await prisma.test.update({
        where: { id: testId },
        data: {
          excluded,
          manualOverride: isManualOverride,
        },
      });

      return updatedTest as unknown as AppTest;
    } catch (error) {
      console.error(`Error toggling test exclusion: ${error}`);
      return null;
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
