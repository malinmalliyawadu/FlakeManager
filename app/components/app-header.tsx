import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Database,
  ExternalLink,
  LayoutDashboard,
  Settings,
  Snowflake,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type Repository } from "~/types/cypress";

interface AppHeaderProps {
  repositories: Repository[];
  selectedRepo: string;
  repository: Repository | null;
}

export function AppHeader({
  repositories,
  selectedRepo,
  repository,
}: AppHeaderProps) {
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
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8">
        <div className="flex h-14 items-center">
          <div className="mr-4 flex">
            <Link
              to="/dashboard"
              className="group mr-6 flex items-center gap-2 transition-colors hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-300 shadow-sm transition-all duration-300 ease-in-out group-hover:shadow-md">
                <Snowflake className="h-5 w-5 text-white drop-shadow-sm transition-transform duration-700 ease-in-out group-hover:rotate-180" />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-lg font-extrabold leading-none tracking-tight text-transparent">
                  Flake Manager
                </span>
                <span className="text-muted-foreground text-[10px] font-medium">
                  CYPRESS TEST MANAGEMENT
                </span>
              </div>
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
      </div>
    </header>
  );
}
