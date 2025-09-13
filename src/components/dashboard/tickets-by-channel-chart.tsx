
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Ticket } from "@/lib/data"

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface TicketsByChannelChartProps {
    tickets: Ticket[];
}

export function TicketsByChannelChart({ tickets }: TicketsByChannelChartProps) {
  const data = React.useMemo(() => {
    const channelCounts = tickets.reduce((acc, ticket) => {
      let channel: string;
      switch (ticket.source) {
        case 'Project':
          channel = 'Project';
          break;
        case 'WhatsApp':
          channel = 'WhatsApp';
          break;
        case 'General Inquiry':
          channel = 'Web Form';
          break;
        case 'Client Inquiry':
        case 'Partner':
        case 'Vendor':
        case 'Internal':
          channel = 'Email';
          break;
        default:
          // If source is null, undefined, or an unexpected value, but a project is linked,
          // classify it as a Project ticket. This handles legacy or manually created tickets.
          if (ticket.project) {
              channel = 'Project';
          } else {
              channel = 'Email'; // Default to Email if no other source matches
          }
      }
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(channelCounts).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [tickets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets by Channel</CardTitle>
        <CardDescription>Distribution of tickets from all sources.</CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{fontSize: '0.8rem'}} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No ticket data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
