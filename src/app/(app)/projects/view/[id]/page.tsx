
'use client';

import { projects, users, tickets as allTickets } from "@/lib/data";
import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const projectStatusVariantMap: { [key: string]: string } = {
  'Active': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  'Completed': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  'New': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

const ticketStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

export default function ViewProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userMap = React.useMemo(() => new Map(users.map(u => [u.id, u])), []);

  const project = projects.find(p => p.id === params.id);
  const [currentStatus, setCurrentStatus] = React.useState(project?.status);

  if (!project || !currentStatus) {
    notFound();
  }

  const manager = userMap.get(project.manager);
  const teamMembers = project.team.map(userId => userMap.get(userId)).filter(Boolean) as typeof users;
  const associatedTickets = allTickets.filter(t => t.project === project.name);
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={project.name} description={manager ? `Managed by ${manager.name}. Due on ${format(new Date(project.deadline), "PP")}.` : `Due on ${format(new Date(project.deadline), "PP")}`}>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">A brief summary of the project goals and objectives. This provides a quick overview for anyone looking at the project list.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Associated Tickets</CardTitle>
              <CardDescription>
                {associatedTickets.length > 0
                  ? `Showing ${associatedTickets.length} ticket(s) related to this project.`
                  : 'No tickets are currently associated with this project.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
                {associatedTickets.length > 0 ? (
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
                                {associatedTickets.map((ticket) => (
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
                ) : null}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ID</span>
                        <code>{project.id}</code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-0 h-auto justify-end">
                                    <Badge className={`${projectStatusVariantMap[currentStatus]} cursor-pointer`}>{currentStatus}</Badge>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.keys(projectStatusVariantMap).map(status => (
                                    <DropdownMenuItem key={status} onSelect={() => setCurrentStatus(status as any)}>
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <span className="text-sm font-medium">Project Manager</span>
                        {manager && <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={manager.avatar} alt={manager.name} />
                                <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{manager.name}</span>
                        </div>}
                    </div>
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Team Members</span>
                         <TooltipProvider>
                            <div className="flex flex-wrap gap-1 pt-1">
                                {teamMembers.map(member => (
                                    <Tooltip key={member.id}>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{member.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Deadline</span>
                        <span>{format(new Date(project.deadline), "MMM d, yyyy")}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                    <CardDescription>This action is irreversible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            project and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
