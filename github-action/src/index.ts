import * as core from "@actions/core";

// This file serves as the main entry point for the action
// When building, this will be compiled to dist/index.js
// Both filter-specs.ts and report-results.ts are meant to be run directly,
// but we include them here for organization and potential future use

async function run(): Promise<void> {
  core.warning(
    "This file is not meant to be executed directly. Please use filter-specs.js or report-results.js."
  );
  core.setFailed("Invalid execution");
}

if (require.main === module) {
  run().catch((error) => {
    core.setFailed(`Unhandled error: ${error.message}`);
  });
}
