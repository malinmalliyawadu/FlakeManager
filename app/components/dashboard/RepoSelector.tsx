import { Repository } from "@prisma/client";
import { FolderGit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface RepoSelectorProps {
  repositories: Repository[];
  selectedRepo: string;
}

export function RepoSelector({
  repositories,
  selectedRepo,
}: RepoSelectorProps) {
  const [value, setValue] = useState(selectedRepo);

  useEffect(() => {
    setValue(selectedRepo);
  }, [selectedRepo]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    // Immediately navigate to the selected repo
    window.location.href = `/dashboard?repo=${newValue}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-64">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className="border-input bg-background">
            <div className="flex items-center space-x-2">
              <FolderGit2 className="text-muted-foreground h-4 w-4" />
              <SelectValue placeholder="Select a repository" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {repositories.map((repo) => (
              <SelectItem key={repo.id} value={repo.id}>
                <div className="flex flex-col">
                  <span>{repo.name}</span>
                  <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                    {repo.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button asChild variant="outline" size="sm">
        <Link to={`/repos/add`}>Add Repository</Link>
      </Button>
    </div>
  );
}
