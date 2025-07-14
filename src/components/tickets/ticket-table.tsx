
//ticket-table.tsx
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
}

const sourceVariantMap: { [key: string]: string } = {
  'Project': 'text-purple-700 border-purple-500/50 bg-purple-500/10',
  'Client Inquiry': 'text-sky-700 border-sky-500/50 bg-sky-500/10',
  'Internal': 'text-gray-700 border-gray-500/50 bg-gray-500/10',
  'Partner': 'text-rose-700 border-rose-500/50 bg-rose-500/10',
  'Vendor': 'text-amber-700 border-amber-500/50 bg-amber-500/10',
  'General Inquiry': 'text-cyan-700 border-cyan-500/50 bg-cyan-500/10',
};


export function TicketTable({ tickets, users }: TicketTableProps) {
  const router = useRouter();
  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);

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
                    const truncatedId = `${ticket.id.substring(0, 5)}...${ticket.id.slice(-3)}`;
                    return (
                    <TableRow key={ticket.id} onClick={() => router.push(`/tickets/view/${ticket.id}`)} className="cursor-pointer">
                        <TableCell>
                          {ticket.source && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "mb-1 text-xs font-normal capitalize opacity-80",
                                sourceVariantMap[ticket.source] || 'text-gray-700 border-gray-500/50 bg-gray-500/10'
                              )}
                            >
                              {ticket.source}
                            </Badge>
                          )}
                          <div className="font-medium text-sm truncate">{truncatedId}</div>
                        </TableCell>
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
