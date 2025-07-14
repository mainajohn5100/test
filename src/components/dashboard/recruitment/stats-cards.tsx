
'use client';
import { Card, CardContent } from "@/components/ui/card";
import type { Ticket } from "@/lib/data";

interface StatsCardsProps {
  tickets: Ticket[];
}

export function StatsCards({ tickets }: StatsCardsProps) {
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'Active' || t.status === 'Pending' || t.status === 'New').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;
  const terminatedTickets = tickets.filter(t => t.status === 'Terminated').length;

  const statItems = [
    { title: "Total Tickets", value: totalTickets, color: 'bg-[#D7F9E1]', textColor: 'text-[#008A2E]' },
    { title: "Active", value: activeTickets, color: 'bg-[#F2F2F2]', textColor: 'text-foreground' },
    { title: "Closed", value: closedTickets, color: 'bg-[#F2F2F2]', textColor: 'text-foreground' },
    { title: "Terminated", value: terminatedTickets, color: 'bg-[#F2F2F2]', textColor: 'text-foreground' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {statItems.map((stat, index) => (
        <Card key={index} className={`rounded-2xl border-none ${stat.color} flex flex-col justify-center`}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
