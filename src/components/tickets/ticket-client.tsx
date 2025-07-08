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
  const [sortBy, setSortBy] = useState('updatedAt_desc');

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
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <TicketTable 
            tickets={tickets}
            users={users}
            searchTerm={searchTerm}
            priorityFilter={priorityFilter}
            sortBy={sortBy}
          />
        </div>
      </CardContent>
    </Card>
  );
}
