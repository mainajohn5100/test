import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/components/tickets/ticket-table";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TicketsPage({ params }: { params: { status: string } }) {
  const { status } = params;
  const pageTitle = status
    ? `${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} Tickets`
    : "Tickets";

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
            <TicketTableToolbar />
            <TicketTable statusFilter={status} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function generateStaticParams() {
    const statuses = ['all', 'new-list', 'pending', 'on-hold', 'closed', 'active', 'terminated'];
    return statuses.map((status) => ({
      status: status,
    }))
}
