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
import { tickets as allTickets, users } from "@/lib/data";
import { TicketTableRowActions } from "./ticket-table-row-actions";
import { formatDistanceToNow } from "date-fns";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

const priorityVariantMap: { [key: string]: string } = {
    'Low': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Urgent': 'bg-red-100 text-red-800 border-red-200',
};


export function TicketTable({ statusFilter }: { statusFilter?: string }) {
  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), []);
  
  const tickets = React.useMemo(() => {
    if (!statusFilter || statusFilter === 'all') {
      return allTickets;
    }
    // a bit of a hack to match the URL slugs with the data
    const normalizedFilter = statusFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return allTickets.filter(t => t.status === normalizedFilter);
  }, [statusFilter]);

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
                    <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                        <Badge variant={statusVariantMap[ticket.status] || 'default'}>
                            {ticket.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge className={`font-medium ${priorityVariantMap[ticket.priority]}`}>
                                {ticket.priority}
                            </Badge>
                        </TableCell>
                        <TableCell>
                        {assignee ? (
                            <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{assignee.name}</span>
                            </div>
                        ) : (
                            <span>{ticket.assignee}</span>
                        )}
                        </TableCell>
                        <TableCell>
                            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
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
