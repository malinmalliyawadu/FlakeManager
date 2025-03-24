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
  Link,
  Form,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { Toaster } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Database,
  ExternalLink,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getCypressService } from "~/services/cypress.server";
import { type Repository } from "~/types/cypress";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRepoChange = (value: string) => {
    // Create a new URLSearchParams instance from the current ones
    const newParams = new URLSearchParams(searchParams);
    // Update the repo parameter
    newParams.set("repo", value);
    // Navigate to the current path with updated search params
    navigate(`${window.location.pathname}?${newParams.toString()}`);
  };

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
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b px-4 backdrop-blur">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <Link
                  to="/dashboard"
                  className="mr-6 flex items-center space-x-2"
                >
                  <span className="font-bold tracking-tight">
                    Flake Manager
                  </span>
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <Link
                    to={`/dashboard?repo=${selectedRepo}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to={`/thresholds?repo=${selectedRepo}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Thresholds</span>
                  </Link>
                </nav>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={selectedRepo}
                    onValueChange={handleRepoChange}
                  >
                    <SelectTrigger className="w-[240px]">
                      <Database className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo: Repository) => (
                        <SelectItem key={repo.id} value={repo.id}>
                          <div className="flex items-center">
                            <span>
                              {repo.name} ({repo.testCount} tests)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://docs.cypress.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Cypress Docs
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </header>

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
