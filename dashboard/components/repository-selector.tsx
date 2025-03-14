"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This would be fetched from an API in a real application
const dummyRepositories = [
  { id: "1", name: "frontend-app", owner: "org" },
  { id: "2", name: "backend-api", owner: "org" },
  { id: "3", name: "mobile-app", owner: "org" },
];

export default function RepositorySelector() {
  const [selectedRepo, setSelectedRepo] = useState(dummyRepositories[0].id);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Select
          value={selectedRepo}
          onValueChange={(value) => setSelectedRepo(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select repository" />
          </SelectTrigger>
          <SelectContent>
            {dummyRepositories.map((repo) => (
              <SelectItem key={repo.id} value={repo.id}>
                {repo.owner}/{repo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="sm">
        Refresh Data
      </Button>
    </div>
  );
}
