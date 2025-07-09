
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";
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
  const [sortBy, setSortBy] = useState('updatedAt_desc');

  // The status filter is now determined by the page, not client-side state.
  // We use `initialStatusFilter` directly to control UI elements.
  const isFilteredView = initialStatusFilter !== 'all';
  
  const filteredAndSortedTickets = useMemo(() => {
    // The `tickets` prop is already pre-filtered by status from the server component.
    // We only need to apply client-side search and sort.
    let filteredTickets = tickets ? [...tickets] : [];

    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.title.toLowerCase().includes(lowercasedSearchTerm) ||
        t.id.toLowerCase().includes(lowercasedSearchTerm) ||
        (t.assignee && t.assignee.toLowerCase().includes(lowercasedSearchTerm)) ||
        (t.reporter && t.reporter.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    
    // Sort tickets
    const [key, order] = sortBy.split('_');
    
    filteredTickets.sort((a, b) => {
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

    return filteredTickets;
    // Dependency array no longer needs a statusFilter. It re-runs when props change.
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
            isFilteredView={isFilteredView}
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
