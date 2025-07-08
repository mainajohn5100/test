
import { PageHeader } from "@/components/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TicketsOverviewChart } from "@/components/dashboard/tickets-overview-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { AvgResolutionTimeChart } from "@/components/dashboard/avg-resolution-time-chart";
import { getTickets, getProjects, getUsers } from "@/lib/firestore";
import { format, getMonth, differenceInDays } from 'date-fns';

export default async function DashboardPage() {
  // Fetch data from Firestore
  const tickets = await getTickets();
  const projects = await getProjects();
  const users = await getUsers();
  
  // Create a map for quick user lookup.
  const userMap = new Map(users.map(u => [u.name, u]));

  // Process data for TicketsOverviewChart
  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ticketsOverviewData = Object.entries(ticketsByStatus).map(([name, value]) => ({ name, value }));
  
  // Process data for AvgResolutionTimeChart
  const closedTickets = tickets.filter(t => t.status === 'Closed' || t.status === 'Terminated');
  const monthlyResolutionTimes: { [key: number]: { totalDays: number; count: number } } = {};

  closedTickets.forEach(ticket => {
    const createdAt = new Date(ticket.createdAt);
    const resolvedAt = new Date(ticket.updatedAt);
    const resolutionDays = differenceInDays(resolvedAt, createdAt);
    const month = getMonth(resolvedAt);
    
    if (!monthlyResolutionTimes[month]) {
      monthlyResolutionTimes[month] = { totalDays: 0, count: 0 };
    }
    monthlyResolutionTimes[month].totalDays += resolutionDays;
    monthlyResolutionTimes[month].count++;
  });

  const avgResolutionTimeData = Array.from({ length: 12 }).map((_, i) => {
    const monthName = format(new Date(2000, i, 1), 'MMM');
    if (monthlyResolutionTimes[i] && monthlyResolutionTimes[i].count > 0) {
      const avg = monthlyResolutionTimes[i].totalDays / monthlyResolutionTimes[i].count;
      return { name: monthName, days: parseFloat(avg.toFixed(1)) };
    }
    return { name: monthName, days: null };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Here's a snapshot of your helpdesk activity.">
        <Link href="/tickets/new" passHref>
          <Button>
            <PlusCircle />
            New Ticket
          </Button>
        </Link>
      </PageHeader>
      
      <StatsCards tickets={tickets} projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTickets tickets={tickets} userMap={userMap} />
        </div>
        <div className="flex flex-col gap-6">
          <TicketsOverviewChart data={ticketsOverviewData} />
          <AvgResolutionTimeChart data={avgResolutionTimeData} />
        </div>
      </div>
    </div>
  );
}
