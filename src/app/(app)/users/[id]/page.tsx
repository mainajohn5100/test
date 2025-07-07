
'use client';

import { tickets, users, projects } from "@/lib/data";
import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ticketStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const user = users.find(u => u.id === params.id);

  if (!user) {
    notFound();
  }

  const assignedTickets = tickets.filter(t => t.assignee === user.name);
  const reportedTickets = tickets.filter(t => t.reporter === user.name);
  const managedProjects = projects.filter(p => p.manager === user.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={user.name} description={`Manage profile, settings, and activity for ${user.email}.`}>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.role}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" variant="outline">Edit Profile</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline" disabled>
                        <KeyRound className="mr-2"/>
                        Change Password
                    </Button>
                    <Button className="w-full" variant="outline" disabled>
                        <ShieldCheck className="mr-2"/>
                        Enable Two-Factor Auth
                    </Button>
                    <p className="text-xs text-muted-foreground text-center pt-2">SSO/OAuth settings would appear here.</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>A summary of tickets and projects associated with this user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedTickets.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Assigned Tickets ({assignedTickets.length})</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedTickets.slice(0, 5).map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                            <TableCell className="font-medium">{ticket.title}</TableCell>
                            <TableCell>
                              <Badge variant={ticketStatusVariantMap[ticket.status] || 'default'}>{ticket.status}</Badge>
                            </TableCell>
                            <TableCell>{ticket.priority}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
               {reportedTickets.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Reported Tickets ({reportedTickets.length})</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportedTickets.slice(0, 5).map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                            <TableCell className="font-medium">{ticket.title}</TableCell>
                            <TableCell>
                              <Badge variant={ticketStatusVariantMap[ticket.status] || 'default'}>{ticket.status}</Badge>
                            </TableCell>
                            <TableCell>{ticket.priority}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {managedProjects.length > 0 && (
                 <div>
                  <h3 className="font-medium mb-2">Managed Projects ({managedProjects.length})</h3>
                  <div className="border rounded-md">
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managedProjects.map((project) => (
                          <TableRow key={project.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/projects/view/${project.id}`)}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{project.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {assignedTickets.length === 0 && reportedTickets.length === 0 && managedProjects.length === 0 &&(
                <p className="text-muted-foreground text-center py-4">No activity found for this user.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
