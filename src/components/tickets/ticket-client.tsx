
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { TicketTableToolbar } from "@/components/tickets/ticket-table-toolbar";
import { TicketTable } from "@/components/tickets/ticket-table";
import type { Ticket, User } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ListOrdered } from "lucide-react";

interface TicketClientProps {
  tickets: Ticket[];
  users: User[];
  initialStatusFilter: string;
}

export function TicketClient({ tickets, users, initialStatusFilter }: TicketClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const router = useRouter();
  
  const isFilteredView = initialStatusFilter !== 'all';

  const handleStatusChange = (newStatus: string) => {
    // Navigate to the new page. The server will handle fetching the correct data.
    router.push(`/tickets/${newStatus}`);
  };

  const filteredAndSortedTickets = useMemo(() => {
    // The `tickets` prop is already pre-filtered by status on the server.
    // We only need to apply client-side search and sort.
    let displayTickets = tickets ? [...tickets] : [];

    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      displayTickets = displayTickets.filter(t => 
        t.title.toLowerCase().includes(lowercasedSearchTerm) ||
        t.id.toLowerCase().includes(lowercasedSearchTerm) ||
        (t.assignee && t.assignee.toLowerCase().includes(lowercasedSearchTerm)) ||
        (t.reporter && t.reporter.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    
    // Sort tickets
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <TicketTableToolbar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <div className="flex gap-2 w-full md:w-auto shrink-0">
                {!isFilteredView && (
                  <Select value={initialStatusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new-status">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full h-10 md:w-auto">
                    <ListOrdered className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt_desc">Last Updated</SelectItem>
                    <SelectItem value="createdAt_desc">Newest First</SelectItem>
                    <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                    <SelectItem value="priority_desc">Priority (High-Low)</SelectItem>
                    <SelectItem value="priority_asc">Priority (Low-High)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <TicketTable 
            tickets={filteredAndSortedTickets}
            users={users}
          />
        </div>
      </CardContent>
    </Card>
  );
}
