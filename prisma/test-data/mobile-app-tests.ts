import { Prisma } from "@prisma/client";

const mobileAppTests: Prisma.TestCreateInput[] = [
  {
    id: "mob-1",
    name: "should launch app",
    file: "app.spec.ts",
    flakeRate: 1,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-2",
    name: "should display welcome screen",
    file: "screens.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-3",
    name: "should navigate to login screen",
    file: "navigation.spec.ts",
    flakeRate: 1,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-4",
    name: "should login with valid credentials",
    file: "auth.spec.ts",
    flakeRate: 3,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-5",
    name: "should show error with invalid credentials",
    file: "auth.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-6",
    name: "should reset password",
    file: "auth.spec.ts",
    flakeRate: 4,
    failureRate: 2,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-7",
    name: "should create new account",
    file: "auth.spec.ts",
    flakeRate: 5,
    failureRate: 3,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-8",
    name: "should display dashboard",
    file: "screens.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-9",
    name: "should display profile",
    file: "screens.spec.ts",
    flakeRate: 1,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-10",
    name: "should edit profile",
    file: "profile.spec.ts",
    flakeRate: 4,
    failureRate: 2,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-11",
    name: "should upload profile picture",
    file: "profile.spec.ts",
    flakeRate: 8,
    failureRate: 6,
    excluded: true,
    manualOverride: true,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-101",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-101",
  },
  {
    id: "mob-12",
    name: "should display product list",
    file: "products.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-13",
    name: "should display product details",
    file: "products.spec.ts",
    flakeRate: 3,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-14",
    name: "should add product to cart",
    file: "cart.spec.ts",
    flakeRate: 4,
    failureRate: 2,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-15",
    name: "should update cart quantity",
    file: "cart.spec.ts",
    flakeRate: 3,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-16",
    name: "should remove item from cart",
    file: "cart.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-17",
    name: "should proceed to checkout",
    file: "checkout.spec.ts",
    flakeRate: 6,
    failureRate: 4,
    excluded: true,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-102",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-102",
  },
  {
    id: "mob-18",
    name: "should enter shipping details",
    file: "checkout.spec.ts",
    flakeRate: 5,
    failureRate: 3,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-19",
    name: "should enter payment details",
    file: "checkout.spec.ts",
    flakeRate: 7,
    failureRate: 5,
    excluded: true,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-103",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-103",
  },
  {
    id: "mob-20",
    name: "should complete order",
    file: "checkout.spec.ts",
    flakeRate: 8,
    failureRate: 6,
    excluded: true,
    manualOverride: true,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-104",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-104",
  },
  {
    id: "mob-21",
    name: "should display order history",
    file: "orders.spec.ts",
    flakeRate: 3,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-22",
    name: "should display order details",
    file: "orders.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-23",
    name: "should handle pull-to-refresh",
    file: "ui.spec.ts",
    flakeRate: 4,
    failureRate: 2,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-24",
    name: "should handle infinite scrolling",
    file: "ui.spec.ts",
    flakeRate: 5,
    failureRate: 3,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-25",
    name: "should display loading indicators",
    file: "ui.spec.ts",
    flakeRate: 2,
    failureRate: 1,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-26",
    name: "should handle offline mode",
    file: "network.spec.ts",
    flakeRate: 9,
    failureRate: 7,
    excluded: true,
    manualOverride: true,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-105",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-105",
  },
  {
    id: "mob-27",
    name: "should sync data when back online",
    file: "network.spec.ts",
    flakeRate: 10,
    failureRate: 8,
    excluded: true,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-106",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-106",
  },
  {
    id: "mob-28",
    name: "should logout successfully",
    file: "auth.spec.ts",
    flakeRate: 1,
    failureRate: 0,
    excluded: false,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
  },
  {
    id: "mob-29",
    name: "should handle deep linking",
    file: "app.spec.ts",
    flakeRate: 6,
    failureRate: 4,
    excluded: true,
    manualOverride: false,
    repository: { connect: { id: "mobile-app" } },
    jiraTicketKey: "MOBILE-107",
    jiraTicketUrl: "https://your-domain.atlassian.net/browse/MOBILE-107",
  },
];

export default mobileAppTests;
