
"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Ticket } from "@/lib/data"
import { eachDayOfInterval, format, subDays, startOfDay, differenceInHours } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AvgResolutionTimeChart } from "./avg-resolution-time-chart";

interface TicketVolumeChartProps {
    tickets: Ticket[];
}

export function TicketVolumeChart({ tickets }: TicketVolumeChartProps) {
  const [activeTab, setActiveTab] = React.useState("volume");

  const volumeData = React.useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const newTickets = tickets.filter(t => format(startOfDay(new Date(t.createdAt)), 'yyyy-MM-dd') === dayKey).length;
      const resolvedTickets = tickets.filter(t => 
        (t.status === 'Closed' || t.status === 'Terminated') &&
        format(startOfDay(new Date(t.updatedAt)), 'yyyy-MM-dd') === dayKey
      ).length;

      return {
        name: format(day, 'EEE'),
        "New Tickets": newTickets,
        "Resolved Tickets": resolvedTickets,
      };
    });
  }, [tickets]);

  const avgResolutionData = React.useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    
    return last7Days.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const resolvedToday = tickets.filter(t => 
            (t.status === 'Closed' || t.status === 'Terminated') &&
            format(startOfDay(new Date(t.updatedAt)), 'yyyy-MM-dd') === dayKey
        );

        if (resolvedToday.length === 0) {
            return { name: format(day, 'EEE'), hours: null };
        }

        const totalHours = resolvedToday.reduce((acc, t) => {
            return acc + differenceInHours(new Date(t.updatedAt), new Date(t.createdAt));
        }, 0);
        
        return {
            name: format(day, 'EEE'),
            hours: totalHours / resolvedToday.length
        };
    });
  }, [tickets]);

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                <CardTitle>Helpdesk Activity</CardTitle>
                <CardDescription>
                  {activeTab === 'volume' 
                    ? "New vs. Resolved tickets over the last 7 days."
                    : "Average time to resolve tickets over the last 7 days."
                  }
                </CardDescription>
              </div>
              <TabsList>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="resolution">Resolution</TabsTrigger>
              </TabsList>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
            <TabsContent value="volume">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="New Tickets" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Resolved Tickets" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="resolution">
                <AvgResolutionTimeChart data={avgResolutionData} />
            </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
