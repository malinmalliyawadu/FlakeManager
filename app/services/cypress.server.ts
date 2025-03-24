import { type Repository, type Test } from "~/types/cypress";

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
  },
  {
    id: "admin-portal",
    name: "Admin Portal",
    description: "Internal admin dashboard for managing users and content",
    testCount: 32,
    flakeThreshold: 6,
    failureThreshold: 12,
  },
  {
    id: "api-service",
    name: "API Service",
    description: "Backend API service with REST endpoints",
    testCount: 75,
    flakeThreshold: 4,
    failureThreshold: 9,
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
    },
    {
      id: "ma-2",
      name: "should navigate to features page",
      file: "navigation.spec.ts",
      flakeRate: 8,
      failureRate: 4,
      excluded: true,
    },
    {
      id: "ma-3",
      name: "should submit contact form",
      file: "forms.spec.ts",
      flakeRate: 1,
      failureRate: 0,
      excluded: false,
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
    },
    {
      id: "ap-2",
      name: "should display user list",
      file: "users.spec.ts",
      flakeRate: 4,
      failureRate: 12,
      excluded: true,
    },
    {
      id: "ap-3",
      name: "should edit user permissions",
      file: "permissions.spec.ts",
      flakeRate: 7,
      failureRate: 3,
      excluded: true,
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
    },
    {
      id: "2",
      name: "should login successfully",
      file: "auth.spec.ts",
      flakeRate: 7,
      failureRate: 3,
      excluded: true,
    },
    {
      id: "3",
      name: "should display product catalog",
      file: "products.spec.ts",
      flakeRate: 0,
      failureRate: 0,
      excluded: false,
    },
    {
      id: "4",
      name: "should add item to cart",
      file: "cart.spec.ts",
      flakeRate: 12,
      failureRate: 5,
      excluded: true,
    },
    {
      id: "5",
      name: "should process payment",
      file: "checkout.spec.ts",
      flakeRate: 2,
      failureRate: 15,
      excluded: true,
    },
    {
      id: "6",
      name: "should show order confirmation",
      file: "checkout.spec.ts",
      flakeRate: 3,
      failureRate: 4,
      excluded: false,
    },
    {
      id: "7",
      name: "should update user profile",
      file: "profile.spec.ts",
      flakeRate: 6,
      failureRate: 11,
      excluded: true,
    },
    {
      id: "8",
      name: "should log out successfully",
      file: "auth.spec.ts",
      flakeRate: 0,
      failureRate: 1,
      excluded: false,
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
    // Find the repository in our sample data
    const repoIndex = sampleRepositories.findIndex((r) => r.id === repoId);

    if (repoIndex === -1) {
      return null;
    }

    // Update the thresholds
    sampleRepositories[repoIndex] = {
      ...sampleRepositories[repoIndex],
      flakeThreshold,
      failureThreshold,
    };

    return sampleRepositories[repoIndex];
  }

  async getTestsForRepo(
    repo: string,
    options?: { flakeThreshold?: number; failureThreshold?: number },
  ): Promise<Test[]> {
    let thresholds = { flakeThreshold: 5, failureThreshold: 10 };

    // If no options provided, use the repo's configured thresholds
    if (!options) {
      const repository = await this.getRepository(repo);
      if (repository) {
        thresholds = {
          flakeThreshold: repository.flakeThreshold,
          failureThreshold: repository.failureThreshold,
        };
      }
    } else {
      thresholds = {
        flakeThreshold: options.flakeThreshold ?? 5,
        failureThreshold: options.failureThreshold ?? 10,
      };
    }

    // Get tests for the specified repository or return a default set
    const tests = repoTestData[repo] || [];

    // Auto-mark tests as excluded if they exceed thresholds
    return tests.map((test) => ({
      ...test,
      excluded:
        test.excluded ||
        test.flakeRate > thresholds.flakeThreshold ||
        test.failureRate > thresholds.failureThreshold,
    }));
  }

  async toggleTestExclusion(
    testId: string,
    excluded: boolean,
    repo: string = "demo-repo",
  ): Promise<Test | null> {
    // For now, we'll just return a mocked response
    // In a real implementation, this would update a database or call an API
    const tests = await this.getTestsForRepo(repo);
    const test = tests.find((t) => t.id === testId);

    if (!test) return null;

    return {
      ...test,
      excluded,
    };
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
