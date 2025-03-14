import { PrismaClient } from "@prisma/client";
import { getChangedFiles } from "./github";

const prisma = new PrismaClient();

export async function detectFlakyTests(repoId: string, minimumRuns = 5) {
  // Get repository settings
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
  });

  if (!repo) throw new Error("Repository not found");

  // Get all test names and spec files
  const tests = await prisma.$queryRaw<
    Array<{ testName: string; specFile: string }>
  >`
    SELECT DISTINCT "testName", "specFile" 
    FROM "TestResult"
  `;

  const flakyTests = [];

  for (const test of tests) {
    // Get the last N runs for this test
    const results = await prisma.testResult.findMany({
      where: {
        testName: test.testName,
        specFile: test.specFile,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Look at the last 20 results max
    });

    if (results.length < repo.minRunsToConsider) continue;

    // Group results by commit SHA to handle multiple runs on same commit
    const resultsByCommit = groupByCommit(results);

    // Check for flakiness - different results on same commit indicates flakiness
    const flakyCommits = resultsByCommit.filter((commitGroup) =>
      hasPassingAndFailingRuns(commitGroup.results)
    );

    // Calculate flakiness rate
    const flakinessRate = flakyCommits.length / resultsByCommit.length;

    if (flakyCommits.length >= repo.flakinessThreshold) {
      // Before marking as flaky, check if test files were modified
      const hasCodeChanges = await checkForTestCodeChanges(
        test.specFile,
        flakyCommits
      );

      // Only consider it flaky if the test code wasn't changing
      if (!hasCodeChanges) {
        flakyTests.push({
          testName: test.testName,
          specFile: test.specFile,
          flakinessRate,
          occurrences: flakyCommits.length,
        });
      }
    }
  }

  return flakyTests;
}

function groupByCommit(results) {
  const commitGroups = {};

  for (const result of results) {
    if (!commitGroups[result.commitSha]) {
      commitGroups[result.commitSha] = {
        commitSha: result.commitSha,
        results: [],
      };
    }
    commitGroups[result.commitSha].results.push(result);
  }

  return Object.values(commitGroups);
}

function hasPassingAndFailingRuns(results) {
  const statuses = new Set(results.map((r) => r.status));
  return statuses.has("passed") && statuses.has("failed");
}

async function checkForTestCodeChanges(specFile, flakyCommits) {
  // For each commit where the test was flaky, check if the test file was modified
  for (const commit of flakyCommits) {
    const changedFiles = await getChangedFiles(commit.commitSha);
    if (changedFiles.includes(specFile)) {
      return true;
    }
  }
  return false;
}
