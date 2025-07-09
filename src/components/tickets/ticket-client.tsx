
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { TicketTable } from "@/components/tickets/ticket-table";
import type { Ticket, User } from "@/lib/data";

interface TicketClientProps {
  tickets: Ticket[];
  users: User[];
}

export function TicketClient({ tickets, users }: TicketClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt_desc');

  const filteredAndSortedTickets = useMemo(() => {
    let displayTickets = tickets ? [...tickets] : [];

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      displayTickets = displayTickets.filter(t => 
        t.title.toLowerCase().includes(lowercasedSearchTerm) ||
        t.id.toLowerCase().includes(lowercasedSearchTerm) ||
        (t.assignee && t.assignee.toLowerCase().includes(lowercasedSearchTerm)) ||
        (t.reporter && t.reporter.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    
    const [key, order] = sortBy.split('_');
    
    displayTickets.sort((a, b) => {
      let valA, valB;

      if (key === 'createdAt' || key === 'updatedAt') {
        valA = new Date(a[key as 'createdAt' | 'updatedAt']).getTime();
        valB = new Date(b[key as 'createdAt' | 'updatedAt']).getTime();
      } else if (key === 'priority') {
        const priorityOrder: { [key in Ticket['priority']]: number } = { 'Low': 0, 'Medium': 1, 'High': 2, 'Urgent': 3 };
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      } else {
        return 0;
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return displayTickets;
  }, [tickets, searchTerm, sortBy]);


  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <TicketTableToolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <TicketTable 
            tickets={filteredAndSortedTickets}
            users={users}
          />
        </div>
      </CardContent>
    </Card>
  );
}
