import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  Database,
  Gauge,
  LayoutDashboard,
  Snowflake,
  Settings,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { type Repository } from "~/types/cypress";

import { ThemeToggle } from "./ui/theme-toggle";

interface AppHeaderProps {
  repositories: Repository[];
  selectedRepo: string;
}

export function AppHeader({ repositories, selectedRepo }: AppHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Check if a path is active - exact match or starts with path
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath.startsWith(path);
  };

  const isDashboardActive = isActive("/dashboard");
  const isThresholdsActive = isActive("/thresholds");
  const isRepositoriesActive = isActive("/repositories");
  const isGlobalSettingsActive = location.pathname === "/global-settings";

  const handleRepoChange = (value: string) => {
    // Create a new URLSearchParams instance from the current ones
    const newParams = new URLSearchParams(searchParams);
    // Update the repo parameter
    newParams.set("repo", value);
    // Navigate to the current path with updated search params
    navigate(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-blue-50/70 via-background to-cyan-50/70 backdrop-blur supports-[backdrop-filter]:bg-opacity-80 dark:border-slate-800 dark:from-slate-950/90 dark:to-slate-900/90">
      <div className="mx-auto max-w-screen-xl px-4 pt-1 md:px-8">
        <div className="flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link
              to="/dashboard"
              className="group mr-10 flex items-center gap-3 transition-colors hover:opacity-90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-300 shadow-sm transition-all duration-300 ease-in-out group-hover:shadow-md">
                <Snowflake className="h-6 w-6 text-white drop-shadow-sm transition-transform duration-700 ease-in-out group-hover:rotate-180" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-extrabold leading-none tracking-tight text-transparent dark:from-blue-400 dark:to-cyan-300">
                  Flake Manager
                </span>
                <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                  CYPRESS SUITE MANAGEMENT
                </span>
              </div>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link
                to={`/dashboard?repo=${selectedRepo}`}
                className={cn(
                  "group flex flex-col items-center gap-1.5 pt-1",
                  isDashboardActive && "pointer-events-none",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-all duration-200",
                    isDashboardActive
                      ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-blue-100/50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400",
                  )}
                >
                  <LayoutDashboard className="h-full w-full" />
                </div>
                <span
                  className={cn(
                    "w-16 text-center text-xs font-medium transition-colors",
                    isDashboardActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  )}
                >
                  <span className={isDashboardActive ? "font-semibold" : ""}>
                    Dashboard
                  </span>
                </span>
                <div
                  className={cn(
                    "h-[2px] w-full rounded-full bg-blue-500 transition-transform duration-200 dark:bg-blue-400",
                    isDashboardActive
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100",
                  )}
                />
              </Link>
              <Link
                to={`/thresholds?repo=${selectedRepo}`}
                className={cn(
                  "group flex flex-col items-center gap-1.5 pt-1",
                  isThresholdsActive && "pointer-events-none",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-all duration-200",
                    isThresholdsActive
                      ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-blue-100/50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400",
                  )}
                >
                  <Gauge className="h-full w-full" />
                </div>
                <span
                  className={cn(
                    "w-16 text-center text-xs font-medium transition-colors",
                    isThresholdsActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  )}
                >
                  <span className={isThresholdsActive ? "font-semibold" : ""}>
                    Thresholds
                  </span>
                </span>
                <div
                  className={cn(
                    "h-[2px] w-full rounded-full bg-blue-500 transition-transform duration-200 dark:bg-blue-400",
                    isThresholdsActive
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100",
                  )}
                />
              </Link>
              <Link
                to="/repositories"
                className={cn(
                  "group flex flex-col items-center gap-1.5 pt-1",
                  isRepositoriesActive && "pointer-events-none",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-all duration-200",
                    isRepositoriesActive
                      ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-blue-100/50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400",
                  )}
                >
                  <Database className="h-full w-full" />
                </div>
                <span
                  className={cn(
                    "w-20 text-center text-xs font-medium transition-colors",
                    isRepositoriesActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  )}
                >
                  <span className={isRepositoriesActive ? "font-semibold" : ""}>
                    Repositories
                  </span>
                </span>
                <div
                  className={cn(
                    "h-[2px] w-full rounded-full bg-blue-500 transition-transform duration-200 dark:bg-blue-400",
                    isRepositoriesActive
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100",
                  )}
                />
              </Link>
              <Link
                to="/global-settings"
                className={cn(
                  "group flex flex-col items-center gap-1.5 pt-1",
                  isGlobalSettingsActive && "pointer-events-none",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-all duration-200",
                    isGlobalSettingsActive
                      ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-blue-100/50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400",
                  )}
                >
                  <Settings className="h-full w-full" />
                </div>
                <span
                  className={cn(
                    "w-20 text-center text-xs font-medium transition-colors",
                    isGlobalSettingsActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  )}
                >
                  <span
                    className={isGlobalSettingsActive ? "font-semibold" : ""}
                  >
                    Settings
                  </span>
                </span>
                <div
                  className={cn(
                    "h-[2px] w-full rounded-full bg-blue-500 transition-transform duration-200 dark:bg-blue-400",
                    isGlobalSettingsActive
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100",
                  )}
                />
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <Select
              defaultValue={selectedRepo}
              onValueChange={handleRepoChange}
            >
              <SelectTrigger className="h-10 w-[240px] border-blue-100/80 bg-white/70 focus:ring-blue-200 dark:border-blue-900/30 dark:bg-slate-900/70 dark:focus:ring-blue-800">
                <Database className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
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
        </div>
      </div>
    </header>
  );
}
