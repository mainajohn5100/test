
'use client';

import React from 'react';
import type { Ticket } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { tooltipConfigs } from '../ui/chart-tooltip';
import { subDays, format, eachDayOfInterval, startOfHour, eachHourOfInterval, subHours, startOfDay } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

function getTicketSource(ticket: Ticket): 'Email' | 'WhatsApp' | 'Web Form' | 'Project' {
    if (ticket.source === 'Project') return 'Project';
    if (ticket.source === 'WhatsApp') return 'WhatsApp';
    if (ticket.source === 'General Inquiry') return 'Web Form';
    return 'Email';
};

const CHANNELS = ['Email', 'WhatsApp', 'Web Form', 'Project'] as const;
const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'] as const;

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

function TicketStatusTrendChart({ tickets }: { tickets: Ticket[] }) {
    const [timeframe, setTimeframe] = React.useState<'1d' | '7d' | '30d'>('7d');
    const { ticketStatuses } = useSettings();

    const data = React.useMemo(() => {
        const now = new Date();
        let interval;
        let timeFormatter: (date: Date) => string;
        let startOfPeriod: (date: Date) => Date = (d) => d;

        if (timeframe === '1d') {
            interval = eachHourOfInterval({ start: subHours(now, 23), end: now });
            timeFormatter = (date) => format(date, 'ha');
            startOfPeriod = startOfHour;
        } else { // 7d or 30d
            const days = timeframe === '7d' ? 6 : 29;
            interval = eachDayOfInterval({ start: subDays(now, days), end: now });
            timeFormatter = (date) => format(date, 'MMM d');
            startOfPeriod = startOfDay;
        }

        const initialCounts = ticketStatuses.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});

        const dateMap = interval.reduce((acc, date) => {
            const key = timeFormatter(date);
            acc[key] = { name: key, ...initialCounts };
            return acc;
        }, {} as Record<string, any>);

        tickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
             if (timeframe === '1d' && createdAt < subHours(now, 24)) return;
             if (timeframe === '7d' && createdAt < subDays(now, 7)) return;
             if (timeframe === '30d' && createdAt < subDays(now, 30)) return;

            const key = timeFormatter(startOfPeriod(createdAt));
            
            if (dateMap[key] && ticketStatuses.includes(ticket.status)) {
                dateMap[key][ticket.status]++;
            }
        });

        return Object.values(dateMap);
    }, [tickets, timeframe, ticketStatuses]);

    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle>Ticket Volume Trend by Status</CardTitle>
                        <CardDescription>Volume of tickets created over time, broken down by status.</CardDescription>
                    </div>
                     <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                        <TabsList>
                            <TabsTrigger value="1d">24 Hours</TabsTrigger>
                            <TabsTrigger value="7d">7 Days</TabsTrigger>
                            <TabsTrigger value="30d">30 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            interval={timeframe === '30d' ? 4 : (timeframe === '1d' ? 2 : 0)}
                        />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.line} />
                        <Legend />
                        {ticketStatuses.map((status, index) => (
                            <Line 
                                key={status}
                                type="monotone" 
                                dataKey={status} 
                                stroke={STACK_COLORS[index % STACK_COLORS.length]}
                                strokeWidth={2} 
                                dot={false} 
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

function TicketChannelTrendChart({ tickets }: { tickets: Ticket[] }) {
    const [timeframe, setTimeframe] = React.useState<'1d' | '7d' | '30d'>('7d');
    
    const data = React.useMemo(() => {
        const now = new Date();
        let interval;
        let timeFormatter: (date: Date) => string;
        let startOfPeriod: (date: Date) => Date = (d) => d;

        if (timeframe === '1d') {
            interval = eachHourOfInterval({ start: subHours(now, 23), end: now });
            timeFormatter = (date) => format(date, 'ha');
            startOfPeriod = startOfHour;
        } else {
            const days = timeframe === '7d' ? 6 : 29;
            interval = eachDayOfInterval({ start: subDays(now, days), end: now });
            timeFormatter = (date) => format(date, 'MMM d');
            startOfPeriod = startOfDay;
        }
        
        const initialCounts = CHANNELS.reduce((acc, ch) => ({ ...acc, [ch]: 0 }), {});

        const dateMap = interval.reduce((acc, date) => {
            const key = timeFormatter(date);
            acc[key] = { name: key, ...initialCounts };
            return acc;
        }, {} as Record<string, any>);

        tickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            if (timeframe === '1d' && createdAt < subHours(now, 24)) return;
            if (timeframe === '7d' && createdAt < subDays(now, 7)) return;
            if (timeframe === '30d' && createdAt < subDays(now, 30)) return;

            const key = timeFormatter(startOfPeriod(createdAt));
            const channel = getTicketSource(ticket);
            
            if (dateMap[key] && CHANNELS.includes(channel)) {
                dateMap[key][channel]++;
            }
        });

        return Object.values(dateMap);
    }, [tickets, timeframe]);

    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle>Ticket Volume by Channel</CardTitle>
                        <CardDescription>Volume of tickets created over time, broken down by channel.</CardDescription>
                    </div>
                     <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                        <TabsList>
                            <TabsTrigger value="1d">24 Hours</TabsTrigger>
                            <TabsTrigger value="7d">7 Days</TabsTrigger>
                            <TabsTrigger value="30d">30 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={timeframe === '30d' ? 4 : (timeframe === '1d' ? 2 : 0)} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.line} />
                        <Legend />
                        {CHANNELS.map((channel, index) => (
                            <Line key={channel} type="monotone" dataKey={channel} stroke={STACK_COLORS[index % STACK_COLORS.length]} strokeWidth={2} dot={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function TicketPriorityTrendChart({ tickets }: { tickets: Ticket[] }) {
    const [timeframe, setTimeframe] = React.useState<'1d' | '7d' | '30d'>('7d');
    
    const data = React.useMemo(() => {
        const now = new Date();
        let interval;
        let timeFormatter: (date: Date) => string;
        let startOfPeriod: (date: Date) => Date = (d) => d;

        if (timeframe === '1d') {
            interval = eachHourOfInterval({ start: subHours(now, 23), end: now });
            timeFormatter = (date) => format(date, 'ha');
            startOfPeriod = startOfHour;
        } else {
            const days = timeframe === '7d' ? 6 : 29;
            interval = eachDayOfInterval({ start: subDays(now, days), end: now });
            timeFormatter = (date) => format(date, 'MMM d');
            startOfPeriod = startOfDay;
        }
        
        const initialCounts = PRIORITIES.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});

        const dateMap = interval.reduce((acc, date) => {
            const key = timeFormatter(date);
            acc[key] = { name: key, ...initialCounts };
            return acc;
        }, {} as Record<string, any>);

        tickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            if (timeframe === '1d' && createdAt < subHours(now, 24)) return;
            if (timeframe === '7d' && createdAt < subDays(now, 7)) return;
            if (timeframe === '30d' && createdAt < subDays(now, 30)) return;

            const key = timeFormatter(startOfPeriod(createdAt));
            const priority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
            
            if (dateMap[key] && PRIORITIES.includes(priority as any)) {
                dateMap[key][priority]++;
            }
        });

        return Object.values(dateMap);
    }, [tickets, timeframe]);

    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle>Ticket Volume by Priority</CardTitle>
                        <CardDescription>Volume of tickets created over time, broken down by priority.</CardDescription>
                    </div>
                     <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                        <TabsList>
                            <TabsTrigger value="1d">24 Hours</TabsTrigger>
                            <TabsTrigger value="7d">7 Days</TabsTrigger>
                            <TabsTrigger value="30d">30 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={timeframe === '30d' ? 4 : (timeframe === '1d' ? 2 : 0)} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.line} />
                        <Legend />
                        {PRIORITIES.map((priority, index) => (
                            <Line key={priority} type="monotone" dataKey={priority} stroke={STACK_COLORS[index % STACK_COLORS.length]} strokeWidth={2} dot={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TicketAnalysisCharts({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TicketChannelTrendChart tickets={tickets} />
            <TicketPriorityTrendChart tickets={tickets} />
            <TicketsByPriorityChart tickets={tickets} />
            <TicketsByCategoryChart tickets={tickets} />
            <TicketStatusTrendChart tickets={tickets} />
        </div>
    );
}
