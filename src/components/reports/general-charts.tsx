
'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend } from "recharts";
import type { Ticket, Project, User } from "@/lib/data";
import { Briefcase, Ticket as TicketIcon, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subDays, format, isWithinInterval } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DateRangePicker } from "../ui/date-range-picker";
import { DateRange } from "react-day-picker";

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const StyledTooltip = () => (
    <Tooltip
        cursor={{fill: "hsla(var(--muted))"}}
        contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsla(var(--border) / 0.5)",
            borderRadius: "var(--radius)",
            boxShadow: "hsl(var(--shadow))",
        }}
    />
);

export function GeneralReportDashboard({ tickets, projects, users }: { tickets: Ticket[], projects: Project[], users: User[] }) {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length;
    const newTicketsToday = tickets.filter(t => new Date(t.createdAt) > subDays(new Date(), 1)).length;
    const totalProjects = projects.length;
    const totalAgents = users.filter(u => u.role === 'Agent' || u.role === 'Admin').length;

    const ticketsByStatus = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const agentTicketStatusData = [
        { name: "New", value: ticketsByStatus['New'] || 0, color: 'hsl(var(--chart-1))' },
        { name: "Active", value: ticketsByStatus['Active'] || 0, color: 'hsl(var(--chart-2))' },
        { name: "Pending", value: ticketsByStatus['Pending'] || 0, color: 'hsl(var(--chart-3))' },
        { name: "On Hold", value: ticketsByStatus['On Hold'] || 0, color: 'hsl(var(--chart-4))' },
        { name: "Closed", value: ticketsByStatus['Closed'] || ticketsByStatus['Terminated'] || 0, color: 'hsl(var(--chart-5))' },
    ];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-3">
                <PerformanceSummaryCard 
                    totalTickets={totalTickets}
                    openTickets={openTickets}
                    newTicketsToday={newTicketsToday}
                    totalProjects={totalProjects}
                />
            </div>
            <div className="col-span-1 lg:col-span-2 space-y-6">
                <TicketVolumeChart tickets={tickets} />
                <TicketsByProjectChart tickets={tickets} projects={projects} />
            </div>
            <div className="col-span-1 space-y-6">
                <AgentOverviewCard totalAgents={totalAgents} ticketStatusData={agentTicketStatusData} />
                <TicketsByPriorityChart tickets={tickets} />
            </div>
        </div>
    );
}

function PerformanceSummaryCard({ totalTickets, openTickets, newTicketsToday, totalProjects }: any) {
    const stats = [
        { title: "Total Tickets", value: totalTickets, icon: TicketIcon },
        { title: "Open Tickets", value: openTickets, icon: TicketIcon },
        { title: "New Today", value: newTicketsToday, icon: TicketIcon },
        { title: "Total Projects", value: totalProjects, icon: Briefcase },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(stat => (
                        <div key={stat.title} className="flex items-center gap-4 p-4 border rounded-lg">
                           <div className="p-3 rounded-full bg-muted">
                             <stat.icon className="h-6 w-6 text-muted-foreground" />
                           </div>
                           <div>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function AgentOverviewCard({ totalAgents, ticketStatusData }: { totalAgents: number, ticketStatusData: any[] }) {
    const total = ticketStatusData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Agent Overview</CardTitle>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{totalAgents}</p>
                    <p className="text-sm text-muted-foreground">Total Agents</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Current Ticket Distribution</p>
                <div className="w-full mt-4">
                    <Progress value={100} ticketStatusData={ticketStatusData} total={total} />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                       {ticketStatusData.map(item => (
                           <div key={item.name} className="flex items-center gap-2">
                               <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                               <span>{item.name}</span>
                               <span className="ml-auto font-medium">{item.value}</span>
                           </div>
                       ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TicketVolumeChart({ tickets }: { tickets: Ticket[] }) {
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
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Ticket Volume</CardTitle>
                    <CardDescription>New tickets over the last 30 days.</CardDescription>
                </div>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={4} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <StyledTooltip />
                        <Line type="monotone" dataKey="tickets" strokeWidth={2} stroke="hsl(var(--chart-2))" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function TicketsByProjectChart({ tickets, projects }: { tickets: Ticket[], projects: Project[] }) {
    const [date, setDate] = React.useState<DateRange | undefined>();

    const data = React.useMemo(() => {
        const filteredTickets = date?.from && date?.to
            ? tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: date.from!, end: date.to! }))
            : tickets;

        const projectTicketCounts = projects.map(project => ({
            name: project.name,
            tickets: filteredTickets.filter(t => t.project === project.name).length
        })).filter(p => p.tickets > 0)
         .sort((a,b) => b.tickets - a.tickets)
         .slice(0, 5); // top 5
         
         return projectTicketCounts;
    }, [tickets, projects, date]);

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Tickets by Project</CardTitle>
                    <CardDescription>Distribution of tickets across top projects.</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <MoreVertical className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-0 border-none">
                       <DateRangePicker date={date} setDate={setDate} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} width={100} />
                        <StyledTooltip />
                        <Bar dataKey="tickets" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={15}>
                            <LabelList dataKey="tickets" position="right" offset={8} fontSize={12} fill="#888888"/>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function TicketsByPriorityChart({ tickets }: { tickets: Ticket[] }) {
    const data = React.useMemo(() => {
        const priorityCounts = tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const order: Ticket['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
        return order.map((p, i) => ({
            name: p,
            value: priorityCounts[p] || 0,
            fill: CHART_COLORS[i]
        }));
    }, [tickets]);
    
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Tickets by Priority</CardTitle>
                    <CardDescription>Current ticket priority breakdown.</CardDescription>
                </div>
                 <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <StyledTooltip />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend
                            iconType="circle"
                            layout="vertical"
                            verticalAlign="bottom"
                            align="right"
                            iconSize={8}
                            content={(props) => {
                                const { payload } = props;
                                return (
                                <ul className="flex flex-col space-y-1 text-xs text-muted-foreground">
                                    {payload?.map((entry: any, index: number) => (
                                    <li key={`item-${index}`} className="flex items-center">
                                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                                        <span>{entry.value}: {entry.payload.value}</span>
                                    </li>
                                    ))}
                                </ul>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                 <div className="text-center -mt-16">
                    <p className="text-3xl font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">Total Tickets</p>
                </div>
            </CardContent>
        </Card>
    )
}
