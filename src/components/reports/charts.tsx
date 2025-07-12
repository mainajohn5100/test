
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import type { Ticket, Project, User } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { differenceInDays } from 'date-fns';


type ChartType = "bar" | "line" | "pie";
type Timeframe = "daily" | "weekly" | "monthly";
const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function ChartToolbar({ supportedTypes, chartType, setChartType }: { supportedTypes: ChartType[], chartType: ChartType, setChartType: (type: ChartType) => void }) {
  return (
    <div className="flex items-center gap-2">
      {supportedTypes.includes("bar") && (
        <Button size="icon" variant={chartType === 'bar' ? 'secondary' : 'ghost'} onClick={() => setChartType('bar')} className="h-8 w-8">
          <BarChartIcon className="h-4 w-4" />
          <span className="sr-only">Bar Chart</span>
        </Button>
      )}
      {supportedTypes.includes("line") && (
        <Button size="icon" variant={chartType === 'line' ? 'secondary' : 'ghost'} onClick={() => setChartType('line')} className="h-8 w-8">
          <LineChartIcon className="h-4 w-4" />
          <span className="sr-only">Line Chart</span>
        </Button>
      )}
      {supportedTypes.includes("pie") && (
         <Button size="icon" variant={chartType === 'pie' ? 'secondary' : 'ghost'} onClick={() => setChartType('pie')} className="h-8 w-8">
          <PieChartIcon className="h-4 w-4" />
          <span className="sr-only">Pie Chart</span>
        </Button>
      )}
    </div>
  );
}

const StyledTooltip = () => (
    <Tooltip
        cursor={{fill: "hsl(var(--muted))"}}
        contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
        }}
    />
);


export function TicketVolumeTrendsChart({ tickets }: { tickets: Ticket[] }) {
  const [chartType, setChartType] = React.useState<ChartType>("line");
  const monthlyData = React.useMemo(() => {
    const data: { [key: string]: { opened: number, closed: number } } = {};
    const monthOrder: Date[] = [];

    tickets.forEach(ticket => {
        const createdAt = new Date(ticket.createdAt);
        const createdMonth = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1);
        const createdMonthKey = format(createdMonth, 'MMM yyyy');

        if (!data[createdMonthKey]) {
            data[createdMonthKey] = { opened: 0, closed: 0 };
            monthOrder.push(createdMonth);
        }
        data[createdMonthKey].opened++;

        if (ticket.status === 'Closed' || ticket.status === 'Terminated') {
            const updatedAt = new Date(ticket.updatedAt);
            const closedMonth = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), 1);
            const closedMonthKey = format(closedMonth, 'MMM yyyy');

            if (!data[closedMonthKey]) {
                data[closedMonthKey] = { opened: 0, closed: 0 };
                monthOrder.push(closedMonth);
            }
            data[closedMonthKey].closed++;
        }
    });
    
    const uniqueMonths = [...new Set(monthOrder.map(d => d.getTime()))].sort();

    return uniqueMonths.map(time => {
        const date = new Date(time);
        const key = format(date, 'MMM yyyy');
        return { name: format(date, 'MMM'), ...data[key] };
    });
}, [tickets]);

  return (
    <>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Ticket Volume Trends</CardTitle>
          <CardDescription>Opened vs. Closed tickets monthly.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["line", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              <Line type="monotone" dataKey="opened" name="Opened" stroke="hsl(var(--chart-1))" />
              <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-2))" />
            </LineChart>
          ) : (
             <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              <Bar dataKey="opened" name="Opened" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closed" name="Closed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}

export function TicketsByStatusChart({ tickets }: { tickets: Ticket[] }) {
    const [chartType, setChartType] = React.useState<ChartType>("pie");
    const data = React.useMemo(() => {
        const statusCounts = tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [tickets]);

    return (
    <>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current distribution of tickets.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Pie>
                    <StyledTooltip />
                    <Legend />
                </PieChart>
            ) : (
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <StyledTooltip />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}

export function ProjectsByStatusChart({ projects }: { projects: Project[] }) {
    const [chartType, setChartType] = React.useState<ChartType>("pie");
    const data = React.useMemo(() => {
        const statusCounts = projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [projects]);

    return (
    <>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Current distribution of projects.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Pie>
                    <StyledTooltip />
                    <Legend />
                </PieChart>
            ) : (
                 <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <StyledTooltip />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}

interface TimeSeriesChartProps {
    title: string;
    description: string;
    tickets: Ticket[];
    dataKey: keyof Ticket;
    categories: readonly string[];
}

function TimeSeriesChart({ title, description, tickets, dataKey, categories }: TimeSeriesChartProps) {
    const [chartType, setChartType] = React.useState<ChartType>("bar");
    const [timeframe, setTimeframe] = React.useState<Timeframe>("monthly");

    const data = React.useMemo(() => {
        if (!tickets) return [];
        const getInitialCounts = () => categories.reduce((acc, cat) => ({...acc, [cat]: 0}), {});

        const dataMap: { [key: string]: any } = {};

        tickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            let key = '';
            let name = '';

            if (timeframe === 'monthly') {
                const monthStart = startOfMonth(createdAt);
                key = format(monthStart, 'yyyy-MM');
                name = format(monthStart, 'MMM yyyy');
            } else if (timeframe === 'weekly') {
                const weekStart = startOfWeek(createdAt, { weekStartsOn: 1 });
                key = format(weekStart, 'yyyy-MM-dd');
                name = format(weekStart, 'd MMM');
            } else { // daily
                key = format(createdAt, 'yyyy-MM-dd');
                name = format(createdAt, 'd MMM');
            }
            
            if (!dataMap[key]) {
                dataMap[key] = { name, ...getInitialCounts() };
            }
            const categoryValue = ticket[dataKey] as string;
            if (categories.includes(categoryValue)) {
                dataMap[key][categoryValue]++;
            }
        });
        
        const sortedKeys = Object.keys(dataMap).sort();
        return sortedKeys.map(key => dataMap[key]);
    }, [tickets, timeframe, categories, dataKey]);

    return (
        <>
            <CardHeader className="flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                        <TabsList>
                            <TabsTrigger value="daily">Daily</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    {chartType === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <StyledTooltip />
                            <Legend />
                            {categories.map((cat, i) => (
                                <Bar key={cat} dataKey={cat} stackId="a" fill={STACK_COLORS[i % STACK_COLORS.length]} radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0,0,0,0]} />
                            ))}
                        </BarChart>
                    ) : (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <StyledTooltip />
                            <Legend />
                            {categories.map((cat, i) => (
                                <Line key={cat} type="monotone" dataKey={cat} stroke={STACK_COLORS[i % STACK_COLORS.length]} />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </>
    )
}

const TICKET_STATUSES: readonly Ticket['status'][] = ['New', 'Active', 'Pending', 'On Hold', 'Closed', 'Terminated'];
export function TicketStatusTrendsChart(props: { tickets: Ticket[] }) {
    return (
        <TimeSeriesChart
            title="Ticket Status Trends"
            description="Volume of tickets created over time, by status."
            tickets={props.tickets}
            dataKey="status"
            categories={TICKET_STATUSES}
        />
    );
};

const TICKET_PRIORITIES: readonly Ticket['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
export function TicketPriorityTrendsChart(props: { tickets: Ticket[] }) {
    return (
        <TimeSeriesChart
            title="Ticket Priority Trends"
            description="Volume of tickets created over time, by priority."
            tickets={props.tickets}
            dataKey="priority"
            categories={TICKET_PRIORITIES}
        />
    );
};


export function AgentTicketStatusChart({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    const [chartType, setChartType] = React.useState<ChartType>("bar");
    const data = React.useMemo(() => {
        return agents.map(agent => {
            const agentTickets = tickets.filter(ticket => ticket.assignee === agent.name);
            const open = agentTickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length;
            const closed = agentTickets.filter(t => t.status === 'Closed' || t.status === 'Terminated').length;
            return { name: agent.name.split(' ')[0], open, closed };
        });
    }, [tickets, agents]);

    return (
        <>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Agent Workload</CardTitle>
                    <CardDescription>Open vs. Closed tickets per agent.</CardDescription>
                </div>
                <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <StyledTooltip />
                            <Legend />
                            <Bar dataKey="open" name="Open" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                         <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <StyledTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="open" name="Open" stroke="hsl(var(--chart-4))" />
                            <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-5))" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </>
    );
}

export function AgentResolutionTimeChart({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    const [chartType, setChartType] = React.useState<ChartType>("bar");
    const data = React.useMemo(() => {
        return agents.map(agent => {
            const agentClosedTickets = tickets.filter(ticket => 
                (ticket.status === 'Closed' || ticket.status === 'Terminated') && ticket.assignee === agent.name
            );

            if (agentClosedTickets.length === 0) {
                return { name: agent.name.split(' ')[0], "Avg Days": 0 };
            }

            const totalDays = agentClosedTickets.reduce((acc, ticket) => {
                const resolution = differenceInDays(new Date(ticket.updatedAt), new Date(ticket.createdAt));
                return acc + resolution;
            }, 0);
            
            const avg = totalDays / agentClosedTickets.length;
            return { name: agent.name.split(' ')[0], "Avg Days": parseFloat(avg.toFixed(1)) };
        });
    }, [tickets, agents]);

    return (
        <>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Agent Avg. Resolution Time</CardTitle>
                    <CardDescription>Average time to close tickets per agent.</CardDescription>
                </div>
                <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                   {chartType === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
                            <StyledTooltip />
                            <Bar dataKey="Avg Days" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                         <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
                            <StyledTooltip />
                            <Line type="monotone" dataKey="Avg Days" stroke="hsl(var(--chart-1))" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </>
    );
}

    