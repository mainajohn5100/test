import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Ticket, Project } from "@/lib/data";
import { Ticket as TicketIcon, BarChart2, FilePlus2, Briefcase } from "lucide-react";
import { isToday } from "date-fns";

interface StatsCardsProps {
  tickets: Ticket[];
  projects: Project[];
}

export function StatsCards({ tickets, projects }: StatsCardsProps) {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length;
  const newTicketsToday = tickets.filter(t => isToday(new Date(t.createdAt))).length;
  const totalProjects = projects.length;

  const statItems = [
    { title: "Total Tickets", value: totalTickets, icon: TicketIcon, color: "text-blue-500" },
    { title: "Open Tickets", value: openTickets, icon: BarChart2, color: "text-green-500" },
    { title: "New Tickets Today", value: newTicketsToday, icon: FilePlus2, color: "text-purple-500" },
    { title: "Total Projects", value: totalProjects, icon: Briefcase, color: "text-orange-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
