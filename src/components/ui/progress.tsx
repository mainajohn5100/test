
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    ticketStatusData?: { name: string; value: number; color: string }[];
    total?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ticketStatusData, total, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    {ticketStatusData && total ? (
        <div className="flex h-full">
            {ticketStatusData.map((item, index) => (
                <div 
                    key={index} 
                    className="h-full transition-all"
                    style={{ 
                        width: `${(item.value / total) * 100}%`,
                        backgroundColor: item.color,
                     }}
                />
            ))}
        </div>
    ) : (
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
