
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
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4", className)}>
      <div className="grid gap-1 flex-1">
        <h1 className={cn(
          "font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground/90 transition-all",
          "group-data-[shrunk=true]/header:text-xl"
        )}>
          {title}
        </h1>
        {description && (
          <div className={cn(
            "text-muted-foreground transition-opacity",
            "group-data-[shrunk=true]/header:opacity-0 group-data-[shrunk=true]/header:h-0"
          )}>
            {description}
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
