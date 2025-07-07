
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTickets, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";

export default async function TicketsPage({ params }: { params: { status: string } }) {
  const statusFilter = params.status || 'all';

  let pageTitle = "Tickets";
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'new-status') {
      pageTitle = "New Tickets";
    } else {
      pageTitle = `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')} Tickets`;
    }
  }
  
  const tickets = await getTickets();
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
