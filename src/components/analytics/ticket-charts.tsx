
'use client';

import * as React from 'react';
import type { Ticket } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { tooltipConfigs } from '../ui/chart-tooltip';

const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function TicketsByPriorityChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const priorityCounts = tickets.reduce((acc, t) => {
            acc[t.priority] = (acc[t.priority] || 0) + 1;
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

function TicketsByChannelChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const channelCounts = tickets.reduce((acc, ticket) => {
            let channel = ticket.source || 'Email';
            if (ticket.source === 'General Inquiry') channel = 'Web Form';
            if (ticket.source === 'Client Inquiry') channel = 'Email';
            acc[channel] = (acc[channel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(channelCounts).map(([name, value]) => ({ name, value }));
    }, [tickets]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tickets by Channel</CardTitle>
                <CardDescription>Where your tickets are coming from.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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

export function TicketAnalysisCharts({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TicketsByPriorityChart tickets={tickets} />
            <TicketsByChannelChart tickets={tickets} />
        </div>
    );
}
