
'use client';

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
    AgentResolutionTimeChart,
    AgentTicketStatusChart,
    TicketPriorityTrendsChart,
    TicketStatusTrendsChart
} from "@/components/reports/charts";
import type { Ticket, User } from "@/lib/data";


export function AgentPerformanceCharts({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <AgentTicketStatusChart tickets={tickets} agents={agents} />
            <AgentResolutionTimeChart tickets={tickets} agents={agents} />
        </div>
    );
}

export function LongTermTrendsCharts({ tickets }: { tickets: Ticket[] }) {
    return (
        <Card>
            <CardContent className="space-y-6 pt-6">
                <TicketStatusTrendsChart tickets={tickets} />
                <TicketPriorityTrendsChart tickets={tickets} />
            </CardContent>
        </Card>
    );
}
