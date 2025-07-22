

'use client';

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
import { formatDistanceToNow, isValid } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";


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
  'WhatsApp': 'text-green-700 border-green-500/50 bg-green-500/10',
  'Email': 'text-sky-700 border-sky-500/50 bg-sky-500/10', // Generic email
};

const categoryVariantMap: { [key: string]: string } = {
  'Support': 'text-blue-700 border-blue-500/50 bg-blue-500/10',
  'Billing': 'text-green-700 border-green-500/50 bg-green-500/10',
  'Advertising': 'text-orange-700 border-orange-500/50 bg-orange-500/10',
  'General': 'text-gray-700 border-gray-500/50 bg-gray-500/10',
  'Internal': 'text-violet-700 border-violet-500/50 bg-violet-500/10',
};


export function TicketTable({ tickets, users }: TicketTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);

  const getTicketSource = (ticket: Ticket) => {
    if (ticket.source === 'WhatsApp' || ticket.source === 'Project') {
      return ticket.source;
    }
    return 'Email';
  }

  const filteredTickets = React.useMemo(() => {
    if (user?.role === 'Client') {
      return tickets.filter(ticket => ticket.category !== 'Internal');
    }
    return tickets;
  }, [tickets, user]);

  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <Table className="min-w-full table-auto">
        <TableHeader>
            <TableRow>
            <TableHead className="w-[150px] p-2 md:p-4">Ticket ID</TableHead>
            <TableHead className="p-2 md:p-4">Title</TableHead>
            <TableHead className="p-2 md:p-4">Reporter</TableHead>
            <TableHead className="p-2 md:p-4">Status</TableHead>
            <TableHead className="p-2 md:p-4">Priority</TableHead>
            <TableHead className="p-2 md:p-4">Source</TableHead>
            <TableHead className="p-2 md:p-4">Assignee</TableHead>
            <TableHead className="p-2 md:p-4">Last Updated</TableHead>
            <TableHead className="w-[50px] p-2 md:p-4"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
                const assignee = userMap.get(ticket.assignee);
                const reporter = userMap.get(ticket.reporter);
                const truncatedId = `${ticket.id.substring(0, 5)}...${ticket.id.slice(-3)}`;

                const updatedAtDate = new Date(ticket.updatedAt);
                const updatedAtDisplay = isValid(updatedAtDate)
                  ? formatDistanceToNow(updatedAtDate, { addSuffix: true })
                  : '...';

                const source = getTicketSource(ticket);

                return (
                <TableRow key={ticket.id} onClick={() => router.push(`/tickets/view/${ticket.id}`)} className="cursor-pointer text-xs md:text-sm">
                    <TableCell className="p-2 md:p-4">
                      <div className="flex flex-col items-start gap-1">
                        {ticket.category && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize px-1 py-0 text-[9px] font-normal",
                              categoryVariantMap[ticket.category] || 'text-gray-700 border-gray-500/50 bg-gray-500/10'
                            )}
                          >
                            {ticket.category}
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium truncate mt-1">{truncatedId}</div>
                    </TableCell>
                    <TableCell className="p-2 md:p-4 max-w-[200px] truncate" title={ticket.title}>
                        {ticket.title}
                    </TableCell>
                     <TableCell className="p-2 md:p-4">
                        {reporter ? (
                            <Link href={`/users/${reporter.id}`} onClick={(e) => e.stopPropagation()} className="relative z-10">
                                <div className="flex items-center gap-2 hover:bg-muted p-1 rounded-md -m-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={reporter.avatar} alt={reporter.name} />
                                        <AvatarFallback>{reporter.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium hover:underline">{reporter.name}</p>
                                        <p className="text-xs text-muted-foreground">{reporter.email}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                             <div>
                                <p className="font-medium">{ticket.reporter}</p>
                                {ticket.reporterEmail && <p className="text-xs text-muted-foreground">{ticket.reporterEmail}</p>}
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="p-2 md:p-4">
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
                    <TableCell className="p-2 md:p-4">
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
                    <TableCell className="p-2 md:p-4">
                        <Badge
                          variant="outline"
                          className={cn("capitalize", sourceVariantMap[source] || 'text-gray-700 border-gray-500/50 bg-gray-500/10')}
                        >
                          {source}
                        </Badge>
                    </TableCell>
                    <TableCell className="p-2 md:p-4">
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
                    <TableCell className="p-2 md:p-4">
                        {updatedAtDisplay}
                    </TableCell> 
                    <TableCell className="p-2 md:p-4" onClick={(e) => e.stopPropagation()}>
                      <TicketTableRowActions ticket={ticket} />
                    </TableCell>
                </TableRow>
                );
            })
            ) : (
            <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
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
