import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getTicketsByStatus, getUsers } from "@/lib/firestore";
import { users as mockUsers } from "@/lib/data";
import type { TicketStatusFilter } from "@/types";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

interface TicketsPageProps {
  params: { status: string };
}

// Define the list of valid statuses that match your database values
const validStatuses: TicketStatusFilter[] = ["all", "new", "pending", "on-hold", "closed", "active", "terminated"];

export default async function TicketsPage({ params }: TicketsPageProps) {
  const statusFromParams = params?.status;

  // 1. Validate the status from the URL.
  // If it's not in our list of valid statuses, show an error page.
  if (!statusFromParams || !validStatuses.includes(statusFromParams as TicketStatusFilter)) {
    const displayStatus = statusFromParams || 'not provided';
    return (
      <div className="flex flex-col gap-6">
        <PageHeader 
          title={`Invalid Ticket Status: "${displayStatus}"`} 
          description="Please select a valid ticket status from the navigation."
        >
          <Button asChild>
            <Link href="/tickets/all">View All Tickets</Link>
          </Button>
        </PageHeader>
      </div>
    );
  }

  // 2. The status is valid. Use the raw parameter directly to fetch data.
  const status = statusFromParams as TicketStatusFilter;
  const tickets = await getTicketsByStatus(status);
  const users = await getUsers();

  // 3. Create a user-friendly title for display purposes *after* fetching.
  let pageTitle = "All Tickets";
  
  if (status !== 'all') {
    if (status === 'new-status') {
      pageTitle = "New Tickets";
    } else {
      const normalizedStatus = status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      pageTitle = `${normalizedStatus} Tickets`;
    }
  }

  // 4. Render the page with the correctly filtered data.
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
        initialStatusFilter={status}
      />
    </div>
  );
}