
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import type { Ticket } from "@/lib/data";
import { subDays, format, isSameDay } from 'date-fns';

interface TicketsChartProps {
  tickets: Ticket[];
}

export function TicketsChart({ tickets }: TicketsChartProps) {
  const data = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
    
    return last7Days.map(day => {
      const dayTickets = tickets.filter(ticket => isSameDay(new Date(ticket.createdAt), day));
      const newTickets = dayTickets.filter(t => t.status === 'New').length;
      const activeTickets = dayTickets.filter(t => t.status === 'Active').length;
      return {
        name: format(day, 'd MMM'),
        New: newTickets,
        Active: activeTickets,
      };
    });
  }, [tickets]);

  return (
    <Card className="rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend wrapperStyle={{fontSize: "0.8rem"}} />
            <Bar dataKey="New" stackId="a" fill="hsl(var(--recruitment-chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Active" stackId="a" fill="hsl(var(--recruitment-chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
