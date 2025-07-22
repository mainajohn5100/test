
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import type { Ticket, User } from "@/lib/data";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { TicketTableRowActions } from "../tickets/ticket-table-row-actions";
import { Button } from "../ui/button";
import { Briefcase, Mail, MessageCircle, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useSettings } from "@/contexts/settings-context";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

const statusVariantMap: { [key: string]: string } = {
  'New': 'text-blue-700 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20',
  'Pending': 'text-yellow-700 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
  'On Hold': 'text-orange-700 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
  'Active': 'text-green-700 border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
  'Closed': 'text-gray-700 border-gray-500/50 bg-gray-500/10 hover:bg-gray-500/20',
  'Terminated': 'text-red-700 border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
};

const priorityVariantMap: { [key: string]: string } = {
    'Low': 'text-green-700 border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
    'Medium': 'text-yellow-700 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
    'High': 'text-orange-700 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
    'Urgent': 'text-red-700 border-red-500/50 bg-red-500/10 hover:bg-red-500/20',
};

const getTicketSource = (ticket: Ticket) => {
    if (ticket.source === 'WhatsApp') return { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-700'};
    if (ticket.source === 'Project') return { name: 'Project', icon: Briefcase, color: 'text-purple-700' };
    return { name: 'Email', icon: Mail, color: 'text-sky-700' };
}

interface RecentTicketsProps {
    tickets: Ticket[];
    userMap: Map<string, User>;
} 

export function RecentTickets({ tickets, userMap }: RecentTicketsProps) {
  const router = useRouter();
  const { excludeClosedTickets, setExcludeClosedTickets } = useSettings();
  const recentTickets = tickets
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>A list of the 10 most recently updated tickets. Click a row to view details.</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between w-full">
                        <Label htmlFor="hide-closed-dashboard" className="pr-2 font-normal">Hide Closed Tickets</Label>
                        <Switch
                            id="hide-closed-dashboard"
                            checked={excludeClosedTickets}
                            onCheckedChange={setExcludeClosedTickets}
                        />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.length > 0 ? recentTickets.map((ticket) => {
                const assignee = userMap.get(ticket.assignee);
                const reporterUser = userMap.get(ticket.reporter);
                const reporterDisplay = ticket.reporterEmail || (reporterUser ? reporterUser.email : `From: ${ticket.reporter}`);
                const reporterTitle = ticket.reporterEmail || (reporterUser ? reporterUser.email : ticket.reporter);
                const source = getTicketSource(ticket);
                const updatedAtDate = new Date(ticket.updatedAt);
                const updatedAtDisplay = isValid(updatedAtDate)
                  ? formatDistanceToNow(updatedAtDate, { addSuffix: true })
                  : '...';
              
                return(
              <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                <TableCell>
                  <div className="font-medium truncate">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground truncate" title={reporterTitle}>
                    {reporterDisplay}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-medium capitalize", statusVariantMap[ticket.status] || 'text-gray-700 border-gray-500/50 bg-gray-500/10')}>{ticket.status}</Badge>
                </TableCell>
                 <TableCell>
                    <Badge
                        variant="outline"
                        className={cn("font-medium capitalize", priorityVariantMap[ticket.priority])}
                    >
                        {ticket.priority}
                    </Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 max-w-[150px] truncate">
                        {assignee ? (
                            <Link href={`/users/${assignee.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 relative z-10 p-1 -m-1 rounded-md hover:bg-background">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="hover:underline truncate">{assignee.name}</span>
                            </Link>
                        ) : (
                            <span className="truncate">{ticket.assignee}</span>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex items-center gap-2">
                                     <source.icon className={cn("h-4 w-4", source.color)} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Source: {source.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableCell>
                <TableCell>
                    <span className="text-muted-foreground">{updatedAtDisplay}</span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <TicketTableRowActions ticket={ticket} />
                </TableCell>
              </TableRow>
            )}) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                    No recent tickets found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
