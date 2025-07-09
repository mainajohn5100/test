import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTicketsByStatus, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";
import { TicketClient } from "@/components/tickets/ticket-client";

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

  const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus = statusConfig ? statusConfig.dbValue : 'all';
  
  console.log(`[Tickets Page] URL status filter: "${statusFilter}"`);
  console.log(`[Tickets Page] Normalized status for DB query: "${dbStatus}"`);

  const tickets = await getTicketsByStatus(dbStatus);
  console.log(`[Tickets Page] Fetched ${tickets.length} tickets from Firestore.`);

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
