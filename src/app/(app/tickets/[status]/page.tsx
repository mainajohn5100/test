
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getTicketsByStatus, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

export default async function TicketsPage({ params }: { params: { status: string } }) {
  const statusFilter = params.status || 'all';

  let pageTitle = "All Tickets";
  let normalizedStatus = "all";
  
  // Normalize the status from the URL to match the database values 
  // (e.g., 'new-status' -> 'New', 'on-hold' -> 'On Hold')
  if (statusFilter !== 'all') {
    if (statusFilter === 'new-status') {
      pageTitle = "New Tickets";
      normalizedStatus = "New";
    } else {
      normalizedStatus = statusFilter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      pageTitle = `${normalizedStatus} Tickets`;
    }
  }
  
  // Fetch the correct data from Firestore based on the status
  const tickets = (normalizedStatus === 'all')
    ? await getTickets()
    : await getTicketsByStatus(normalizedStatus);

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
