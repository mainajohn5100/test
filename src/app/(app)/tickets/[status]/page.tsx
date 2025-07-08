
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getTicketsByStatus, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";

export default async function TicketsPage({ params }: { params: { status: string } }) {
  const statusFilter = params.status || 'all';

  let pageTitle = "All Tickets";
  let normalizedStatus = "all";
  
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'new-status') {
      pageTitle = "New Tickets";
      normalizedStatus = "New";
    } else {
      normalizedStatus = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ');
      pageTitle = `${normalizedStatus} Tickets`;
    }
  }
  
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
