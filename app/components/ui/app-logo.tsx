import { Link } from "react-router";
import { Snowflake } from "lucide-react";

interface AppLogoProps {
  to?: string;
}

export function AppLogo({ to = "/dashboard" }: AppLogoProps) {
  return (
    <Link
      to={to}
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
  );
}
