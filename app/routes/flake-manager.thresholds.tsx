import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";

// In a real app, these would be stored in a database or config file
const DEFAULT_THRESHOLDS = {
  flakeThreshold: 5,
  failureThreshold: 10,
};

// Mock thresholds for now
let currentThresholds = { ...DEFAULT_THRESHOLDS };

export async function loader() {
  return json({ thresholds: currentThresholds });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const flakeThreshold = parseInt(formData.get("flakeThreshold") as string, 10);
  const failureThreshold = parseInt(
    formData.get("failureThreshold") as string,
    10,
  );

  const errors: Record<string, string> = {};

  if (isNaN(flakeThreshold) || flakeThreshold < 0 || flakeThreshold > 100) {
    errors.flakeThreshold =
      "Flake threshold must be a number between 0 and 100";
  }

  if (
    isNaN(failureThreshold) ||
    failureThreshold < 0 ||
    failureThreshold > 100
  ) {
    errors.failureThreshold =
      "Failure threshold must be a number between 0 and 100";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { flakeThreshold, failureThreshold } });
  }

  // Update thresholds (in a real app, this would save to a database)
  currentThresholds = {
    flakeThreshold,
    failureThreshold,
  };

  return redirect("/flake-manager");
}

export default function ThresholdsPage() {
  const { thresholds } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [flakeThreshold, setFlakeThreshold] = useState(
    actionData?.values?.flakeThreshold ?? thresholds.flakeThreshold,
  );
  const [failureThreshold, setFailureThreshold] = useState(
    actionData?.values?.failureThreshold ?? thresholds.failureThreshold,
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Configure Thresholds
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Set thresholds for when tests should be automatically excluded from
            test runs.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Form method="post" className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="flakeThreshold"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Flake Rate Threshold (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="flakeThreshold"
                      id="flakeThreshold"
                      min="0"
                      max="100"
                      value={flakeThreshold}
                      onChange={(e) =>
                        setFlakeThreshold(parseInt(e.target.value) || 0)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  {actionData?.errors?.flakeThreshold && (
                    <p className="mt-2 text-sm text-red-600">
                      {actionData.errors.flakeThreshold}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Tests with a flake rate above this percentage will be
                    automatically excluded.
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="failureThreshold"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Failure Rate Threshold (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="failureThreshold"
                      id="failureThreshold"
                      min="0"
                      max="100"
                      value={failureThreshold}
                      onChange={(e) =>
                        setFailureThreshold(parseInt(e.target.value) || 0)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  {actionData?.errors?.failureThreshold && (
                    <p className="mt-2 text-sm text-red-600">
                      {actionData.errors.failureThreshold}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Tests with a failure rate above this percentage will be
                    automatically excluded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <a
                href="/flake-manager"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
