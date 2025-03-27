import { CalendarRange, Clock } from "lucide-react";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TimePeriodSelectorProps {
  timePeriod: string;
  onChange: (value: string) => void;
}

export function TimePeriodSelector({
  timePeriod,
  onChange,
}: TimePeriodSelectorProps) {
  const handleValueChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Time Period:</span>
      </div>

      <Select value={timePeriod} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Select the time period for which the test metrics should be
              calculated. This affects which tests will be considered for the
              threshold analysis.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
