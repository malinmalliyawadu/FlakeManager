import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/api/create-jira-ticket": {};
  "/api/excluded-tests": {};
  "/global-settings": {};
  "/toggle/:testId": {
    "testId": string;
  };
  "/repositories": {};
  "/thresholds": {};
  "/dashboard": {};
  "/test/:id": {
    "id": string;
  };
};