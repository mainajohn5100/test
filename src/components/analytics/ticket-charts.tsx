
'use client';

import * as React from 'react';
import type { Ticket } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { tooltipConfigs } from '../ui/chart-tooltip';
import { subDays, format } from 'date-fns';

const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function TicketsByPriorityChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const priorityCounts = tickets.reduce((acc, t) => {
            const priority = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(priorityCounts).map(([name, value]) => ({ name, tickets: value }));
    }, [tickets]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
                <CardDescription>How tickets are distributed across priority levels.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.bar} />
                        <Bar dataKey="tickets" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function TicketsByCategoryChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const categoryCounts = tickets.reduce((acc, ticket) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    }, [tickets]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
                <CardDescription>Distribution of tickets across categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                        <Pie 
                            data={data} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100}
                            innerRadius={60}
                            label
                        >
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                        </Pie>
                        <Tooltip {...tooltipConfigs.pie} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function TicketTrendChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const dateMap: { [key: string]: number } = {};
        for(let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const key = format(date, 'MMM d');
            dateMap[key] = 0;
        }
        tickets.forEach(ticket => {
            const key = format(new Date(ticket.createdAt), 'MMM d');
            if (key in dateMap) {
                dateMap[key]++;
            }
        });
        return Object.entries(dateMap).map(([name, value]) => ({ name, tickets: value }));
    }, [tickets]);

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Ticket Volume Trend</CardTitle>
                <CardDescription>New tickets created over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={4} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.line} />
                        <Line type="monotone" dataKey="tickets" name="New Tickets" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function TicketAnalysisCharts({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TicketsByPriorityChart tickets={tickets} />
            <TicketsByCategoryChart tickets={tickets} />
            <TicketTrendChart tickets={tickets} />
        </div>
    );
}
