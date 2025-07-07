
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
import { tickets } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { users } from "@/lib/data"
import { useRouter } from "next/navigation"
import Link from "next/link";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

export function RecentTickets() {
  const router = useRouter();
  const recentTickets = tickets.slice(0, 5);
  const userMap = new Map(users.map(u => [u.name, u]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>A list of the most recently updated tickets. Click a row to view details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.map((ticket) => {
                const assignee = userMap.get(ticket.assignee);
                return(
              <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                <TableCell>
                  <div className="font-medium">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground">{ticket.id}</div>
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
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
