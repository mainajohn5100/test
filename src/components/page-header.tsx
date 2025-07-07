import { cn } from "@/lib/utils";
import React from "react";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start justify-between gap-4 mb-6", className)}>
      <div className="grid gap-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground/90">
          {title}
        </h1>
        {description && (
          <div className="text-muted-foreground">{description}</div>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
