
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getUsers, getTicketsByStatus } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

export default async function TicketsPage({ 
  params 
}: { 
  params: { status: string } 
}) {
  const statusFilter = params.status || 'all';
  
  let pageTitle: string;
  let normalizedStatus: string;
  
  if (statusFilter === 'all') {
    pageTitle = 'All Tickets';
    normalizedStatus = 'all';
  } else {
    // Convert URL slug to a display-friendly and DB-friendly format.
    // e.g., 'new-status' -> 'New', 'on-hold' -> 'On Hold'
    const statusMap: { [key: string]: string } = {
        'new-status': 'New',
        'on-hold': 'On Hold'
    };
    normalizedStatus = statusMap[statusFilter] || statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    pageTitle = `${normalizedStatus} Tickets`;
  }
  
  // Fetch tickets based on the normalized status
  const tickets = await (async () => {
    if (normalizedStatus === 'all') {
      return getTickets();
    }
    return getTicketsByStatus(normalizedStatus);
  })();

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
        users={users.length > 0 ? users : mockUsers}
        initialStatusFilter={statusFilter}
      />
    </div>
  );
}
