import { cssBundleHref } from "@remix-run/css-bundle";
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Toaster } from "sonner";
import { getCypressService } from "~/services/cypress.server";
import { type Repository } from "~/types/cypress";
import { AppHeader } from "~/components/app-header";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const repositories = await cypressService.getRepositories();

  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repository = await cypressService.getRepository(selectedRepo);

  return json({
    repositories,
    selectedRepo,
    repository,
  });
}

export default function App() {
  const { repositories, selectedRepo, repository } =
    useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Flake Manager</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-background h-full">
        <div className="flex min-h-screen flex-col">
          <AppHeader
            repositories={repositories}
            selectedRepo={selectedRepo}
            repository={repository}
          />

          <main className="bg-background flex-1">
            <div className="mx-auto max-w-screen-lg px-4 py-8 md:px-8">
              <Outlet />
            </div>
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
