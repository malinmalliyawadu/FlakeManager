import { type LoaderFunctionArgs } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { Toaster } from "sonner";

import { AppHeader } from "~/components/app-header";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { getCypressService } from "~/services/cypress.server";

import "~/tailwind.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const repositories = await cypressService.getRepositories();

  const url = new URL(request.url);
  const selectedRepo = url.searchParams.get("repo") || "demo-repo";

  const repository = await cypressService.getRepository(selectedRepo);

  return {
    repositories,
    selectedRepo,
    repository,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { repositories, selectedRepo } = useLoaderData<typeof loader>();

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
        <ThemeProvider defaultTheme="system" storageKey="flake-manager-theme">
          <div className="flex min-h-screen flex-col">
            <AppHeader
              repositories={repositories}
              selectedRepo={selectedRepo}
            />

            <main className="bg-background flex-1">
              <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-8">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" richColors closeButton />
          <ScrollRestoration />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
