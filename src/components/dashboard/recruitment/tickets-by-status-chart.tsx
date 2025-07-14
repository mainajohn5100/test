
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { Ticket } from "@/lib/data";

const COLORS = [
  'hsl(var(--recruitment-chart-1))', 
  'hsl(var(--recruitment-chart-2))', 
  'hsl(var(--recruitment-chart-3))', 
  'hsl(var(--recruitment-chart-4))',
  'hsl(var(--recruitment-chart-5))',
  'hsl(var(--muted))'
];

interface TicketsByStatusChartProps {
  tickets: Ticket[];
}

export function TicketsByStatusChart({ tickets }: TicketsByStatusChartProps) {
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const totalTickets = tickets.length;

  return (
    <Card className="rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Tickets by Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{totalTickets}</p>
            <p className="text-sm text-muted-foreground">Total Tickets</p>
          </div>
        </div>
        <div className="mt-4 w-full">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
