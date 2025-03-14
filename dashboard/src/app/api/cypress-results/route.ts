import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { detectFlakyTests } from "@/src/app/lib/flake-detection";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate the request
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json(
        { error: "Invalid request. Expected results array." },
        { status: 400 }
      );
    }

    const { results, repository, owner, commitSha, branch, runId } = data;

    // Find or create repository
    let repo = await prisma.repository.findUnique({
      where: { name: repository },
    });

    if (!repo) {
      repo = await prisma.repository.create({
        data: {
          name: repository,
          owner,
          flakinessThreshold: 3,
          minRunsToConsider: 5,
        },
      });
    }

    // Store test results
    await prisma.testResult.createMany({
      data: results.map((result: any) => ({
        testName: result.title.join(" > "),
        specFile: result.spec.relative,
        status: result.state,
        duration: result.duration,
        commitSha,
        branch,
        runId,
        errorMessage: result.error?.message || null,
        stackTrace: result.error?.stack || null,
      })),
    });

    // Run flake detection algorithm
    const flakyTests = await detectFlakyTests(repo.id);

    // Update flaky tests in the database
    for (const flakyTest of flakyTests) {
      await prisma.flakyTest.upsert({
        where: {
          testName_specFile: {
            testName: flakyTest.testName,
            specFile: flakyTest.specFile,
          },
        },
        update: {
          flakinessRate: flakyTest.flakinessRate,
          occurrences: flakyTest.occurrences,
          lastDetectedAt: new Date(),
        },
        create: {
          testName: flakyTest.testName,
          specFile: flakyTest.specFile,
          flakinessRate: flakyTest.flakinessRate,
          occurrences: flakyTest.occurrences,
          suppressed: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      flakyTestsDetected: flakyTests.length,
    });
  } catch (error) {
    console.error("Error processing test results:", error);
    return NextResponse.json(
      { error: "Failed to process test results." },
      { status: 500 }
    );
  }
}
