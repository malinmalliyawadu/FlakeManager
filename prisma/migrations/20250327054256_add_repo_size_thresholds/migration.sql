-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "flakeRecommendations" JSONB NOT NULL,
    "failureRecommendations" JSONB NOT NULL,
    "repoSizeThresholds" JSONB NOT NULL,
    "guardrails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);
