import { PrismaClient } from "@prisma/client";

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

// Sample test data for different repositories
const sampleTests = [
  // main-app tests
  {
    id: "ma-1",
    name: "should render landing page",
    file: "landing.spec.ts",
    flakeRate: 3,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repositoryId: "main-app",
  },
  {
    id: "ma-2",
    name: "should navigate to features page",
    file: "navigation.spec.ts",
    flakeRate: 8,
    failureRate: 4,
    excluded: true,
    manualOverride: true,
    repositoryId: "main-app",
  },
  {
    id: "ma-3",
    name: "should submit contact form",
    file: "forms.spec.ts",
    flakeRate: 1,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repositoryId: "main-app",
  },

  // demo-repo tests
  {
    id: "1",
    name: "should load home page",
    file: "home.spec.ts",
    flakeRate: 1,
    failureRate: 2,
    excluded: false,
    manualOverride: false,
    repositoryId: "demo-repo",
  },
  {
    id: "2",
    name: "should login successfully",
    file: "auth.spec.ts",
    flakeRate: 7,
    failureRate: 3,
    excluded: true,
    manualOverride: true,
    repositoryId: "demo-repo",
  },
  {
    id: "3",
    name: "should display product catalog",
    file: "products.spec.ts",
    flakeRate: 0,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repositoryId: "demo-repo",
  },
  {
    id: "4",
    name: "should add item to cart",
    file: "cart.spec.ts",
    flakeRate: 12,
    failureRate: 5,
    excluded: true,
    manualOverride: false,
    repositoryId: "demo-repo",
    jiraTicketId: "10001",
    jiraTicketKey: "FLAKE-1",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/FLAKE-1",
  },
  {
    id: "5",
    name: "should process payment",
    file: "checkout.spec.ts",
    flakeRate: 2,
    failureRate: 15,
    excluded: true,
    manualOverride: false,
    repositoryId: "demo-repo",
    jiraTicketId: "10002",
    jiraTicketKey: "FLAKE-2",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/FLAKE-2",
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

  // Create tests
  for (const test of sampleTests) {
    await prisma.test.upsert({
      where: { id: test.id },
      update: test,
      create: test,
    });
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
