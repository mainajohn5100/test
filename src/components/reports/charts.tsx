"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { chartData, pieChartData, avgResolutionTimeData, projectsByStatusData, ticketTrendsData } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChartType = "bar" | "line" | "pie";
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
        contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
        }}
    />
);


function TicketVolumeTrendsChart() {
  const [chartType, setChartType] = React.useState<ChartType>("line");
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Ticket Volume Trends</CardTitle>
          <CardDescription>Opened vs. Closed tickets monthly.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["line", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              <Line type="monotone" dataKey="tickets" name="Opened" stroke="hsl(var(--chart-1))" />
              <Line type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-2))" />
            </LineChart>
          ) : (
             <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              <Bar dataKey="tickets" name="Opened" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closed" name="Closed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TicketsByStatusChart() {
    const [chartType, setChartType] = React.useState<ChartType>("pie");
    return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current distribution of tickets.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
                <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <StyledTooltip />
                </PieChart>
            ) : (
                <BarChart data={pieChartData} layout="vertical">
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                    <StyledTooltip />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                         {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ReportAvgResolutionTimeChart() {
  const [chartType, setChartType] = React.useState<ChartType>("line");
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Average Resolution Time</CardTitle>
          <CardDescription>Average time to close tickets in days.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["line", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
           {chartType === 'line' ? (
             <LineChart data={avgResolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
              <StyledTooltip />
              <Line type="monotone" dataKey="days" name="Avg. Days" stroke="hsl(var(--chart-3))" />
            </LineChart>
           ) : (
            <BarChart data={avgResolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="d" />
              <StyledTooltip />
              <Bar dataKey="days" name="Avg. Days" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
           )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ProjectsByStatusChart() {
    const [chartType, setChartType] = React.useState<ChartType>("pie");
    return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Current distribution of projects.</CardDescription>
        </div>
        <ChartToolbar supportedTypes={["pie", "bar"]} chartType={chartType} setChartType={setChartType} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
                <PieChart>
                    <Pie data={projectsByStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {projectsByStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <StyledTooltip />
                </PieChart>
            ) : (
                 <BarChart data={projectsByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <StyledTooltip />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                         {projectsByStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TicketStatusTrendsChart() {
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const [timeframe, setTimeframe] = React.useState<"daily" | "weekly" | "monthly">("monthly");
  const data = ticketTrendsData[timeframe];
  const statuses = Object.keys(ticketTrendsData.monthly[0]).filter(k => k !== 'name');

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Ticket Status Trends</CardTitle>
          <CardDescription>Volume of tickets by status over time.</CardDescription>
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
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
           {chartType === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              {statuses.map((status, i) => (
                <Bar key={status} dataKey={status} stackId="a" fill={STACK_COLORS[i % STACK_COLORS.length]} radius={i === statuses.length - 1 ? [4, 4, 0, 0] : [0,0,0,0]} />
              ))}
            </BarChart>
           ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <StyledTooltip />
              <Legend />
              {statuses.map((status, i) => (
                 <Line key={status} type="monotone" dataKey={status} stroke={STACK_COLORS[i % STACK_COLORS.length]} />
              ))}
            </LineChart>
           )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ReportCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TicketVolumeTrendsChart />
      <TicketsByStatusChart />
      <ReportAvgResolutionTimeChart />
      <ProjectsByStatusChart />
      <TicketStatusTrendsChart />
    </div>
  );
}
