export interface Test {
  id: string;
  name: string;
  file: string;
  flakeRate: number;
  failureRate: number;
  excluded: boolean;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  testCount: number;
  flakeThreshold: number;
  failureThreshold: number;
}

export interface ApiResponse {
  status: "success" | "error";
  data?: Test[];
  message?: string;
}
