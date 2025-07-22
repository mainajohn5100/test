// components/ui/chart-tooltip.tsx
'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

// Base tooltip content interface
interface TooltipPayload {
  name: string;
  value: number | string;
  color: string;
  dataKey?: string;
  payload?: any;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  className?: string;
  showLabel?: boolean;
  showColor?: boolean;
  formatter?: (value: number | string, name: string, props: any) => [React.ReactNode, string];
  labelFormatter?: (label: string) => React.ReactNode;
  separator?: string;
  // This prop is passed by recharts but not used, so we accept it to avoid spreading it to the div
  accessibilityLayer?: any;
}

// Main tooltip content component
export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({
  active,
  payload,
  label,
  className,
  showLabel = true,
  showColor = true,
  formatter,
  labelFormatter,
  separator = ": ",
  ...props
}, ref) => {
  if (!active || !payload?.length) {
    return null;
  }

  // Destructure to remove any other unknown props that Recharts might pass
  const { 
    accessibilityLayer, 
    viewBox,
    offset,
    coordinate,
    cursor,
    isAnimationActive,
    animationDuration,
    animationEasing,
    filter,
    itemSorter,
    ...restProps // only restProps which we are confident are valid HTML attributes will be spread, which in this case should be none from recharts
  } = props as any;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-3 text-sm shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      // Only spread valid div props if needed in the future, for now, we pass none.
      // {...restProps} 
    >
      {showLabel && label && (
        <div className="font-medium text-foreground mb-1.5">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const value = formatter 
            ? formatter(entry.value, entry.name, entry)[0]
            : entry.value;
          const name = formatter
            ? formatter(entry.value, entry.name, entry)[1] 
            : entry.name;

          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {showColor && (
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-muted-foreground">{name}</span>
              <span className="font-medium text-foreground ml-auto">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ChartTooltipContent.displayName = "ChartTooltipContent";

// Predefined tooltip configurations for different chart types
export const tooltipConfigs = {
  // Standard configuration
  default: {
    cursor: { fill: "rgba(0, 0, 0, 0.05)" },
    content: <ChartTooltipContent />
  },
  
  // Line chart specific
  line: {
    cursor: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 },
    content: <ChartTooltipContent />
  },
  
  // Bar chart specific  
  bar: {
    cursor: { fill: "rgba(0, 0, 0, 0.08)" },
    content: <ChartTooltipContent />
  },
  
  // Pie chart specific
  pie: {
    content: <ChartTooltipContent showLabel={false} />
  },
  
  // Area chart specific
  area: {
    cursor: { fill: "rgba(0, 0, 0, 0.05)" },
    content: <ChartTooltipContent />
  }
};

// Hook for creating custom tooltip configurations
export const useChartTooltip = (
  type: keyof typeof tooltipConfigs = 'default',
  customProps?: Partial<ChartTooltipContentProps>
) => {
  return React.useMemo(() => ({
    ...tooltipConfigs[type],
    content: <ChartTooltipContent {...customProps} />
  }), [type, customProps]);
};

// Utility formatters that can be reused
export const tooltipFormatters = {
  // Format numbers with commas
  number: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString();
  },
  
  // Format as percentage
  percentage: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  },
  
  // Format as currency
  currency: (value: number | string, currency = 'USD') => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  },
  
  // Format date labels
  date: (label: string) => {
    try {
      return new Date(label).toLocaleDateString();
    } catch {
      return label;
    }
  }
};

// Example usage components for different chart types
export const TooltipExamples = {
  // Custom formatter example
  withFormatter: (
    <ChartTooltipContent 
      formatter={(value, name) => [
        tooltipFormatters.number(value),
        name
      ]}
    />
  ),
  
  // Currency tooltip
  currency: (
    <ChartTooltipContent 
      formatter={(value, name) => [
        tooltipFormatters.currency(value),
        name
      ]}
    />
  ),
  
  // Percentage tooltip
  percentage: (
    <ChartTooltipContent 
      formatter={(value, name) => [
        tooltipFormatters.percentage(value),
        name
      ]}
    />
  ),
  
  // No color indicators
  noColor: (
    <ChartTooltipContent showColor={false} />
  ),
  
  // Custom styling
  custom: (
    <ChartTooltipContent 
      className="bg-card border-2 border-primary/20"
      separator=" → "
    />
  )
};