/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],
  // Standard Remix configuration for Netlify
  serverBuildPath: "build/index.js",
  assetsBuildDirectory: "public/build",
};
