
// 'use client';

// import * as React from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart
// } from "recharts";
// import { Button } from "@/components/ui/button";
// import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart } from "lucide-react";
// import type { Ticket, Project, User } from "@/lib/data";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { isWithinInterval, startOfYear, startOfMonth, startOfWeek, format } from "date-fns";
// import { differenceInDays } from 'date-fns';
// import { DateRange } from "react-day-picker";
// import { DateRangePicker } from "../ui/date-range-picker";


// type ChartType = "bar" | "line" | "pie" | "composed";
// type Timeframe = "daily" | "weekly" | "monthly" | "yearly";
// const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// function ChartToolbar({ supportedTypes, chartType, setChartType }: { supportedTypes: ChartType[], chartType: ChartType, setChartType: (type: ChartType) => void }) {
//   const typeMap: {[key in ChartType]?: {icon: React.ElementType, label: string}} = {
//       bar: { icon: BarChartIcon, label: "Bar Chart" },
//       line: { icon: LineChartIcon, label: "Line Chart" },
//       pie: { icon: PieChartIcon, label: "Pie Chart" },
//       composed: { icon: AreaChart, label: "Composed Chart" }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       {supportedTypes.map(type => {
//         const typeInfo = typeMap[type];
//         if (!typeInfo) return null;
//         const Icon = typeInfo.icon;
//         return (
//             <Button key={type} size="icon" variant={chartType === type ? 'secondary' : 'ghost'} onClick={() => setChartType(type)} className="h-8 w-8">
//               <Icon className="h-4 w-4" />
//               <span className="sr-only">{typeInfo.label}</span>
//             </Button>
//         )
//       })}
//     </div>
//   );
// }

// const StyledTooltip = () => (
//     <Tooltip
//         cursor={{fill: "hsl(var(--muted))"}}
//         contentStyle={{
//             background: "hsl(var(--background))",
//             border: "1px solid hsla(var(--border) / 0.5)",
//             borderRadius: "var(--radius)",
//         }}
//     />
// );


// export function TicketVolumeTrendsChart({ tickets }: { tickets: Ticket[] }) {
//   const [chartType, setChartType] = React.useState<ChartType>("line");
//   const monthlyData = React.useMemo(() => {
//     const data: { [key: string]: { opened: number, closed: number } } = {};
//     const monthOrder: Date[] = [];

//     tickets.forEach(ticket => {
//         const createdAt = new Date(ticket.createdAt);
//         const createdMonth = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1);
//         const createdMonthKey = format(createdMonth, 'MMM yyyy');

//         if (!data[createdMonthKey]) {
//             data[createdMonthKey] = { opened: 0, closed: 0 };
//             monthOrder.push(createdMonth);
//         }
//         data[createdMonthKey].opened++;

//         if (ticket.status === 'Closed' || ticket.status === 'Terminated') {
//             const updatedAt = new Date(ticket.updatedAt);
//             const closedMonth = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), 1);
//             const closedMonthKey = format(closedMonth, 'MMM yyyy');

//             if (!data[closedMonthKey]) {
//                 data[closedMonthKey] = { opened: 0, closed: 0 };
//                 monthOrder.push(closedMonth);
//             }
//             data[closedMonthKey].closed++;
//         }
//     });
    
//     const uniqueMonths = [...new Set(monthOrder.map(d => d.getTime()))].sort();

//     return uniqueMonths.map(time => {
//         const date = new Date(time);
//         const key = format(date, 'MMM yyyy');
//         return { name: format(date, 'MMM'), ...data[key] };
//     });
// }, [tickets]);

//   return (
//     <>
//       <CardHeader className="flex-row items-center justify-between pb-2">
//         <div>
//           <CardTitle>Ticket Volume Trends</CardTitle>
//           <CardDescription>Opened vs. Closed tickets monthly.</CardDescription>
//         </div>
//         <ChartToolbar supportedTypes={["line", "bar"]} chartType={chartType} setChartType={setChartType} />
//       </CardHeader>
//       <CardContent className="pl-2">
//         <ResponsiveContainer width="100%" height={300}>
//           {chartType === 'line' ? (
//             <LineChart data={monthlyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//               <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//               <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//               <StyledTooltip />
//               <Legend />
//               <Line type="monotone" dataKey="opened" name="Opened" stroke="hsl(var(--chart-1))" />
//               <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-2))" />
//             </LineChart>
//           ) : (
//              <BarChart data={monthlyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//               <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//               <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//               <StyledTooltip />
//               <Legend />
//               <Bar dataKey="opened" name="Opened" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="closed" name="Closed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           )}
//         </ResponsiveContainer>
//       </CardContent>
//     </>
//   );
// }

// export function TicketsByStatusChart({ tickets }: { tickets: Ticket[] }) {
//     const [chartType, setChartType] = React.useState<ChartType>("pie");
//     const data = React.useMemo(() => {
//         const statusCounts = tickets.reduce((acc, ticket) => {
//             acc[ticket.status] = (acc[ticket.status] || 0) + 1;
//             return acc;
//         }, {} as Record<string, number>);
//         return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
//     }, [tickets]);

//     return (
//     <Card>
//       <CardHeader className="flex-row items-center justify-between pb-2">
//         <div>
//             <CardTitle>Tickets by Status</CardTitle>
//             <CardDescription>Current distribution of tickets.</CardDescription>
//         </div>
//         <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
//       </CardHeader>
//       <CardContent className="pl-2">
//         <ResponsiveContainer width="100%" height={300}>
//             {chartType === 'pie' ? (
//                 <PieChart>
//                     <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
//                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
//                     </Pie>
//                     <StyledTooltip />
//                     <Legend />
//                 </PieChart>
//             ) : (
//                 <BarChart data={data} layout="vertical">
//                     <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                     <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                     <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
//                     <StyledTooltip />
//                     <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
//                          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
//                     </Bar>
//                 </BarChart>
//             )}
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

// export function ProjectsByStatusChart({ projects }: { projects: Project[] }) {
//     const [chartType, setChartType] = React.useState<ChartType>("pie");
//     const data = React.useMemo(() => {
//         const statusCounts = projects.reduce((acc, project) => {
//             acc[project.status] = (acc[project.status] || 0) + 1;
//             return acc;
//         }, {} as Record<string, number>);
//         return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
//     }, [projects]);

//     return (
//     <Card>
//       <CardHeader className="flex-row items-center justify-between pb-2">
//         <div>
//             <CardTitle>Projects by Status</CardTitle>
//             <CardDescription>Current distribution of projects.</CardDescription>
//         </div>
//         <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
//       </CardHeader>
//       <CardContent className="pl-2">
//         <ResponsiveContainer width="100%" height={300}>
//             {chartType === 'pie' ? (
//                 <PieChart>
//                     <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
//                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
//                     </Pie>
//                     <StyledTooltip />
//                     <Legend />
//                 </PieChart>
//             ) : (
//                  <BarChart data={data}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                     <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                     <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                     <StyledTooltip />
//                     <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
//                          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
//                     </Bar>
//                 </BarChart>
//             )}
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

// interface TimeSeriesChartProps {
//     title: string;
//     description: string;
//     tickets: Ticket[];
//     categories: readonly string[];
//     dataKey: keyof Ticket;
//     chartType: ChartType;
//     setChartType: (type: ChartType) => void;
//     dateRange: DateRange | undefined;
// }

// function TimeSeriesChart(props: TimeSeriesChartProps) {
//     const { title, description, tickets, dataKey, categories, chartType, setChartType, dateRange } = props;
//     const [timeframe, setTimeframe] = React.useState<Timeframe>("monthly");

//     const data = React.useMemo(() => {
//         const getInitialCounts = () => categories.reduce((acc, cat) => ({...acc, [cat]: 0}), {});

//         const filteredTickets = dateRange?.from && dateRange?.to 
//             ? tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: dateRange.from!, end: dateRange.to! }))
//             : tickets;

//         const dataMap: { [key: string]: any } = {};

//         filteredTickets.forEach(ticket => {
//             const createdAt = new Date(ticket.createdAt);
//             let key = '';
//             let name = '';

//             if (timeframe === 'yearly') {
//                 const yearStart = startOfYear(createdAt);
//                 key = format(yearStart, 'yyyy');
//                 name = key;
//             } else if (timeframe === 'monthly') {
//                 const monthStart = startOfMonth(createdAt);
//                 key = format(monthStart, 'yyyy-MM');
//                 name = format(monthStart, 'MMM yyyy');
//             } else if (timeframe === 'weekly') {
//                 const weekStart = startOfWeek(createdAt, { weekStartsOn: 1 });
//                 key = format(weekStart, 'yyyy-MM-dd');
//                 name = format(weekStart, 'd MMM');
//             } else { // daily
//                 key = format(createdAt, 'yyyy-MM-dd');
//                 name = format(createdAt, 'd MMM');
//             }
            
//             if (!dataMap[key]) {
//                 dataMap[key] = { name, ...getInitialCounts() };
//             }
//             const categoryValue = ticket[dataKey] as string;
//             if (categories.includes(categoryValue)) {
//                 dataMap[key][categoryValue]++;
//             }
//         });
        
//         const sortedKeys = Object.keys(dataMap).sort();
//         return sortedKeys.map(key => dataMap[key]);
//     }, [tickets, timeframe, categories, dataKey, dateRange]);

//     return (
//         <Card>
//             <CardHeader className="flex-row items-start justify-between pb-2">
//                 <div>
//                     <CardTitle>{title}</CardTitle>
//                     <CardDescription>{description}</CardDescription>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
//                         <TabsList>
//                             <TabsTrigger value="daily">Daily</TabsTrigger>
//                             <TabsTrigger value="weekly">Weekly</TabsTrigger>
//                             <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                             <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                         </TabsList>
//                     </Tabs>
//                     <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
//                 </div>
//             </CardHeader>
//             <CardContent className="pl-2">
//                 <ResponsiveContainer width="100%" height={350}>
//                     {chartType === 'bar' ? (
//                         <BarChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <StyledTooltip />
//                             <Legend />
//                             {categories.map((cat, i) => (
//                                 <Bar key={cat} dataKey={cat} stackId="a" fill={STACK_COLORS[i % STACK_COLORS.length]} radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0,0,0,0]} />
//                             ))}
//                         </BarChart>
//                     ) : (
//                         <LineChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <StyledTooltip />
//                             <Legend />
//                             {categories.map((cat, i) => (
//                                 <Line key={cat} type="monotone" dataKey={cat} stroke={STACK_COLORS[i % STACK_COLORS.length]} />
//                             ))}
//                         </LineChart>
//                     )}
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//     )
// }

// const TICKET_STATUSES: readonly Ticket['status'][] = ['New', 'Active', 'Pending', 'On Hold', 'Closed', 'Terminated'];
// export function TicketStatusTrendsChart(props: Omit<TimeSeriesChartProps, 'dataKey' | 'categories'>) {
//     return (
//         <TimeSeriesChart
//             {...props}
//             title="Ticket Status Trends"
//             description="Volume of tickets created over time, by status."
//             dataKey="status"
//             categories={TICKET_STATUSES}
//         />
//     );
// };

// const TICKET_PRIORITIES: readonly Ticket['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
// export function TicketPriorityTrendsChart(props: Omit<TimeSeriesChartProps, 'dataKey' | 'categories'>) {
//     return (
//         <TimeSeriesChart
//             {...props}
//             title="Ticket Priority Trends"
//             description="Volume of tickets created over time, by priority."
//             dataKey="priority"
//             categories={TICKET_PRIORITIES}
//         />
//     );
// };


// export function AgentTicketStatusChart({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
//     const [chartType, setChartType] = React.useState<ChartType>("bar");
//     const data = React.useMemo(() => {
//         return agents.map(agent => {
//             const agentTickets = tickets.filter(ticket => ticket.assignee === agent.name);
//             const open = agentTickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length;
//             const closed = agentTickets.filter(t => t.status === 'Closed' || t.status === 'Terminated').length;
//             return { name: agent.name.split(' ')[0], open, closed };
//         });
//     }, [tickets, agents]);

//     return (
//         <Card>
//             <CardHeader className="flex-row items-center justify-between pb-2">
//                 <div>
//                     <CardTitle>Agent Workload</CardTitle>
//                     <CardDescription>Open vs. Closed tickets per agent.</CardDescription>
//                 </div>
//                 <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
//             </CardHeader>
//             <CardContent className="pl-2">
//                 <ResponsiveContainer width="100%" height={300}>
//                     {chartType === 'bar' ? (
//                         <BarChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <StyledTooltip />
//                             <Legend />
//                             <Bar dataKey="open" name="Open" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
//                             <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
//                         </BarChart>
//                     ) : (
//                          <LineChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <StyledTooltip />
//                             <Legend />
//                             <Line type="monotone" dataKey="open" name="Open" stroke="hsl(var(--chart-4))" />
//                             <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-5))" />
//                         </LineChart>
//                     )}
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//     );
// }

// export function AgentResolutionTimeChart({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
//     const [chartType, setChartType] = React.useState<ChartType>("bar");
//     const data = React.useMemo(() => {
//         return agents.map(agent => {
//             const agentClosedTickets = tickets.filter(ticket => 
//                 (ticket.status === 'Closed' || ticket.status === 'Terminated') && ticket.assignee === agent.name
//             );

//             if (agentClosedTickets.length === 0) {
//                 return { name: agent.name.split(' ')[0], "Avg Days": 0 };
//             }

//             const totalDays = agentClosedTickets.reduce((acc, ticket) => {
//                 const resolution = differenceInDays(new Date(ticket.updatedAt), new Date(ticket.createdAt));
//                 return acc + resolution;
//             }, 0);
            
//             const avg = totalDays / agentClosedTickets.length;
//             return { name: agent.name.split(' ')[0], "Avg Days": parseFloat(avg.toFixed(1)) };
//         });
//     }, [tickets, agents]);

//     return (
//         <Card>
//             <CardHeader className="flex-row items-center justify-between pb-2">
//                 <div>
//                     <CardTitle>Agent Avg. Resolution Time</CardTitle>
//                     <CardDescription>Average time to close tickets per agent.</CardDescription>
//                 </div>
//                 <ChartToolbar supportedTypes={["bar", "line"]} chartType={chartType} setChartType={setChartType} />
//             </CardHeader>
//             <CardContent className="pl-2">
//                 <ResponsiveContainer width="100%" height={300}>
//                    {chartType === 'bar' ? (
//                         <BarChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
//                             <StyledTooltip />
//                             <Bar dataKey="Avg Days" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
//                         </BarChart>
//                     ) : (
//                          <LineChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
//                             <StyledTooltip />
//                             <Line type="monotone" dataKey="Avg Days" stroke="hsl(var(--chart-1))" />
//                         </LineChart>
//                     )}
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//     );
// }

// export function TicketVolumePriorityChart({ tickets, dateRange }: { tickets: Ticket[], dateRange: DateRange | undefined }) {
//     const [timeframe, setTimeframe] = React.useState<Timeframe>("monthly");

//     const data = React.useMemo(() => {
//         const dataMap: { [key: string]: { name: string, total: number, highPriority: number } } = {};
        
//         const filteredTickets = dateRange?.from && dateRange?.to 
//             ? tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: dateRange.from!, end: dateRange.to! }))
//             : tickets;

//         filteredTickets.forEach(ticket => {
//             const createdAt = new Date(ticket.createdAt);
//             let key = '';
//             let name = '';

//             if (timeframe === 'yearly') {
//                 const yearStart = startOfYear(createdAt);
//                 key = format(yearStart, 'yyyy');
//                 name = key;
//             } else if (timeframe === 'monthly') {
//                 const monthStart = startOfMonth(createdAt);
//                 key = format(monthStart, 'yyyy-MM');
//                 name = format(monthStart, 'MMM yyyy');
//             } else if (timeframe === 'weekly') {
//                 const weekStart = startOfWeek(createdAt, { weekStartsOn: 1 });
//                 key = format(weekStart, 'yyyy-MM-dd');
//                 name = format(weekStart, 'd MMM');
//             } else { // daily
//                 key = format(createdAt, 'yyyy-MM-dd');
//                 name = format(createdAt, 'd MMM');
//             }
            
//             if (!dataMap[key]) {
//                 dataMap[key] = { name, total: 0, highPriority: 0 };
//             }

//             dataMap[key].total++;
//             if (ticket.priority === 'High' || ticket.priority === 'Urgent') {
//                 dataMap[key].highPriority++;
//             }
//         });
        
//         const sortedKeys = Object.keys(dataMap).sort();
//         return sortedKeys.map(key => dataMap[key]);
//     }, [tickets, timeframe, dateRange]);

//     return (
//         <Card>
//             <CardHeader className="flex-row items-start justify-between pb-2">
//                 <div>
//                     <CardTitle>Ticket Volume & Priority</CardTitle>
//                     <CardDescription>Total tickets vs. High/Urgent priority tickets over time.</CardDescription>
//                 </div>
//                 <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
//                     <TabsList>
//                         <TabsTrigger value="daily">Daily</TabsTrigger>
//                         <TabsTrigger value="weekly">Weekly</TabsTrigger>
//                         <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                         <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                     </TabsList>
//                 </Tabs>
//             </CardHeader>
//             <CardContent className="pl-2">
//                 <ResponsiveContainer width="100%" height={350}>
//                     <ComposedChart data={data}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
//                         <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                         <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                         <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                         <StyledTooltip />
//                         <Legend />
//                         <Bar yAxisId="left" dataKey="highPriority" name="High Priority" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
//                         <Line yAxisId="right" type="monotone" dataKey="total" name="Total Tickets" stroke="hsl(var(--chart-2))" />
//                     </ComposedChart>
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//     );
// }

'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart
} from "recharts";
import { Button } from "@/components/ui/button";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart } from "lucide-react";
import type { Ticket, Project, User } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isWithinInterval, startOfYear, startOfMonth, startOfWeek, format } from "date-fns";
import { differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../ui/date-range-picker";
import { ChartTooltipContent, tooltipConfigs, tooltipFormatters } from "@/components/ui/chart-tooltip";

type ChartType = "bar" | "line" | "pie" | "composed";
type Timeframe = "daily" | "weekly" | "monthly" | "yearly";
const STACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function ChartToolbar({ supportedTypes, chartType, setChartType }: { supportedTypes: ChartType[], chartType: ChartType, setChartType: (type: ChartType) => void }) {
  const typeMap: {[key in ChartType]?: {icon: React.ElementType, label: string}} = {
      bar: { icon: BarChartIcon, label: "Bar Chart" },
      line: { icon: LineChartIcon, label: "Line Chart" },
      pie: { icon: PieChartIcon, label: "Pie Chart" },
      composed: { icon: AreaChart, label: "Composed Chart" }
  };

  return (
    <div className="flex items-center gap-2">
      {supportedTypes.map(type => {
        const typeInfo = typeMap[type];
        if (!typeInfo) return null;
        const Icon = typeInfo.icon;
        return (
            <Button key={type} size="icon" variant={chartType === type ? 'secondary' : 'ghost'} onClick={() => setChartType(type)} className="h-8 w-8">
              <Icon className="h-4 w-4" />
              <span className="sr-only">{typeInfo.label}</span>
            </Button>
        )
      })}
    </div>
  );
}

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
              <Tooltip {...tooltipConfigs.line} />
              <Legend />
              <Line type="monotone" dataKey="opened" name="Opened" stroke="hsl(var(--chart-1))" />
              <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-2))" />
            </LineChart>
          ) : (
             <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipConfigs.bar} />
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
    <Card>
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
                    <Tooltip {...tooltipConfigs.pie} />
                    <Legend />
                </PieChart>
            ) : (
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip {...tooltipConfigs.bar} />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
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
    <Card>
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
                    <Tooltip {...tooltipConfigs.pie} />
                    <Legend />
                </PieChart>
            ) : (
                 <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipConfigs.bar} />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                         {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STACK_COLORS[index % STACK_COLORS.length]} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TimeSeriesChartProps {
    title: string;
    description: string;
    tickets: Ticket[];
    categories: readonly string[];
    dataKey: keyof Ticket;
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    dateRange: DateRange | undefined;
}

function TimeSeriesChart(props: TimeSeriesChartProps) {
    const { title, description, tickets, dataKey, categories, chartType, setChartType, dateRange } = props;
    const [timeframe, setTimeframe] = React.useState<Timeframe>("monthly");

    const data = React.useMemo(() => {
        const getInitialCounts = () => categories.reduce((acc, cat) => ({...acc, [cat]: 0}), {});

        const filteredTickets = dateRange?.from && dateRange?.to 
            ? tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: dateRange.from!, end: dateRange.to! }))
            : tickets;

        const dataMap: { [key: string]: any } = {};

        filteredTickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            let key = '';
            let name = '';

            if (timeframe === 'yearly') {
                const yearStart = startOfYear(createdAt);
                key = format(yearStart, 'yyyy');
                name = key;
            } else if (timeframe === 'monthly') {
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
    }, [tickets, timeframe, categories, dataKey, dateRange]);

    const tooltipConfig = chartType === 'bar' ? tooltipConfigs.bar : tooltipConfigs.line;

    return (
        <Card>
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
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
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
                            <Tooltip {...tooltipConfig} />
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
                            <Tooltip {...tooltipConfig} />
                            <Legend />
                            {categories.map((cat, i) => (
                                <Line key={cat} type="monotone" dataKey={cat} stroke={STACK_COLORS[i % STACK_COLORS.length]} />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

const TICKET_STATUSES: readonly Ticket['status'][] = ['New', 'Active', 'Pending', 'On Hold', 'Closed', 'Terminated'];
export function TicketStatusTrendsChart(props: Omit<TimeSeriesChartProps, 'dataKey' | 'categories'>) {
    return (
        <TimeSeriesChart
            {...props}
            title="Ticket Status Trends"
            description="Volume of tickets created over time, by status."
            dataKey="status"
            categories={TICKET_STATUSES}
        />
    );
};

const TICKET_PRIORITIES: readonly Ticket['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
export function TicketPriorityTrendsChart(props: Omit<TimeSeriesChartProps, 'dataKey' | 'categories'>) {
    return (
        <TimeSeriesChart
            {...props}
            title="Ticket Priority Trends"
            description="Volume of tickets created over time, by priority."
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

    const tooltipConfig = chartType === 'bar' ? tooltipConfigs.bar : tooltipConfigs.line;

    return (
        <Card>
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
                            <Tooltip {...tooltipConfig} />
                            <Legend />
                            <Bar dataKey="open" name="Open" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                         <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipConfig} />
                            <Legend />
                            <Line type="monotone" dataKey="open" name="Open" stroke="hsl(var(--chart-4))" />
                            <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-5))" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
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

    const tooltipConfig = chartType === 'bar' ? tooltipConfigs.bar : tooltipConfigs.line;

    return (
        <Card>
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
                            <Tooltip 
                                {...tooltipConfig}
                                content={<ChartTooltipContent 
                                    formatter={(value, name) => [
                                        `${value} days`,
                                        name
                                    ]}
                                />}
                            />
                            <Bar dataKey="Avg Days" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                         <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
                            <Tooltip 
                                {...tooltipConfig}
                                content={<ChartTooltipContent 
                                    formatter={(value, name) => [
                                        `${value} days`,
                                        name
                                    ]}
                                />}
                            />
                            <Line type="monotone" dataKey="Avg Days" stroke="hsl(var(--chart-1))" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TicketVolumePriorityChart({ tickets, dateRange }: { tickets: Ticket[], dateRange: DateRange | undefined }) {
    const [timeframe, setTimeframe] = React.useState<Timeframe>("monthly");

    const data = React.useMemo(() => {
        const dataMap: { [key: string]: { name: string, total: number, highPriority: number } } = {};
        
        const filteredTickets = dateRange?.from && dateRange?.to 
            ? tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: dateRange.from!, end: dateRange.to! }))
            : tickets;

        filteredTickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            let key = '';
            let name = '';

            if (timeframe === 'yearly') {
                const yearStart = startOfYear(createdAt);
                key = format(yearStart, 'yyyy');
                name = key;
            } else if (timeframe === 'monthly') {
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
                dataMap[key] = { name, total: 0, highPriority: 0 };
            }

            dataMap[key].total++;
            if (ticket.priority === 'High' || ticket.priority === 'Urgent') {
                dataMap[key].highPriority++;
            }
        });
        
        const sortedKeys = Object.keys(dataMap).sort();
        return sortedKeys.map(key => dataMap[key]);
    }, [tickets, timeframe, dateRange]);

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle>Ticket Volume & Priority</CardTitle>
                    <CardDescription>Total tickets vs. High/Urgent priority tickets over time.</CardDescription>
                </div>
                <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                    <TabsList>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipConfigs.default} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="highPriority" name="High Priority" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="total" name="Total Tickets" stroke="hsl(var(--chart-2))" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
