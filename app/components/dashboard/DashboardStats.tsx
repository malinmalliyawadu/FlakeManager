import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Activity, CheckCircle, XCircle } from "lucide-react";

interface StatsProps {
  counts: {
    total: number;
    excluded: number;
    included: number;
  };
}

export function DashboardStats({ counts }: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Tests"
        value={counts.total}
        icon={<Activity className="text-primary h-5 w-5" />}
        description="All tests in the repository"
      />

      <StatsCard
        title="Excluded Tests"
        value={counts.excluded}
        icon={<XCircle className="text-destructive h-5 w-5" />}
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
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
