import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";
import * as fs from "fs";
import { DashboardResponse, FlakyTest } from "./types";

async function filterSpecs(): Promise<void> {
  try {
    // Input parameters
    const dashboardUrl = core.getInput("dashboard-url", { required: true });
    const apiKey = core.getInput("api-key", { required: true });
    const specPattern = core.getInput("spec");

    // Get repository info from GitHub context
    const context = github.context;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    core.info("Fetching flaky tests from dashboard...");

    // Get list of flaky tests from the dashboard API
    const response = await axios.get<DashboardResponse>(
      `${dashboardUrl}/api/flaky-tests`,
      {
        params: { owner, repo },
        headers: { "X-API-Key": apiKey },
      }
    );

    const flakyTests = response.data.tests;

    if (flakyTests.length > 0) {
      core.info(`Found ${flakyTests.length} flaky tests to suppress`);

      // Get the set of flaky test spec files
      const flakySpecFiles = new Set(flakyTests.map((test) => test.specFile));

      // Create a new spec pattern that excludes flaky tests
      // We'll use the negation pattern supported by Cypress
      const filteredSpecPattern = specPattern
        .split(",")
        .map((pattern) => {
          const basePattern = pattern.trim();
          return (
            basePattern +
            "," +
            Array.from(flakySpecFiles)
              .map((flakySpec) => `!${flakySpec}`)
              .join(",")
          );
        })
        .join(",");

      // Set the output for use in the next step
      core.setOutput("filtered_spec", filteredSpecPattern);
      core.info(`Filtered spec pattern: ${filteredSpecPattern}`);
    } else {
      core.info("No flaky tests to suppress. Using original spec pattern.");
      core.setOutput("filtered_spec", specPattern);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(`Error filtering specs: ${error.message}`);
    } else {
      core.error(`Unknown error occurred while filtering specs`);
    }

    const specPattern = core.getInput("spec");
    core.setOutput("filtered_spec", specPattern);
    core.info(`Using original spec pattern due to error: ${specPattern}`);
  }
}

// Run the function
filterSpecs().catch((error) => {
  core.setFailed(`Unhandled error: ${error.message}`);
});
