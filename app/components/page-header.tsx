import React from "react";

import { Heading } from "~/components/ui/typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 pb-8 md:flex-row md:items-center">
      <div>
        <Heading as="h1" variant="h2">
          {title}
        </Heading>
        {description ? (
          <p className="text-muted-foreground mt-2">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-4">{children}</div>
      ) : null}
    </div>
  );
}
