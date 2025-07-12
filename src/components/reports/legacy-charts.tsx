
'use client';

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import {
    AgentResolutionTimeChart,
    AgentTicketStatusChart,
    TicketPriorityTrendsChart,
    TicketStatusTrendsChart,
    TicketVolumePriorityChart,
} from "@/components/reports/charts";
import type { Ticket, User } from "@/lib/data";
import { addDays } from "date-fns";
import { DateRangePicker } from "../ui/date-range-picker";


export function AgentPerformanceCharts({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <AgentTicketStatusChart tickets={tickets} agents={agents} />
            <AgentResolutionTimeChart tickets={tickets} agents={agents} />
        </div>
    );
}

export function LongTermTrendsCharts({ tickets }: { tickets: Ticket[] }) {
    const [chartType, setChartType] = React.useState<"status" | "priority">("status");
    const [statusChartType, setStatusChartType] = React.useState<"bar" | "line">("bar");
    const [priorityChartType, setPriorityChartType] = React.useState<"bar" | "line">("bar");
    
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: addDays(new Date(), -90),
      to: new Date(),
    });

    return (
        <Card>
            <CardContent className="space-y-6 pt-6">
                <div className="flex justify-end">
                    <DateRangePicker date={date} setDate={setDate} />
                </div>
                <TicketVolumePriorityChart tickets={tickets} dateRange={date} />
                <TicketStatusTrendsChart
                    tickets={tickets}
                    chartType={statusChartType}
                    setChartType={setStatusChartType}
                    dateRange={date}
                />
                <TicketPriorityTrendsChart
                    tickets={tickets}
                    chartType={priorityChartType}
                    setChartType={setPriorityChartType}
                    dateRange={date}
                />
            </CardContent>
        </Card>
    );
}
