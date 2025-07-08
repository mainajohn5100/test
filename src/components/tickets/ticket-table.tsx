
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Ticket, User } from "@/lib/data";
import { TicketTableRowActions } from "./ticket-table-row-actions";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


interface TicketTableProps {
    tickets: Ticket[];
    users: User[];
    searchTerm?: string;
    statusFilter?: string;
    priorityFilter?: string;
    sortBy?: string;
}

export function TicketTable({ tickets: allTickets, users, searchTerm, statusFilter, priorityFilter, sortBy = 'updatedAt_desc' }: TicketTableProps) {
  const router = useRouter();
  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);
  
  const tickets = React.useMemo(() => {
    let filteredTickets = [...allTickets];

    // Filter by status from toolbar
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
        t.assignee.toLowerCase().includes(lowercasedSearchTerm)
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
        return 0; // No other sorting keys are implemented
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredTickets;
  }, [allTickets, searchTerm, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="w-full overflow-hidden">
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[150px]">Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tickets.length > 0 ? (
                tickets.map((ticket) => {
                    const assignee = userMap.get(ticket.assignee);
                    return (
                    <TableRow key={ticket.id} onClick={() => router.push(`/tickets/view/${ticket.id}`)} className="cursor-pointer">
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                                "font-medium capitalize",
                                ticket.status === 'New' && 'text-blue-700 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20',
                                ticket.status === 'Pending' && 'text-yellow-700 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
                                ticket.status === 'On Hold' && 'text-orange-700 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
                                ticket.status === 'Active' && 'text-green-700 border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
                                ticket.status === 'Closed' && 'text-gray-700 border-gray-500/50 bg-gray-500/10 hover:bg-gray-500/20',
                                ticket.status === 'Terminated' && 'text-red-700 border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
                            )}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant="outline"
                                className={cn(
                                "font-medium capitalize",
                                ticket.priority === 'Urgent' && 'text-red-700 border-red-500/50 bg-red-500/10 hover:bg-red-500/20',
                                ticket.priority === 'High' && 'text-orange-700 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
                                ticket.priority === 'Medium' && 'text-yellow-700 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
                                ticket.priority === 'Low' && 'text-green-700 border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                                )}
                            >
                                {ticket.priority}
                            </Badge>
                        </TableCell>
                        <TableCell>
                        {assignee ? (
                            <Link href={`/users/${assignee.id}`} onClick={(e) => e.stopPropagation()} className="relative z-10">
                                <div className="flex items-center gap-2 hover:bg-muted p-1 rounded-md -m-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="hover:underline">{assignee.name}</span>
                                </div>
                            </Link>
                        ) : (
                            <span>{ticket.assignee}</span>
                        )}
                        </TableCell>
                        <TableCell>
                            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <TicketTableRowActions ticket={ticket} />
                        </TableCell>
                    </TableRow>
                    );
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                    No tickets found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
