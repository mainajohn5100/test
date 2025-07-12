
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
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useSettings } from "@/contexts/settings-context";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

interface RecentTicketsProps {
    tickets: Ticket[];
    userMap: Map<string, User>;
}

export function RecentTickets({ tickets, userMap }: RecentTicketsProps) {
  const router = useRouter();
  const { excludeClosedTickets, setExcludeClosedTickets } = useSettings();
  const recentTickets = tickets
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>A list of the most recently updated tickets. Click a row to view details.</CardDescription>
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
                        <Label htmlFor="hide-closed" className="pr-2 font-normal">Hide Closed Tickets</Label>
                        <Switch
                            id="hide-closed"
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.length > 0 ? recentTickets.map((ticket) => {
                const assignee = userMap.get(ticket.assignee);
                const reporterUser = userMap.get(ticket.reporter);
                const reporterDisplay = ticket.reporterEmail || (reporterUser ? reporterUser.email : `From: ${ticket.reporter}`);
                const reporterTitle = ticket.reporterEmail || (reporterUser ? reporterUser.email : ticket.reporter);

                return(
              <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                <TableCell>
                  <div className="font-medium">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground truncate" title={reporterTitle}>
                    {reporterDisplay}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[ticket.status] || 'default'}>{ticket.status}</Badge>
                </TableCell>
                <TableCell>{ticket.priority}</TableCell>
                <TableCell>
                    {assignee ? (
                    <div className="flex items-center gap-2">
                      <Link href={`/users/${assignee.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 relative z-10 p-1 -m-1 rounded-md hover:bg-background">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="hover:underline">{assignee.name}</span>
                      </Link>
                    </div>
                    ) : ticket.assignee }
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <TicketTableRowActions ticket={ticket} />
                </TableCell>
              </TableRow>
            )}) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
