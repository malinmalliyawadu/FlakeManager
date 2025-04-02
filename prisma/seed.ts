import { PrismaClient } from "@prisma/client";

import {
  mainAppTests,
  adminPortalTests,
  apiServiceTests,
  mobileAppTests,
  demoRepoTests,
} from "./test-data";

const prisma = new PrismaClient();

// Sample repository data
const sampleRepositories = [
  {
    id: "main-app",
    name: "Main Application",
    description: "Core frontend application with user-facing features",
    testCount: 48,
    flakeThreshold: 3,
    failureThreshold: 8,
    defaultJiraBoard: "FRONTEND",
  },
  {
    id: "admin-portal",
    name: "Admin Portal",
    description: "Internal admin dashboard for managing users and content",
    testCount: 32,
    flakeThreshold: 6,
    failureThreshold: 12,
    defaultJiraBoard: "ADMIN",
  },
  {
    id: "api-service",
    name: "API Service",
    description: "Backend API service with REST endpoints",
    testCount: 75,
    flakeThreshold: 4,
    failureThreshold: 9,
    defaultJiraBoard: "API",
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "React Native mobile application",
    testCount: 29,
    flakeThreshold: 5,
    failureThreshold: 10,
  },
  {
    id: "demo-repo",
    name: "Demo Repository",
    description: "Demonstration repository for testing features",
    testCount: 8,
    flakeThreshold: 5,
    failureThreshold: 10,
    defaultJiraBoard: "FLAKE",
  },
];

async function seed() {
  console.log(`Start seeding...`);

  // Create repositories
  for (const repo of sampleRepositories) {
    await prisma.repository.upsert({
      where: { id: repo.id },
      update: repo,
      create: repo,
    });
  }

  // Create tests from separate files
  const allTests = [
    ...mainAppTests,
    ...adminPortalTests,
    ...apiServiceTests,
    ...mobileAppTests,
    ...demoRepoTests,
  ];

  for (const test of allTests) {
    if (test.repository?.connect?.id) {
      // Get the repositoryId from the test
      const repositoryId = test.repository.connect.id;

      // Omit the repository field for database operations
      const { repository, ...testData } = test;

      await prisma.test.upsert({
        where: { id: testData.id },
        update: { ...testData, repositoryId },
        create: { ...testData, repositoryId },
      });
    } else {
      console.error(
        `Test ${test.id} missing repository connection information. Skipping.`,
      );
    }
  }

  console.log(`Seeding finished.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
