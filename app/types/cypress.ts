export interface Test {
  id: string;
  name: string;
  file: string;
  flakeRate: number;
  failureRate: number;
  excluded: boolean;
}

export interface ApiResponse {
  status: "success" | "error";
  data?: Test[];
  message?: string;
}
