export interface Test {
  id: string;
  name: string;
  file: string;
  flakeRate: number;
  failureRate: number;
  excluded: boolean;
  manualOverride?: boolean;
  jiraTicket?: {
    id: string;
    key: string;
    url: string;
  };
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  testCount: number;
  flakeThreshold: number;
  failureThreshold: number;
  defaultJiraBoard?: string;
  timePeriod?: string; // Time period setting for threshold data (e.g., '7d', '30d', '90d', 'all')
}

export interface ApiResponse {
  status: "success" | "error";
  data?: Test[];
  message?: string;
}

export interface GlobalSettings {
  id: string;
  flakeRecommendations: {
    small: {
      threshold: number;
      description: string;
    };
    medium: {
      threshold: number;
      description: string;
    };
    large: {
      threshold: number;
      description: string;
    };
  };
  failureRecommendations: {
    small: {
      threshold: number;
      description: string;
    };
    medium: {
      threshold: number;
      description: string;
    };
    large: {
      threshold: number;
      description: string;
    };
  };
  guardrails: {
    maxExcludedTests: number;
    maxExcludedTestsPercentage: number;
    requireJiraTicket: boolean;
  };
}
