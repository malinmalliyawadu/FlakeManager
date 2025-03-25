import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Activity, CheckCircle, XCircle, Ticket } from "lucide-react";

interface StatsProps {
  counts: {
    total: number;
    excluded: number;
    included: number;
    needsTicket: number;
  };
}

export function DashboardStats({ counts }: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Tests"
        value={counts.total}
        icon={<Activity className="h-5 w-5 text-primary" />}
        description="All tests in the repository"
      />

      <StatsCard
        title="Excluded Tests"
        value={counts.excluded}
        icon={<XCircle className="h-5 w-5 text-destructive" />}
        description="Tests currently excluded from CI"
        valueClassName="text-destructive"
      />

      <StatsCard
        title="Included Tests"
        value={counts.included}
        icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        description="Tests running in your CI pipeline"
        valueClassName="text-emerald-600"
      />

      <StatsCard
        title="Needs Jira Ticket"
        value={counts.needsTicket}
        icon={<Ticket className="h-5 w-5 text-amber-500" />}
        description="Tests exceeding thresholds without tickets"
        valueClassName={counts.needsTicket > 0 ? "text-amber-500" : ""}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

function StatsCard({
  title,
  value,
  icon,
  description,
  valueClassName = "",
}: StatsCardProps) {
  return (
    <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
