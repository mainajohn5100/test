
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { TicketTable } from "@/components/tickets/ticket-table";
import type { Ticket, User } from "@/lib/data";

interface TicketClientProps {
  tickets: Ticket[];
  users: User[];
  initialStatusFilter: string;
}

export function TicketClient({ tickets, users, initialStatusFilter }: TicketClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <TicketTableToolbar 
            statusFilter={initialStatusFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />
          <TicketTable 
            tickets={tickets}
            users={users}
            statusFilter={initialStatusFilter} 
            searchTerm={searchTerm}
            priorityFilter={priorityFilter}
          />
        </div>
      </CardContent>
    </Card>
  );
}
