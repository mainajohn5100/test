
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
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
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt_desc');

  const isFilteredView = initialStatusFilter !== 'all';
  
  // This effect ensures the component's internal filter state
  // syncs with the URL when navigating between pages.
  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const filteredAndSortedTickets = useMemo(() => {
    let filteredTickets = [...tickets];

    // Filter by status from URL/toolbar
    if (statusFilter && statusFilter !== 'all') {
      const normalizedStatus = statusFilter === 'new-status' 
        ? 'New' 
        : statusFilter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      filteredTickets = filteredTickets.filter(t => t.status === normalizedStatus);
    }

    // Filter by priority from toolbar
    if (priorityFilter && priorityFilter !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.priority.toLowerCase() === priorityFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.title.toLowerCase().includes(lowercasedSearchTerm) ||
        t.id.toLowerCase().includes(lowercasedSearchTerm) ||
        t.assignee.toLowerCase().includes(lowercasedSearchTerm) ||
        t.reporter.toLowerCase().includes(lowercasedSearchTerm)
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
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortBy]);


  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <TicketTableToolbar 
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
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
