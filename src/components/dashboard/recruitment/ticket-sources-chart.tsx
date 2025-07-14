
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import type { Ticket } from "@/lib/data";

const COLORS = [
  'hsl(var(--recruitment-chart-1))', 
  'hsl(var(--recruitment-chart-2))', 
  'hsl(var(--recruitment-chart-3))', 
  'hsl(var(--recruitment-chart-4))',
  'hsl(var(--recruitment-chart-5))',
  'hsl(var(--muted))'
];

interface TicketSourcesChartProps {
  tickets: Ticket[];
}

export function TicketSourcesChart({ tickets }: TicketSourcesChartProps) {
  const sourceCounts = tickets.reduce((acc, ticket) => {
    const source = ticket.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sourceCounts)
    .map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const totalTickets = tickets.length;

  return (
    <Card className="rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Ticket Sources</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="10%" 
                    outerRadius="80%" 
                    barSize={10} 
                    data={data} 
                    startAngle={90} 
                    endAngle={-270}
                >
                    <RadialBar
                        background
                        dataKey="value"
                    />
                    <Tooltip />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
         <div className="mt-4 w-full">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
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
