import * as build from "../build/index.js";

// Expose the default export for Vercel serverless functions
export default async function handler(req, res) {
  // Convert Vercel request to a standard Request
  const request = new Request(req.url, {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.body ? JSON.stringify(req.body) : undefined,
  });

  try {
    const handler = build.default.requestHandler;

    // Handle the request
    const response = await handler(request, {
      getLoadContext() {
        return { req, res };
      },
    });

    // Convert response to Vercel response
    const statusCode = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    const body = await response.text();

    // Send the response
    res.statusCode = statusCode;
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    res.end(body);
  } catch (error) {
    console.error("Error handling request:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    );
  }
}
