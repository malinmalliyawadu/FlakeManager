import { Search, XCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface TableSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function TableSearch({
  onSearch,
  placeholder = "Search tests...",
  debounceMs = 300,
}: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Update debounced value after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debounceMs]);

  // Call onSearch when debounced search term changes
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="w-full pl-9 pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm ? <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={clearSearch}
          >
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear search</span>
          </Button> : null}
      </div>
    </div>
  );
}
