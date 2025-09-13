
'use client';

import * as React from 'react';
import type { Ticket, Project, User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { differenceInHours, formatDistanceToNowStrict } from 'date-fns';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { tooltipConfigs } from '../ui/chart-tooltip';

function calculateAverageResolutionTime(tickets: Ticket[]): number {
    const resolvedTickets = tickets.filter(t => (t.status === 'Closed' || t.status === 'Terminated') && t.createdAt && t.updatedAt);
    if (resolvedTickets.length === 0) return 0;

    const totalHours = resolvedTickets.reduce((acc, ticket) => {
        const resolutionHours = differenceInHours(new Date(ticket.updatedAt), new Date(ticket.createdAt));
        return acc + resolutionHours;
    }, 0);

    return totalHours / resolvedTickets.length;
}

function calculateSlaBreachPercentage(tickets: Ticket[]): number {
    const slaApplicableTickets = tickets.filter(t => t.resolutionDue);
    if (slaApplicableTickets.length === 0) return 0;

    const breachedTickets = slaApplicableTickets.filter(t => {
        return new Date() > new Date(t.resolutionDue!);
    });

    return (breachedTickets.length / slaApplicableTickets.length) * 100;
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export function OverviewCharts({ tickets, projects, users }: { tickets: Ticket[], projects: Project[], users: User[] }) {
    
    const avgResolutionTime = calculateAverageResolutionTime(tickets);
    const slaBreachPercentage = calculateSlaBreachPercentage(tickets);

    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length,
        avgResolutionTime: `${avgResolutionTime.toFixed(1)}h`,
        slaBreachPercentage: `${slaBreachPercentage.toFixed(1)}%`,
        activeAgents: users.filter(u => u.role === 'Agent' || u.role === 'Admin').length
    };

    const ticketsByStatus = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusChartData = Object.entries(ticketsByStatus).map(([name, value]) => ({ name, tickets: value }));

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total Tickets" value={stats.totalTickets.toString()} icon={Activity} />
                <StatCard title="Open Tickets" value={stats.openTickets.toString()} icon={CheckCircle} />
                <StatCard title="Avg. Resolution" value={stats.avgResolutionTime} icon={Clock} />
                <StatCard title="SLA Breaches" value={stats.slaBreachPercentage} icon={AlertTriangle} />
                <StatCard title="Active Agents" value={stats.activeAgents.toString()} icon={Users} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Ticket Distribution</CardTitle>
                    <CardDescription>A snapshot of all tickets by their current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={statusChartData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipConfigs.bar} />
                            <Bar dataKey="tickets" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
