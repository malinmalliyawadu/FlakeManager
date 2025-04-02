import { type Repository } from "@prisma/client";
import { Database, Gauge, LayoutDashboard, Settings } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { AppLogo } from "~/components/ui/app-logo";
import { NavLink } from "~/components/ui/nav-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
    <header className="via-background supports-backdrop-filter:bg-opacity-80 sticky top-0 z-10 border-b bg-linear-to-r from-blue-50/70 to-cyan-50/70 backdrop-blur-sm dark:border-slate-800 dark:from-slate-950/90 dark:to-slate-900/90">
      <div className="mx-auto max-w-(--breakpoint-xl) px-4 pt-1 md:px-8">
        <div className="flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <AppLogo />
            <nav className="flex items-center gap-5 text-sm">
              <NavLink
                to={`/dashboard?repo=${selectedRepo}`}
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={isDashboardActive}
              />
              <NavLink
                to={`/thresholds?repo=${selectedRepo}`}
                icon={Gauge}
                label="Thresholds"
                isActive={isThresholdsActive}
              />
              <NavLink
                to="/repositories"
                icon={Database}
                label="Repositories"
                isActive={isRepositoriesActive}
              />
              <NavLink
                to="/global-settings"
                icon={Settings}
                label="Settings"
                isActive={isGlobalSettingsActive}
              />
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
