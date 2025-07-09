
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

interface StatusConfig {
  dbValue: string;
  title: string;
}

interface PageParams {
  status: string;
}

interface TicketsPageProps {
  params: Promise<PageParams>;
}

const statusMap: Record<string, StatusConfig> = {
  'all': { dbValue: 'all', title: 'All Tickets' },
  'new-status': { dbValue: 'New', title: 'New Tickets' },
  'active': { dbValue: 'Active', title: 'Active Tickets' },
  'pending': { dbValue: 'Pending', title: 'Pending Tickets' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Tickets' },
  'closed': { dbValue: 'Closed', title: 'Closed Tickets' },
  'terminated': { dbValue: 'Terminated', title: 'Terminated Tickets' },
};

export default async function TicketsPage({ params }: TicketsPageProps): Promise<JSX.Element> {
  // Await the params Promise
  const resolvedParams: PageParams = await params;
  
  console.log('🔍 Raw params received:', resolvedParams);
  
  const statusFilter: string = resolvedParams.status || 'all';
  const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
  
  console.log('🎯 Status filter resolved to:', statusFilter);
  console.log('🗺️ Status config:', statusConfig);

  // If the status from the URL is not in our map, default to 'all'.
  const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';

  console.log(`🎫 Fetching tickets for status: "${dbStatus}" (URL param: "${statusFilter}")`);

  const tickets = await (async () => {
    if (dbStatus === 'all') {
      return getTickets();
    }
    return getTicketsByStatus(dbStatus);
  })();

  console.log(`📊 Fetched ${tickets.length} tickets for status "${dbStatus}":`, tickets);

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
        initialStatusFilter={""} 
      />
    </div>
  );
}
