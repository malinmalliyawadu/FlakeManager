import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";

import { PageHeader } from "~/components/page-header";
import { GlobalSettingsForm } from "~/components/global-settings/GlobalSettingsForm";
import { getCypressService } from "~/services/cypress.server";

// Global settings schema
export type GlobalSettings = {
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
  guardrails: {
    maxExcludedTests: number;
    maxExcludedTestsPercentage: number;
    requireJiraTicket: boolean;
  };
};

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
  guardrails: {
    maxExcludedTests: 10,
    maxExcludedTestsPercentage: 20,
    requireJiraTicket: true,
  },
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();

  // In a real application, you would load these settings from a database
  // For now, we'll use the defaultGlobalSettings as a placeholder
  const globalSettings =
    (await cypressService.getGlobalSettings()) || defaultGlobalSettings;

  // Get repositories to show impact of changes
  const repositories = await cypressService.getRepositories();

  return json({
    globalSettings,
    repositories,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cypressService = getCypressService();

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
    return json({
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
        guardrails: {
          maxExcludedTests,
          maxExcludedTestsPercentage,
          requireJiraTicket,
        },
      },
    });
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
