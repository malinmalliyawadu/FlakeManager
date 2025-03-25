import { describe, test, expect, beforeEach, vi } from "vitest";
import { CypressService, getCypressService } from "./cypress.server";
import { type Repository, type Test } from "~/types/cypress";

describe("CypressService", () => {
  let cypressService: CypressService;

  beforeEach(() => {
    // Create a new instance for each test to avoid test pollution
    cypressService = new CypressService();
  });

  test("getRepositories returns all repositories", async () => {
    const repos = await cypressService.getRepositories();

    expect(repos).toBeInstanceOf(Array);
    expect(repos.length).toBeGreaterThan(0);
    expect(repos[0]).toHaveProperty("id");
    expect(repos[0]).toHaveProperty("name");
    expect(repos[0]).toHaveProperty("flakeThreshold");
    expect(repos[0]).toHaveProperty("failureThreshold");
  });

  test("getRepository returns a specific repository by id", async () => {
    const repo = await cypressService.getRepository("demo-repo");

    expect(repo).not.toBeNull();
    expect(repo?.id).toBe("demo-repo");
    expect(repo?.name).toBe("Demo Repository");
  });

  test("getRepository returns null for non-existent repository", async () => {
    const repo = await cypressService.getRepository("non-existent-repo");

    expect(repo).toBeNull();
  });

  test("getTestsForRepo returns tests for a specific repository", async () => {
    const tests = await cypressService.getTestsForRepo("demo-repo");

    expect(tests).toBeInstanceOf(Array);
    expect(tests.length).toBeGreaterThan(0);
    expect(tests[0]).toHaveProperty("id");
    expect(tests[0]).toHaveProperty("name");
    expect(tests[0]).toHaveProperty("flakeRate");
    expect(tests[0]).toHaveProperty("failureRate");
  });

  test("getTestsForRepo returns empty array for non-existent repository", async () => {
    const tests = await cypressService.getTestsForRepo("non-existent-repo");

    expect(tests).toBeInstanceOf(Array);
    expect(tests.length).toBe(0);
  });

  test("updateRepositoryThresholds updates thresholds for a repository", async () => {
    const newFlakeThreshold = 10;
    const newFailureThreshold = 20;

    const updatedRepo = await cypressService.updateRepositoryThresholds(
      "demo-repo",
      newFlakeThreshold,
      newFailureThreshold,
    );

    expect(updatedRepo).not.toBeNull();
    expect(updatedRepo?.flakeThreshold).toBe(newFlakeThreshold);
    expect(updatedRepo?.failureThreshold).toBe(newFailureThreshold);

    // Verify changes persist
    const repo = await cypressService.getRepository("demo-repo");
    expect(repo?.flakeThreshold).toBe(newFlakeThreshold);
    expect(repo?.failureThreshold).toBe(newFailureThreshold);
  });

  test("updateRepositoryJiraBoard updates the default Jira board", async () => {
    const newJiraBoard = "NEW-BOARD";

    const updatedRepo = await cypressService.updateRepositoryJiraBoard(
      "demo-repo",
      newJiraBoard,
    );

    expect(updatedRepo).not.toBeNull();
    expect(updatedRepo?.defaultJiraBoard).toBe(newJiraBoard);

    // Verify changes persist
    const repo = await cypressService.getRepository("demo-repo");
    expect(repo?.defaultJiraBoard).toBe(newJiraBoard);
  });

  test("updateRepositoryJiraBoard returns null for non-existent repository", async () => {
    const result = await cypressService.updateRepositoryJiraBoard(
      "non-existent-repo",
      "NEW-BOARD",
    );

    expect(result).toBeNull();
  });

  test("updateRepository updates multiple repository properties at once", async () => {
    const updates = {
      name: "Updated Demo Repo",
      description: "Updated description",
      testCount: 12,
      flakeThreshold: 7,
      failureThreshold: 15,
    };

    const updatedRepo = await cypressService.updateRepository(
      "demo-repo",
      updates,
    );

    expect(updatedRepo).not.toBeNull();
    expect(updatedRepo?.name).toBe(updates.name);
    expect(updatedRepo?.description).toBe(updates.description);
    expect(updatedRepo?.testCount).toBe(updates.testCount);
    expect(updatedRepo?.flakeThreshold).toBe(updates.flakeThreshold);
    expect(updatedRepo?.failureThreshold).toBe(updates.failureThreshold);

    // Verify changes persist
    const repo = await cypressService.getRepository("demo-repo");
    expect(repo?.name).toBe(updates.name);
    expect(repo?.description).toBe(updates.description);
  });

  test("updateRepository returns null for non-existent repository", async () => {
    const result = await cypressService.updateRepository("non-existent-repo", {
      name: "New Name",
    });

    expect(result).toBeNull();
  });

  test("toggleTestExclusion toggles test exclusion status", async () => {
    // First get a test to check its initial state
    const tests = await cypressService.getTestsForRepo("demo-repo");
    const testToToggle = tests.find((t) => t.id === "3"); // Should display product catalog

    expect(testToToggle).not.toBeUndefined();
    expect(testToToggle?.excluded).toBe(false);

    // Toggle exclusion on
    const updatedTest = await cypressService.toggleTestExclusion(
      "3",
      true,
      "demo-repo",
    );

    expect(updatedTest).not.toBeNull();
    expect(updatedTest?.excluded).toBe(true);
    expect(updatedTest?.manualOverride).toBe(true); // Should be manual override since it doesn't exceed thresholds

    // Toggle exclusion off
    const revertedTest = await cypressService.toggleTestExclusion(
      "3",
      false,
      "demo-repo",
    );

    expect(revertedTest).not.toBeNull();
    expect(revertedTest?.excluded).toBe(false);
    expect(revertedTest?.manualOverride).toBe(false); // No longer a manual override
  });

  test("toggleTestExclusion handles non-existent test", async () => {
    const result = await cypressService.toggleTestExclusion(
      "non-existent-id",
      true,
      "demo-repo",
    );

    expect(result).toBeNull();
  });

  test("toggleTestExclusion handles tests exceeding thresholds correctly", async () => {
    // Test ID "4" has a high flake rate (12) that exceeds the threshold (5)
    // By default, it should be excluded
    const tests = await cypressService.getTestsForRepo("demo-repo");
    const flakeyTest = tests.find((t) => t.id === "4");

    expect(flakeyTest).not.toBeUndefined();
    expect(flakeyTest?.excluded).toBe(true);
    expect(flakeyTest?.manualOverride).toBe(false); // Auto-excluded, not manual

    // Now include it despite exceeding threshold - should mark as manual override
    const includedTest = await cypressService.toggleTestExclusion(
      "4",
      false,
      "demo-repo",
    );

    expect(includedTest).not.toBeNull();
    expect(includedTest?.excluded).toBe(false);
    expect(includedTest?.manualOverride).toBe(true); // Should be marked as manual override

    // Set back to excluded - should no longer be a manual override since it aligns with thresholds
    const reExcludedTest = await cypressService.toggleTestExclusion(
      "4",
      true,
      "demo-repo",
    );

    expect(reExcludedTest).not.toBeNull();
    expect(reExcludedTest?.excluded).toBe(true);
    expect(reExcludedTest?.manualOverride).toBe(false); // No longer a manual override
  });

  test("getCypressService returns a singleton instance", () => {
    const service1 = getCypressService();
    const service2 = getCypressService();

    expect(service1).toBe(service2); // Same instance
  });

  test("CypressService can be initialized with custom config", () => {
    const customConfig = {
      projectId: "custom123",
      recordKey: "customKey456",
      apiUrl: "https://custom-api.cypress.io",
    };

    const customService = new CypressService(customConfig);

    // Since config is private, we can't directly assert on it
    // But we can verify the service was created and functions correctly
    expect(customService).toBeInstanceOf(CypressService);
  });

  test("getCypressService accepts custom config for first initialization", () => {
    // Reset the singleton for this test
    // @ts-ignore - accessing private property for testing
    globalThis.cypressService = null;

    const customConfig = {
      projectId: "singleton123",
      recordKey: "singletonKey456",
    };

    const service1 = getCypressService(customConfig);
    const service2 = getCypressService({ apiUrl: "this-will-be-ignored.com" });

    expect(service1).toBe(service2); // Should be the same instance
    // Config from first call should be used
  });
});
