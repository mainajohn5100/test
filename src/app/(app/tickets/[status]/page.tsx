
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getUsers, getTicketsByStatus } from "@/lib/firestore";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

const statusMap: { [key: string]: { dbValue: string; title: string } } = {
  'all': { dbValue: 'all', title: 'All Tickets' },
  'new-status': { dbValue: 'New', title: 'New Tickets' },
  'active': { dbValue: 'Active', title: 'Active Tickets' },
  'pending': { dbValue: 'Pending', title: 'Pending Tickets' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Tickets' },
  'closed': { dbValue: 'Closed', title: 'Closed Tickets' },
  'terminated': { dbValue: 'Terminated', title: 'Terminated Tickets' },
};

export default async function TicketsPage({ params }: { params: { status: string } }) {
  const statusFilter = params.status || 'all';
  const statusConfig = statusMap[statusFilter];

  // If the status from the URL is not in our map, default to 'all'.
  const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus = statusConfig ? statusConfig.dbValue : 'all';

  console.log(`[TicketsPage] URL status: "${statusFilter}", DB status: "${dbStatus}"`);

  const tickets = await (async () => {
    if (dbStatus === 'all') {
      return getTickets();
    }
    return getTicketsByStatus(dbStatus);
  })();

  console.log(`[TicketsPage] Fetched ${tickets.length} tickets for status "${dbStatus}"`);


  const users = await getUsers();
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={pageTitle} description="View, manage, and filter your tickets.">
        <Link href="/tickets/new" passHref>
          <Button>
            <PlusCircle />
            New Ticket
          </Button>
        </Link>
      </PageHeader>
      
      <TicketClient 
        tickets={tickets}
        users={users}
        statusFilter={statusFilter}
      />
    </div>
  );
}
