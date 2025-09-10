
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
    { title: "Open Tickets", value: openTickets, icon: TicketIcon, change: "+2%", changeType: 'increase', color: "text-blue-600", bgColor: "bg-blue-100", disabled: false },
    { title: "New Today", value: newTicketsToday, icon: FilePlus2, change: "+5%", changeType: 'increase', color: "text-purple-600", bgColor: "bg-purple-100", disabled: false },
    { title: "Total Tickets", value: totalTickets, icon: BarChart2, change: "-1%", changeType: 'decrease', color: "text-green-600", bgColor: "bg-green-100", disabled: false },
    { title: "Total Projects", value: totalProjects, icon: Briefcase, change: "+3%", changeType: 'increase', color: "text-orange-600", bgColor: "bg-orange-100", disabled: !projectsEnabled },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statItems.map((stat, index) => (
        <Card key={index} className={cn("p-2", stat.disabled && "bg-muted/50")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className={cn("text-sm font-medium text-gray-500", stat.disabled && "text-muted-foreground")}>{stat.title}</p>
                    <h3 className={cn("text-3xl font-bold", stat.disabled && "text-muted-foreground")}>{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color, stat.disabled && "text-muted-foreground")} />
                </div>
            </div>
             <p className="text-sm text-gray-600">
                <span className={cn(stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600')}>
                    {stat.changeType === 'increase' ? <ArrowUp className="inline-block mr-1 h-4 w-4" /> : <ArrowDown className="inline-block mr-1 h-4 w-4" />}
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
