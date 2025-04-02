import { Repository, Test } from "@prisma/client";
import { useLoaderData } from "react-router-dom";

import { getCypressService } from "~/services/cypress.server";

interface RepositoryWithTests extends Repository {
  tests: Test[];
}

export async function loader() {
  const cypressService = getCypressService();

  // Get single repository by ID
  const repository = await cypressService.getRepository("cneqxh");
  console.log("Repository data:", repository);

  if (!repository) {
    return { repositories: [] };
  }

  // Get tests for the repository
  const tests = await cypressService.getTestsForRepo("cneqxh");
  console.log("Tests data:", tests);

  return {
    repositories: [
      {
        ...repository,
        tests,
      },
    ],
  };
}

export default function DemoPage() {
  const { repositories } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Cypress Cloud Demo</h1>

      <div className="space-y-8">
        {repositories.map((repo: RepositoryWithTests) => (
          <div
            key={repo.id}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-xl font-semibold">{repo.name}</h2>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Test Count</p>
                <p className="text-lg font-medium">{repo.testCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-lg font-medium">{repo.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Tests</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Flake Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Failure Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {repo.tests.map((test: Test) => (
                      <tr key={test.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {test.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {test.file}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {test.flakeRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {test.failureRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                              test.excluded
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {test.excluded ? "Excluded" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
