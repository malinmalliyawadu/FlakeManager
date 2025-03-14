export interface FlakyTest {
  id: string;
  specFile: string;
  testName: string;
  lastFailedAt: string;
  occurrences: number;
}

export interface DashboardResponse {
  tests: FlakyTest[];
}

export interface RepoContext {
  owner: string;
  repo: string;
  sha: string;
  ref: string;
}
