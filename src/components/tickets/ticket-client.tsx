
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { TicketTable } from "@/components/tickets/ticket-table";
import type { Ticket, User } from "@/lib/data";
import { useSettings } from "@/contexts/settings-context";
import { TicketTablePagination } from "./ticket-table-pagination";

interface TicketClientProps {
  tickets: Ticket[];
  users: User[];
  initialSearchTerm?: string;
}

const statusOrder: { [key in Ticket['status']]: number } = {
  'New': 0,
  'Active': 1,
  'Pending': 2,
  'On Hold': 3,
  'Closed': 4,
  'Terminated': 5,
};

const priorityOrder: { [key in Ticket['priority']]: number } = { 
  'Low': 0, 
  'Medium': 1, 
  'High': 2, 
  'Urgent': 3 
};

const EMAIL_SOURCES: Ticket['source'][] = ['Client Inquiry', 'Partner', 'Vendor', 'General Inquiry', 'Internal'];

export function TicketClient({ tickets, users, initialSearchTerm = '' }: TicketClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const { excludeClosedTickets } = useSettings();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  
  useEffect(() => {
      setSearchTerm(initialSearchTerm);
      setCurrentPage(1); // Reset to first page on new search
  }, [initialSearchTerm]);

  const filteredAndSortedTickets = useMemo(() => {
    let displayTickets = tickets ? [...tickets] : [];
    
    if (excludeClosedTickets) {
      displayTickets = displayTickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated');
    }
    
    if (statusFilter !== 'all') {
      displayTickets = displayTickets.filter(t => t.status === statusFilter);
    }

    if (channelFilter !== 'all') {
      if (channelFilter === 'email') {
        displayTickets = displayTickets.filter(t => EMAIL_SOURCES.includes(t.source));
      } else if (channelFilter === 'whatsapp') {
        displayTickets = displayTickets.filter(t => t.source === 'WhatsApp');
      } else if (channelFilter === 'project') {
        displayTickets = displayTickets.filter(t => t.source === 'Project');
      }
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      displayTickets = displayTickets.filter(t => 
        t.title.toLowerCase().includes(lowercasedSearchTerm) ||
        t.id.toLowerCase().includes(lowercasedSearchTerm) ||
        (t.assignee && t.assignee.toLowerCase().includes(lowercasedSearchTerm)) ||
        (t.reporter && t.reporter.toLowerCase().includes(lowercasedSearchTerm)) ||
        (t.status && t.status.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    
    const [key, order] = sortBy.split('_');
    
    displayTickets.sort((a, b) => {
      let valA, valB;

      if (key === 'createdAt' || key === 'updatedAt') {
        valA = new Date(a[key as 'createdAt' | 'updatedAt']).getTime();
        valB = new Date(b[key as 'createdAt' | 'updatedAt']).getTime();
      } else if (key === 'priority') {
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      } else if (key === 'status') {
        valA = statusOrder[a.status];
        valB = statusOrder[b.status];
      } else {
        return 0;
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return displayTickets;
  }, [tickets, searchTerm, sortBy, excludeClosedTickets, channelFilter, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, statusFilter, channelFilter, excludeClosedTickets, rowsPerPage]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedTickets.slice(startIndex, endIndex);
  }, [filteredAndSortedTickets, currentPage, rowsPerPage]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <TicketTableToolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
          />
          <TicketTable
            tickets={paginatedTickets}
            users={users}
          />
          <TicketTablePagination
            totalRows={filteredAndSortedTickets.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
