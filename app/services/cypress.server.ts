import { type Repository, type Test } from "~/types/cypress";
import { singleton } from "~/singleton.server";

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

// Sample repository data
const sampleRepositories: Repository[] = [
  {
    id: "main-app",
    name: "Main Application",
    description: "Core frontend application with user-facing features",
    testCount: 48,
    flakeThreshold: 3,
    failureThreshold: 8,
    defaultJiraBoard: "FRONTEND",
  },
  {
    id: "admin-portal",
    name: "Admin Portal",
    description: "Internal admin dashboard for managing users and content",
    testCount: 32,
    flakeThreshold: 6,
    failureThreshold: 12,
    defaultJiraBoard: "ADMIN",
  },
  {
    id: "api-service",
    name: "API Service",
    description: "Backend API service with REST endpoints",
    testCount: 75,
    flakeThreshold: 4,
    failureThreshold: 9,
    defaultJiraBoard: "API",
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "React Native mobile application",
    testCount: 29,
    flakeThreshold: 5,
    failureThreshold: 10,
  },
  {
    id: "demo-repo",
    name: "Demo Repository",
    description: "Demonstration repository for testing features",
    testCount: 8,
    flakeThreshold: 5,
    failureThreshold: 10,
    defaultJiraBoard: "FLAKE",
  },
];

// Sample test data for different repositories
const repoTestData: Record<string, Test[]> = {
  "main-app": [
    {
      id: "ma-1",
      name: "should render landing page",
      file: "landing.spec.ts",
      flakeRate: 3,
      failureRate: 1,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "ma-2",
      name: "should navigate to features page",
      file: "navigation.spec.ts",
      flakeRate: 8,
      failureRate: 4,
      // Manually excluded despite being below failure threshold
      excluded: true,
      manualOverride: true,
    },
    {
      id: "ma-3",
      name: "should submit contact form",
      file: "forms.spec.ts",
      flakeRate: 1,
      failureRate: 0,
      excluded: false,
      manualOverride: false,
    },
  ],
  "admin-portal": [
    {
      id: "ap-1",
      name: "should login as admin",
      file: "auth.spec.ts",
      flakeRate: 0,
      failureRate: 0,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "ap-2",
      name: "should display user list",
      file: "users.spec.ts",
      flakeRate: 4,
      failureRate: 12,
      // Auto-excluded due to exceeding failure threshold (12 > 10)
      excluded: true,
      manualOverride: false,
    },
    {
      id: "ap-3",
      name: "should edit user permissions",
      file: "permissions.spec.ts",
      flakeRate: 7,
      failureRate: 3,
      // Manually excluded despite being below thresholds
      excluded: true,
      manualOverride: true,
    },
  ],
  "demo-repo": [
    {
      id: "1",
      name: "should load home page",
      file: "home.spec.ts",
      flakeRate: 1,
      failureRate: 2,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "2",
      name: "should login successfully",
      file: "auth.spec.ts",
      flakeRate: 7,
      failureRate: 3,
      // Manually excluded despite being below thresholds
      excluded: true,
      manualOverride: true,
    },
    {
      id: "3",
      name: "should display product catalog",
      file: "products.spec.ts",
      flakeRate: 0,
      failureRate: 0,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "4",
      name: "should add item to cart",
      file: "cart.spec.ts",
      flakeRate: 12,
      failureRate: 5,
      // Auto-excluded due to exceeding flake threshold (12 > 5)
      excluded: true,
      manualOverride: false,
      jiraTicket: {
        id: "10001",
        key: "FLAKE-1",
        url: "https://your-domain.atlassian.net/browse/FLAKE-1",
      },
    },
    {
      id: "5",
      name: "should process payment",
      file: "checkout.spec.ts",
      flakeRate: 2,
      failureRate: 15,
      // Auto-excluded due to exceeding failure threshold (15 > 10)
      excluded: true,
      manualOverride: false,
      jiraTicket: {
        id: "10002",
        key: "FLAKE-2",
        url: "https://your-domain.atlassian.net/browse/FLAKE-2",
      },
    },
    {
      id: "6",
      name: "should show order confirmation",
      file: "checkout.spec.ts",
      flakeRate: 3,
      failureRate: 4,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "7",
      name: "should update user profile",
      file: "profile.spec.ts",
      flakeRate: 6,
      failureRate: 11,
      // Auto-excluded due to exceeding failure threshold (11 > 10)
      excluded: true,
      manualOverride: false,
    },
    {
      id: "8",
      name: "should log out successfully",
      file: "auth.spec.ts",
      flakeRate: 0,
      failureRate: 1,
      excluded: false,
      manualOverride: false,
    },
    {
      id: "9",
      name: "should handle network errors gracefully",
      file: "errors.spec.ts",
      flakeRate: 8,
      failureRate: 12,
      // Auto-excluded due to exceeding both thresholds
      excluded: true,
      manualOverride: false,
    },
    {
      id: "10",
      name: "should display correct prices",
      file: "products.spec.ts",
      flakeRate: 9,
      failureRate: 13,
      // Manually included despite exceeding both thresholds
      excluded: false,
      manualOverride: true,
    },
  ],
};

export class CypressService {
  private config: CypressApiConfig;

  constructor(config: Partial<CypressApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async getRepositories(): Promise<Repository[]> {
    // In a real app, this would fetch repositories from an API
    return sampleRepositories;
  }

  async getRepository(repoId: string): Promise<Repository | null> {
    const repo = sampleRepositories.find((r) => r.id === repoId);
    return repo || null;
  }

  async updateRepositoryThresholds(
    repoId: string,
    flakeThreshold: number,
    failureThreshold: number,
  ): Promise<Repository | null> {
    // In a real app, this would update the repository in a database or API
    const repoIndex = sampleRepositories.findIndex((r) => r.id === repoId);
    if (repoIndex === -1) {
      return null;
    }

    sampleRepositories[repoIndex] = {
      ...sampleRepositories[repoIndex],
      flakeThreshold,
      failureThreshold,
    };

    return sampleRepositories[repoIndex];
  }

  async updateRepositoryJiraBoard(
    repoId: string,
    defaultJiraBoard: string,
  ): Promise<Repository | null> {
    // In a real app, this would update the repository in a database or API
    const repoIndex = sampleRepositories.findIndex((r) => r.id === repoId);
    if (repoIndex === -1) {
      return null;
    }

    sampleRepositories[repoIndex] = {
      ...sampleRepositories[repoIndex],
      defaultJiraBoard,
    };

    return sampleRepositories[repoIndex];
  }

  async updateRepository(
    repoId: string,
    updates: Partial<Omit<Repository, "id">>,
  ): Promise<Repository | null> {
    // In a real app, this would update the repository in a database or API
    const repoIndex = sampleRepositories.findIndex((r) => r.id === repoId);
    if (repoIndex === -1) {
      return null;
    }

    sampleRepositories[repoIndex] = {
      ...sampleRepositories[repoIndex],
      ...updates,
    };

    return sampleRepositories[repoIndex];
  }

  async getTestsForRepo(repo: string): Promise<Test[]> {
    // Get tests for the specified repository or return a default set
    const tests = repoTestData[repo] || [];

    return tests;
  }

  async toggleTestExclusion(
    testId: string,
    excluded: boolean,
    repo = "demo-repo",
  ): Promise<Test | null> {
    // For now, we'll just return a mocked response
    // In a real implementation, this would update a database or call an API
    const repoTests = repoTestData[repo] || [];
    const testIndex = repoTests.findIndex((t) => t.id === testId);

    if (testIndex === -1) return null;

    // Determine if this would be a threshold override
    const test = repoTests[testIndex];
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

    // Update the test in our mock data
    repoTestData[repo][testIndex] = {
      ...test,
      excluded,
      manualOverride: isManualOverride,
    };

    return repoTestData[repo][testIndex];
  }
}

export function getCypressService(
  config: Partial<CypressApiConfig> = {},
): CypressService {
  return singleton("cypressService", () => new CypressService(config));
}
