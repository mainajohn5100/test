'use client';

import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/components/tickets/ticket-table";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function TicketsPage() {
  const params = useParams<{ status: string }>();
  const statusFilter = params.status || 'all';

  let pageTitle = "Tickets";
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'new-status') {
      pageTitle = "New Tickets";
    } else {
      pageTitle = `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')} Tickets`;
    }
  }


  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

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
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <TicketTableToolbar 
              statusFilter={statusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
            <TicketTable 
              statusFilter={statusFilter} 
              searchTerm={searchTerm}
              priorityFilter={priorityFilter}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
