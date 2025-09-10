
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Ticket, Project } from "@/lib/data";
import { Ticket as TicketIcon, BarChart2, FilePlus2, Briefcase, ArrowUp, ArrowDown } from "lucide-react";
import { isToday } from "date-fns";
import { useSettings } from "@/contexts/settings-context";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  tickets: Ticket[];
  projects: Project[];
}

export function StatsCards({ tickets, projects }: StatsCardsProps) {
  const { projectsEnabled } = useSettings();
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated').length;
  const newTicketsToday = tickets.filter(t => t.createdAt && isToday(new Date(t.createdAt))).length;
  const totalProjects = projects.length;

  const statItems = [
    { title: "Open Tickets", value: openTickets, icon: TicketIcon, change: "+2%", changeType: 'increase', color: "text-blue-500", bgColor: "bg-blue-100", disabled: false },
    { title: "New Today", value: newTicketsToday, icon: FilePlus2, change: "+5%", changeType: 'increase', color: "text-purple-500", bgColor: "bg-purple-100", disabled: false },
    { title: "Total Tickets", value: totalTickets, icon: BarChart2, change: "-1%", changeType: 'decrease', color: "text-green-500", bgColor: "bg-green-100", disabled: false },
    { title: "Total Projects", value: totalProjects, icon: Briefcase, change: "+3%", changeType: 'increase', color: "text-orange-500", bgColor: "bg-orange-100", disabled: !projectsEnabled },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, index) => (
        <Card key={index} className={cn("shadow-sm", stat.disabled && "bg-muted/50")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-sm font-medium", stat.disabled && "text-muted-foreground")}>{stat.title}</CardTitle>
            <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4 text-muted-foreground", !stat.disabled && stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stat.disabled && "text-muted-foreground")}>{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={cn(stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600', stat.disabled && "text-muted-foreground")}>
                    {stat.changeType === 'increase' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {stat.change}
                </span>
                vs last week
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
