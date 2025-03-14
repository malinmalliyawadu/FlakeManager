import { Octokit } from "@octokit/rest";

// Initialize Octokit with your GitHub token
// In a real app, this would be an environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Gets a list of files changed in a specific commit
 */
export async function getChangedFiles(commitSha: string): Promise<string[]> {
  try {
    // This is a simplified implementation
    // In a real app, you'd need to get the repo owner and name dynamically
    const owner = process.env.GITHUB_REPOSITORY_OWNER || "default-owner";
    const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "default-repo";

    const response = await octokit.repos.getCommit({
      owner,
      repo,
      ref: commitSha,
    });

    return response.data.files?.map((file) => file.filename) || [];
  } catch (error) {
    console.error(
      `Error fetching changed files for commit ${commitSha}:`,
      error
    );
    return [];
  }
}
