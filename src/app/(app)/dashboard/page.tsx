import { PageHeader } from "@/components/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TicketsOverviewChart } from "@/components/dashboard/tickets-overview-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { AvgResolutionTimeChart } from "@/components/dashboard/avg-resolution-time-chart";
import { getTickets, getProjects, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";

export default async function DashboardPage() {
  // Fetch data from Firestore
  const tickets = await getTickets();
  const projects = await getProjects();
  const users = await getUsers();
  
  // Create a map for quick user lookup. Fallback to mock data if DB is empty.
  const userMap = new Map((users.length > 0 ? users : mockUsers).map(u => [u.name, u]));

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
          <TicketsOverviewChart />
          <AvgResolutionTimeChart />
        </div>
      </div>
    </div>
  );
}
