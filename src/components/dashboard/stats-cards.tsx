import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { tickets } from "@/lib/data";
import { Ticket, BarChart2, CheckCircle, Clock } from "lucide-react";

export function StatsCards() {
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'Active' || t.status === 'New').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;
  const avgResolutionTime = "1d 2h"; // Mock data

  const stats = [
    { title: "Total Tickets", value: totalTickets, icon: Ticket, color: "text-blue-500" },
    { title: "Active Tickets", value: activeTickets, icon: BarChart2, color: "text-green-500" },
    { title: "Closed Tickets", value: closedTickets, icon: CheckCircle, color: "text-purple-500" },
    { title: "Avg. Resolution", value: avgResolutionTime, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
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
