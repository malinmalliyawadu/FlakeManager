import { PrismaClient } from "@prisma/client";

import { singleton } from "~/singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", () => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Connect to the database
  client.$connect().catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

  return client;
});

export { prisma };
