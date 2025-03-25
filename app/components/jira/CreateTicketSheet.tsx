import { Form, useLocation } from "@remix-run/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { type JiraBoard } from "~/services/jira.server";
import { type Test } from "~/types/cypress";

interface CreateTicketSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  repositoryId: string;
  defaultBoard?: string;
}

export function CreateTicketSheet({
  isOpen,
  onOpenChange,
  test,
  repositoryId,
  defaultBoard,
}: CreateTicketSheetProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedBoard, setSelectedBoard] = useState(defaultBoard || "");
  const [boards, setBoards] = useState<JiraBoard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Fetch JIRA boards when the component mounts
  useEffect(() => {
    async function fetchBoards() {
      setIsLoading(true);
      try {
        const response = await fetch("/repositories");
        if (!response.ok) throw new Error("Failed to fetch boards");
        const data = await response.json();
        setBoards(data.boards || []);

        // Set the selected board to the default board from the repository if available
        if (!selectedBoard && defaultBoard) {
          setSelectedBoard(defaultBoard);
        } else if (!selectedBoard && data.boards?.length > 0) {
          setSelectedBoard(data.boards[0].key);
        }
      } catch (error) {
        console.error("Error fetching JIRA boards:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen, defaultBoard, selectedBoard]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Convert form to JSON for the API
    const jsonData = {
      testId: test?.id,
      repository: repositoryId,
      board: selectedBoard,
      summary: formData.get("summary"),
      description: formData.get("description"),
      isManualCreation: true,
      returnTo: location.pathname + location.search,
    };

    // Basic validation
    const schema = z.object({
      summary: z.string().min(5, "Summary must be at least 5 characters"),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      board: z.string().min(1, "Board is required"),
    });

    try {
      schema.parse({
        summary: jsonData.summary,
        description: jsonData.description,
        board: jsonData.board,
      });

      // Clear errors before submitting
      setFormErrors({});

      // Submit JSON data
      fetch("/api/create-jira-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create ticket");
          }
          return response.json();
        })
        .then(() => {
          // Close the sheet after successful submission
          onOpenChange(false);
          // Reload the page to show the new ticket
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error creating ticket:", error);
          setFormErrors({
            submit: "Failed to create ticket. Please try again.",
          });
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  if (!test) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle>Create Jira Ticket</SheetTitle>
          <SheetDescription>
            Create a Jira ticket to track issues with this test
          </SheetDescription>
        </SheetHeader>

        <Form method="post" onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="font-medium">Test Details</div>
            <div className="rounded-md bg-secondary/50 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{test.name}</div>
                <div className="font-medium">File:</div>
                <div className="font-mono text-xs">{test.file}</div>
                <div className="font-medium">Flake Rate:</div>
                <div>{test.flakeRate}%</div>
                <div className="font-medium">Failure Rate:</div>
                <div>{test.failureRate}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board">Jira Board</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading boards...</span>
              </div>
            ) : (
              <Select
                name="board"
                value={selectedBoard}
                onValueChange={setSelectedBoard}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.key} value={board.key}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {formErrors.board ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.board}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Ticket Summary</Label>
            <Input
              id="summary"
              name="summary"
              defaultValue={`[${selectedBoard || "JIRA"}] Fix test: ${test.name}`}
              placeholder="Enter a concise summary"
              required
            />
            {formErrors.summary ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.summary}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={`This ticket is for resolving issues with the test "${test.name}" in the repository.
              
Test details:
- File: ${test.file}
- Flake Rate: ${test.flakeRate}%
- Failure Rate: ${test.failureRate}%
- Board: ${selectedBoard || "JIRA"}`}
              placeholder="Describe the issue and provide context"
              required
            />
            {formErrors.description ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.description}
              </p>
            ) : null}
          </div>

          {formErrors.submit ? (
            <p className="flex items-center gap-1 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {formErrors.submit}
            </p>
          ) : null}

          <SheetFooter className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !selectedBoard}
            >
              Create Jira Ticket
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
