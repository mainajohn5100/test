
'use client';

// This file is deprecated and its contents have been moved to more specific chart components.
// It is kept to prevent breaking imports, but can be removed in a future cleanup.

import * as React from "react";
import type { Ticket, User } from "@/lib/data";

export function AgentPerformanceCharts({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    return (
        <div className="text-center text-muted-foreground p-8">
            Agent performance charts have been moved to their own component.
        </div>
    );
}

export function LongTermTrendsCharts({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className="text-center text-muted-foreground p-8">
            Long-term trends charts have been moved to their own component.
        </div>
    );
}
