
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Ticket, Project } from "@/lib/data";
import { Ticket as TicketIcon, Activity, CheckCircle, FilePlus2, Briefcase, ArrowUp, ArrowDown } from "lucide-react";
import { isWithinInterval, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { useSettings } from "@/contexts/settings-context";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  tickets: Ticket[];
  projects: Project[];
}

function calculatePercentageChange(current: number, previous: number): { change: string; changeType: 'increase' | 'decrease' | 'neutral' } {
    if (previous === 0) {
        return { change: current > 0 ? '+100%' : '0%', changeType: current > 0 ? 'increase' : 'neutral' };
    }
    if (current === previous) {
        return { change: '0%', changeType: 'neutral' };
    }
    const change = ((current - previous) / previous) * 100;
    return {
        change: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
        changeType: change > 0 ? 'increase' : 'decrease'
    };
}


export function StatsCards({ tickets, projects }: StatsCardsProps) {
  const { projectsEnabled } = useSettings();

  // Date ranges
  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });
  const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Ticket counts by status
  const newTicketsCount = tickets.filter(t => t.status === 'New').length;
  const activeTicketsCount = tickets.filter(t => t.status === 'Active').length;

  // This week's stats
  const resolvedTicketsThisWeek = tickets.filter(t => (t.status === 'Closed' || t.status === 'Terminated') && isWithinInterval(new Date(t.updatedAt), { start: startOfThisWeek, end: endOfThisWeek })).length;
  const newProjectsThisWeek = projects.filter(p => isWithinInterval(new Date(p.createdAt), { start: startOfThisWeek, end: endOfThisWeek })).length;
  const newTicketsThisWeek = tickets.filter(t => isWithinInterval(new Date(t.createdAt), { start: startOfThisWeek, end: endOfThisWeek })).length;

  // Previous week's stats
  const resolvedTicketsLastWeek = tickets.filter(t => (t.status === 'Closed' || t.status === 'Terminated') && isWithinInterval(new Date(t.updatedAt), { start: startOfLastWeek, end: endOfLastWeek })).length;
  const activeTicketsLastWeek = tickets.filter(t => t.status === 'Active' && isWithinInterval(new Date(t.createdAt), { start: startOfLastWeek, end: endOfLastWeek })).length;
  const newTicketsLastWeek = tickets.filter(t => t.status === 'New' && isWithinInterval(new Date(t.createdAt), { start: startOfLastWeek, end: endOfLastWeek })).length;
  const newProjectsLastWeek = projects.filter(p => isWithinInterval(new Date(p.createdAt), { start: startOfLastWeek, end: endOfLastWeek })).length;

  const newTicketsChange = calculatePercentageChange(newTicketsThisWeek, newTicketsLastWeek);
  const activeTicketsChange = calculatePercentageChange(activeTicketsCount, activeTicketsLastWeek);
  const resolvedTicketsChange = calculatePercentageChange(resolvedTicketsThisWeek, resolvedTicketsLastWeek);
  const newProjectsChange = calculatePercentageChange(newProjectsThisWeek, newProjectsLastWeek);

  const statItems = [
    { title: "New Tickets", value: newTicketsCount, icon: FilePlus2, change: newTicketsChange.change, changeType: newTicketsChange.changeType, footerText: "vs last week", color: "text-purple-600", bgColor: "bg-purple-100", disabled: false },
    { title: "Active Tickets", value: activeTicketsCount, icon: Activity, change: activeTicketsChange.change, changeType: activeTicketsChange.changeType, footerText: "vs last week", color: "text-blue-600", bgColor: "bg-blue-100", disabled: false },
    { title: "Resolved This Week", value: resolvedTicketsThisWeek, icon: CheckCircle, change: resolvedTicketsChange.change, changeType: resolvedTicketsChange.changeType, footerText: "vs last week", color: "text-green-600", bgColor: "bg-green-100", disabled: false },
    { title: "New Projects This Week", value: newProjectsThisWeek, icon: Briefcase, change: newProjectsChange.change, changeType: newProjectsChange.changeType, footerText: "vs last week", color: "text-orange-600", bgColor: "bg-orange-100", disabled: !projectsEnabled },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statItems.map((stat, index) => (
        <Card key={index} className={cn("flex flex-col justify-between", stat.disabled && "bg-muted/50")}>
          <CardContent className="p-4 pb-0">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className={cn("text-sm font-medium text-gray-500", stat.disabled && "text-muted-foreground")}>{stat.title}</p>
                    <h3 className={cn("text-3xl font-bold", stat.disabled && "text-muted-foreground")}>{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-full flex-shrink-0", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color, stat.disabled && "text-muted-foreground")} />
                </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <p className="text-xs text-gray-500">
                <span className={cn(
                    stat.changeType === 'increase' && 'text-green-600',
                    stat.changeType === 'decrease' && 'text-red-600',
                    stat.changeType === 'neutral' && 'text-gray-500'
                )}>
                    {stat.changeType === 'increase' ? <ArrowUp className="inline-block mr-1 h-3 w-3" /> : stat.changeType === 'decrease' ? <ArrowDown className="inline-block mr-1 h-3 w-3" /> : null}
                    {stat.change}
                </span>
                <span className="ml-1">{stat.footerText}</span>
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
