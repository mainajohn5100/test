import { PageHeader } from "@/components/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TicketsOverviewChart } from "@/components/dashboard/tickets-overview-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle, Maximize } from "lucide-react";
import Link from "next/link";
import { AvgResolutionTimeChart } from "@/components/dashboard/avg-resolution-time-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Here's a snapshot of your helpdesk activity.">
        <Button variant="outline" size="icon">
          <Maximize className="h-4 w-4" />
          <span className="sr-only">Full screen</span>
        </Button>
        <Link href="/tickets/new" passHref>
          <Button>
            <PlusCircle />
            New Ticket
          </Button>
        </Link>
      </PageHeader>
      
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTickets />
        </div>
        <div className="flex flex-col gap-6">
          <TicketsOverviewChart />
          <AvgResolutionTimeChart />
        </div>
      </div>
    </div>
  );
}
