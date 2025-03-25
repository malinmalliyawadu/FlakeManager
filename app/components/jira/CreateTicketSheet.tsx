import { useState } from "react";
import { Form, useSubmit, useLocation } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "~/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type Test } from "~/types/cypress";

interface CreateTicketSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  repositoryId: string;
}

// Sample Jira boards for the demo
const JIRA_BOARDS = [
  { id: "FLAKE", name: "Flaky Tests" },
  { id: "BUG", name: "Bugs" },
  { id: "TECH", name: "Tech Debt" },
  { id: "QA", name: "QA Tasks" },
];

export function CreateTicketSheet({
  isOpen,
  onOpenChange,
  test,
  repositoryId,
}: CreateTicketSheetProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedBoard, setSelectedBoard] = useState(JIRA_BOARDS[0].id);
  const submit = useSubmit();
  const location = useLocation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Add the current URL as the returnTo parameter
    formData.append("returnTo", location.pathname + location.search);

    const data = Object.fromEntries(formData.entries());

    // Basic validation
    const schema = z.object({
      summary: z.string().min(5, "Summary must be at least 5 characters"),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      board: z.string().min(1, "Board is required"),
    });

    try {
      schema.parse(data);

      // Clear errors before submitting
      setFormErrors({});

      // Submit form data
      submit(formData, { method: "post", action: "/api/create-jira-ticket" });

      // Close the sheet after submission
      onOpenChange(false);
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

        <Form
          method="post"
          action="/api/create-jira-ticket"
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
          <input type="hidden" name="testId" value={test.id} />
          <input type="hidden" name="repo" value={repositoryId} />

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
            <Select
              name="board"
              defaultValue={selectedBoard}
              onValueChange={setSelectedBoard}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a board" />
              </SelectTrigger>
              <SelectContent>
                {JIRA_BOARDS.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.board && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.board}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Ticket Summary</Label>
            <Input
              id="summary"
              name="summary"
              defaultValue={`[${selectedBoard}] Fix test: ${test.name}`}
              placeholder="Enter a concise summary"
              required
            />
            {formErrors.summary && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.summary}
              </p>
            )}
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
- Board: ${selectedBoard}`}
              placeholder="Describe the issue and provide context"
              required
            />
            {formErrors.description && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {formErrors.description}
              </p>
            )}
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" className="w-full">
              Create Jira Ticket
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
