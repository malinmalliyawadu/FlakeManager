import { type Test } from "~/types/cypress";

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

  async getTestsForRepo(
    repo: string,
    options: { flakeThreshold?: number; failureThreshold?: number } = {},
  ): Promise<Test[]> {
    const { flakeThreshold = 5, failureThreshold = 10 } = options;

    // For now, return static data
    // In a real implementation, we'd fetch from the Cypress Data Extract API
    const allTests: Test[] = [
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
    ];

    // Auto-mark tests as excluded if they exceed thresholds
    return allTests.map((test) => ({
      ...test,
      excluded:
        test.excluded ||
        test.flakeRate > flakeThreshold ||
        test.failureRate > failureThreshold,
    }));
  }

  async toggleTestExclusion(
    testId: string,
    excluded: boolean,
  ): Promise<Test | null> {
    // For now, we'll just return a mocked response
    // In a real implementation, this would update a database or call an API
    const tests = await this.getTestsForRepo("demo-repo");
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
