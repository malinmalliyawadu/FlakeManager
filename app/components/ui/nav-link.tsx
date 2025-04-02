import { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "~/lib/utils";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  width?: string;
}

export function NavLink({
  to,
  icon: Icon,
  label,
  isActive,
  width = "w-20",
}: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col items-center gap-1.5 pt-1",
        isActive && "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full p-1.5 transition-all duration-200",
          isActive
            ? "bg-blue-100 text-blue-700 shadow-xs dark:bg-blue-900/40 dark:text-blue-400"
            : "bg-blue-100/50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400",
        )}
      >
        <Icon className="h-full w-full" />
      </div>
      <span
        className={cn(
          width,
          "text-center text-xs font-medium transition-colors",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400",
        )}
      >
        <span className={isActive ? "font-semibold" : ""}>{label}</span>
      </span>
      <div
        className={cn(
          "h-[2px] w-full rounded-full bg-blue-500 transition-transform duration-200 dark:bg-blue-400",
          isActive ? "scale-100" : "scale-0 group-hover:scale-100",
        )}
      />
    </Link>
  );
}
