import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form as RemixForm,
  useActionData,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  Database,
  Save,
  ExternalLink,
  Server,
  Settings,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { getCypressService } from "~/services/cypress.server";
import { getJiraService } from "~/services/jira.server";
import { type Repository } from "~/types/cypress";
import { type JiraBoard } from "~/services/jira.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

export async function loader({ request }: LoaderFunctionArgs) {
  const cypressService = getCypressService();
  const jiraService = getJiraService();

  const repositories = await cypressService.getRepositories();
  const boards = await jiraService.getBoards();

  return json({
    repositories,
    boards,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cypressService = getCypressService();

  const repoId = formData.get("repoId") as string;
  const defaultJiraBoard = formData.get("defaultJiraBoard") as string;

  const errors: Record<string, string> = {};

  if (!repoId) {
    errors.repoId = "Repository ID is required";
  }

  if (!defaultJiraBoard) {
    errors.defaultJiraBoard = "Default JIRA board is required";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { repoId, defaultJiraBoard } });
  }

  // Update the repository JIRA board
  await cypressService.updateRepositoryJiraBoard(repoId, defaultJiraBoard);

  return redirect(`/repositories`);
}

export default function Repositories() {
  const { repositories, boards } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container">
      <div className="contents-start mb-6 flex items-center justify-between">
        <PageHeader
          title="Repository Management"
          description="Manage test repositories and their JIRA integration settings"
        />
        <Button variant="outline" asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Repository Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure default JIRA boards for each repository to automatically
            create tickets for flaky and failing tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Repository</TableHead>
                  <TableHead className="font-medium">Tests</TableHead>
                  <TableHead className="font-medium">Thresholds</TableHead>
                  <TableHead className="w-[250px] font-medium">
                    JIRA Board
                  </TableHead>
                  <TableHead className="text-right font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repositories.map((repo) => (
                  <TableRow key={repo.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{repo.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {repo.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {repo.testCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                          Flake: {repo.flakeThreshold}%
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                          Fail: {repo.failureThreshold}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RepositoryJiraBoardForm
                        repo={repo}
                        boards={boards}
                        errors={actionData?.errors}
                        isSubmitting={isSubmitting}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          asChild
                          size="sm"
                          className="h-8"
                        >
                          <Link
                            to={`/thresholds?repo=${repo.id}`}
                            className="flex items-center gap-1"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Thresholds</span>
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          size="sm"
                          className="h-8"
                        >
                          <Link
                            to={`/dashboard?repo=${repo.id}`}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Tests</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Server className="mr-2 h-4 w-4" />
            <span>Total Repositories: {repositories.length}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function RepositoryJiraBoardForm({
  repo,
  boards,
  errors,
  isSubmitting,
}: {
  repo: Repository;
  boards: JiraBoard[];
  errors?: Record<string, string>;
  isSubmitting: boolean;
}) {
  const [selectedBoard, setSelectedBoard] = useState<string>(
    repo.defaultJiraBoard || "",
  );

  const hasChanged = selectedBoard !== repo.defaultJiraBoard;

  return (
    <div className="space-y-1">
      <RemixForm method="post" className="flex items-center gap-2">
        <input type="hidden" name="repoId" value={repo.id} />
        <div className="flex-1">
          <Select
            name="defaultJiraBoard"
            value={selectedBoard}
            onValueChange={(value) => setSelectedBoard(value)}
          >
            <SelectTrigger
              className={`w-full ${hasChanged ? "border-amber-500" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="Select board" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.key} value={board.key}>
                  <div className="flex items-center">
                    <span>
                      {board.name}{" "}
                      <span className="font-mono text-xs">({board.key})</span>
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-9"
          disabled={
            isSubmitting ||
            selectedBoard === "" ||
            selectedBoard === repo.defaultJiraBoard
          }
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Server className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="mr-1 h-3 w-3" />
              Save
            </span>
          )}
        </Button>
      </RemixForm>
      {errors?.defaultJiraBoard && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle className="h-3 w-3" />
          {errors.defaultJiraBoard}
        </p>
      )}
      {hasChanged && (
        <p className="flex items-center gap-1 text-xs text-amber-500">
          <AlertCircle className="h-3 w-3" />
          Board changed, click Save to update
        </p>
      )}
    </div>
  );
}
