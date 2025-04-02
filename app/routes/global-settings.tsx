import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";

import { GlobalSettingsForm } from "~/components/global-settings/GlobalSettingsForm";
import { PageHeader } from "~/components/page-header";
import { prisma } from "~/db.server";

// Global settings schema
export interface GlobalSettings {
  flakeRecommendations: {
    small: {
      threshold: number;
      description: string;
    };
    medium: {
      threshold: number;
      description: string;
    };
    large: {
      threshold: number;
      description: string;
    };
  };
  failureRecommendations: {
    small: {
      threshold: number;
      description: string;
    };
    medium: {
      threshold: number;
      description: string;
    };
    large: {
      threshold: number;
      description: string;
    };
  };
  repoSizeThresholds: {
    small: number;
    medium: number;
  };
  guardrails: {
    maxExcludedTests: number;
    maxExcludedTestsPercentage: number;
    requireJiraTicket: boolean;
  };
}

// Default global settings
const defaultGlobalSettings: GlobalSettings = {
  flakeRecommendations: {
    small: {
      threshold: 3,
      description:
        "For smaller test suites, keep a low threshold to catch flakiness early.",
    },
    medium: {
      threshold: 5,
      description:
        "A moderate threshold works well for medium-sized test suites.",
    },
    large: {
      threshold: 8,
      description:
        "For larger test suites, a slightly higher threshold helps focus on the most problematic tests.",
    },
  },
  failureRecommendations: {
    small: {
      threshold: 8,
      description:
        "For smaller test suites, investigate tests that fail more than 8% of the time.",
    },
    medium: {
      threshold: 10,
      description:
        "A moderate threshold works well for medium-sized test suites.",
    },
    large: {
      threshold: 15,
      description:
        "For larger test suites, focus on the most consistently failing tests first.",
    },
  },
  repoSizeThresholds: {
    small: 20, // Repositories with < 20 tests are small
    medium: 50, // Repositories with 20-50 tests are medium, > 50 is large
  },
  guardrails: {
    maxExcludedTests: 10,
    maxExcludedTestsPercentage: 20,
    requireJiraTicket: true,
  },
};

export async function loader({ request }: LoaderFunctionArgs) {
  // In a real application, you would load these settings from a database
  // For now, we'll use the defaultGlobalSettings as a placeholder
  const globalSettings =
    (await prisma.globalSettings.findUnique({
      where: { id: "global" },
    })) || defaultGlobalSettings;

  // Get repositories to show impact of changes
  const repositories = await prisma.repository.findMany();

  return {
    globalSettings,
    repositories,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Parse form data for flake recommendations
  const smallFlakeThreshold = parseInt(
    formData.get("smallFlakeThreshold") as string,
    10,
  );
  const mediumFlakeThreshold = parseInt(
    formData.get("mediumFlakeThreshold") as string,
    10,
  );
  const largeFlakeThreshold = parseInt(
    formData.get("largeFlakeThreshold") as string,
    10,
  );

  const smallFlakeDescription = formData.get("smallFlakeDescription") as string;
  const mediumFlakeDescription = formData.get(
    "mediumFlakeDescription",
  ) as string;
  const largeFlakeDescription = formData.get("largeFlakeDescription") as string;

  // Parse form data for failure recommendations
  const smallFailureThreshold = parseInt(
    formData.get("smallFailureThreshold") as string,
    10,
  );
  const mediumFailureThreshold = parseInt(
    formData.get("mediumFailureThreshold") as string,
    10,
  );
  const largeFailureThreshold = parseInt(
    formData.get("largeFailureThreshold") as string,
    10,
  );

  const smallFailureDescription = formData.get(
    "smallFailureDescription",
  ) as string;
  const mediumFailureDescription = formData.get(
    "mediumFailureDescription",
  ) as string;
  const largeFailureDescription = formData.get(
    "largeFailureDescription",
  ) as string;

  // Parse form data for repo size thresholds
  const smallRepoThreshold = parseInt(
    formData.get("smallRepoThreshold") as string,
    10,
  );
  const mediumRepoThreshold = parseInt(
    formData.get("mediumRepoThreshold") as string,
    10,
  );

  // Parse form data for guardrails
  const maxExcludedTests = parseInt(
    formData.get("maxExcludedTests") as string,
    10,
  );
  const maxExcludedTestsPercentage = parseInt(
    formData.get("maxExcludedTestsPercentage") as string,
    10,
  );
  const requireJiraTicket = formData.get("requireJiraTicket") === "true";

  const errors: Record<string, string> = {};

  // Validate flake thresholds
  if (
    isNaN(smallFlakeThreshold) ||
    smallFlakeThreshold < 0 ||
    smallFlakeThreshold > 100
  ) {
    errors.smallFlakeThreshold =
      "Flake threshold must be a number between 0 and 100";
  }
  if (
    isNaN(mediumFlakeThreshold) ||
    mediumFlakeThreshold < 0 ||
    mediumFlakeThreshold > 100
  ) {
    errors.mediumFlakeThreshold =
      "Flake threshold must be a number between 0 and 100";
  }
  if (
    isNaN(largeFlakeThreshold) ||
    largeFlakeThreshold < 0 ||
    largeFlakeThreshold > 100
  ) {
    errors.largeFlakeThreshold =
      "Flake threshold must be a number between 0 and 100";
  }

  // Validate failure thresholds
  if (
    isNaN(smallFailureThreshold) ||
    smallFailureThreshold < 0 ||
    smallFailureThreshold > 100
  ) {
    errors.smallFailureThreshold =
      "Failure threshold must be a number between 0 and 100";
  }
  if (
    isNaN(mediumFailureThreshold) ||
    mediumFailureThreshold < 0 ||
    mediumFailureThreshold > 100
  ) {
    errors.mediumFailureThreshold =
      "Failure threshold must be a number between 0 and 100";
  }
  if (
    isNaN(largeFailureThreshold) ||
    largeFailureThreshold < 0 ||
    largeFailureThreshold > 100
  ) {
    errors.largeFailureThreshold =
      "Failure threshold must be a number between 0 and 100";
  }

  // Validate repo size thresholds
  if (isNaN(smallRepoThreshold) || smallRepoThreshold <= 0) {
    errors.smallRepoThreshold =
      "Small repo threshold must be a positive number";
  }

  if (isNaN(mediumRepoThreshold) || mediumRepoThreshold <= 0) {
    errors.mediumRepoThreshold =
      "Medium repo threshold must be a positive number";
  }

  if (smallRepoThreshold >= mediumRepoThreshold) {
    errors.smallRepoThreshold =
      "Small repo threshold must be less than medium repo threshold";
  }

  // Validate guardrails
  if (isNaN(maxExcludedTests) || maxExcludedTests < 0) {
    errors.maxExcludedTests =
      "Maximum excluded tests must be a positive number";
  }
  if (
    isNaN(maxExcludedTestsPercentage) ||
    maxExcludedTestsPercentage < 0 ||
    maxExcludedTestsPercentage > 100
  ) {
    errors.maxExcludedTestsPercentage =
      "Maximum excluded tests percentage must be between 0 and 100";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        flakeRecommendations: {
          small: {
            threshold: smallFlakeThreshold,
            description: smallFlakeDescription,
          },
          medium: {
            threshold: mediumFlakeThreshold,
            description: mediumFlakeDescription,
          },
          large: {
            threshold: largeFlakeThreshold,
            description: largeFlakeDescription,
          },
        },
        failureRecommendations: {
          small: {
            threshold: smallFailureThreshold,
            description: smallFailureDescription,
          },
          medium: {
            threshold: mediumFailureThreshold,
            description: mediumFailureDescription,
          },
          large: {
            threshold: largeFailureThreshold,
            description: largeFailureDescription,
          },
        },
        repoSizeThresholds: {
          small: smallRepoThreshold,
          medium: mediumRepoThreshold,
        },
        guardrails: {
          maxExcludedTests,
          maxExcludedTestsPercentage,
          requireJiraTicket,
        },
      },
    };
  }

  // Construct the global settings object
  const globalSettings: GlobalSettings = {
    flakeRecommendations: {
      small: {
        threshold: smallFlakeThreshold,
        description: smallFlakeDescription,
      },
      medium: {
        threshold: mediumFlakeThreshold,
        description: mediumFlakeDescription,
      },
      large: {
        threshold: largeFlakeThreshold,
        description: largeFlakeDescription,
      },
    },
    failureRecommendations: {
      small: {
        threshold: smallFailureThreshold,
        description: smallFailureDescription,
      },
      medium: {
        threshold: mediumFailureThreshold,
        description: mediumFailureDescription,
      },
      large: {
        threshold: largeFailureThreshold,
        description: largeFailureDescription,
      },
    },
    repoSizeThresholds: {
      small: smallRepoThreshold,
      medium: mediumRepoThreshold,
    },
    guardrails: {
      maxExcludedTests,
      maxExcludedTestsPercentage,
      requireJiraTicket,
    },
  };

  // Add id property to match the app type
  const settingsWithId = {
    ...globalSettings,
    id: "global",
  };

  // Update the global settings in the database
  await cypressService.updateGlobalSettings(settingsWithId);

  return redirect(`/global-settings`);
}

export default function GlobalSettings() {
  const { globalSettings, repositories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container">
      <div className="contents-start flex items-center justify-between">
        <PageHeader
          title="Global Settings"
          description="Configure global flake recommendations and test exclusion guardrails that apply to all repositories"
        />
      </div>

      <div className="space-y-6">
        <GlobalSettingsForm
          globalSettings={globalSettings}
          repositories={repositories}
          actionData={actionData}
        />
      </div>
    </div>
  );
}
