/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],
  // GitHub Pages deployment configuration
  publicPath: "/FlakeManager/build/",
  assetsBuildDirectory: "public/build",
  serverBuildPath: "build/index.js",
};
