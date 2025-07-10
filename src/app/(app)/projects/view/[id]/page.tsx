
'use client';

import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader, MoreVertical, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
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
import { getProjectById, getTicketsByProject, getUsers } from "@/lib/firestore";
import type { Project, Ticket, User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { updateProjectAction, deleteProjectAction } from "./actions";
import { useAuth } from "@/contexts/auth-context";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/settings-context";


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
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { agentCanEditTeam } = useSettings();
  const [isUpdating, startTransition] = React.useTransition();
  const [isDeleting, startDeleteTransition] = React.useTransition();

  const [project, setProject] = React.useState<Project | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [associatedTickets, setAssociatedTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [currentStatus, setCurrentStatus] = React.useState<string | undefined>();
  const [ticketsEnabled, setTicketsEnabled] = React.useState(false);
  
  const userMap = React.useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const assignableUsers = React.useMemo(() => users.filter(u => u.role === 'Admin' || u.role === 'Agent'), [users]);

  React.useEffect(() => {
    if (!params.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectData, usersData] = await Promise.all([
            getProjectById(params.id as string),
            getUsers()
        ]);

        if (projectData) {
          setProject(projectData);
          setCurrentStatus(projectData.status);
          setTicketsEnabled(projectData.ticketsEnabled ?? true);
          const ticketsData = await getTicketsByProject(projectData.name);
          setAssociatedTickets(ticketsData);
        } else {
            notFound();
        }
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleStatusChange = (newStatus: Project['status']) => {
    if (!project) return;
    startTransition(async () => {
        const oldStatus = currentStatus;
        setCurrentStatus(newStatus);
        const result = await updateProjectAction(project.id, { status: newStatus });
        if (result.success) {
            toast({ title: "Project status updated!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentStatus(oldStatus); // Revert on failure
        }
    });
  };

  const handleTicketsEnabledChange = (enabled: boolean) => {
    if (!project) return;
    startTransition(async () => {
        const oldState = ticketsEnabled;
        setTicketsEnabled(enabled);
        const result = await updateProjectAction(project.id, { ticketsEnabled: enabled });
        if (result.success) {
            toast({ title: "Project settings updated!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setTicketsEnabled(oldState); // Revert on failure
        }
    });
  };

  const handleTeamChange = (userId: string, isChecked: boolean) => {
    if (!project) return;
    
    const currentTeam = project.team || [];
    const newTeam = isChecked 
        ? [...currentTeam, userId]
        : currentTeam.filter(id => id !== userId);
    
    startTransition(async () => {
        const result = await updateProjectAction(project.id, { team: newTeam });
        if (result.success) {
            toast({ title: "Team updated successfully!" });
            setProject(prev => prev ? { ...prev, team: newTeam } : null);
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    });
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    startDeleteTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result?.error) {
        toast({
          title: "Error deleting project",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Project Deleted",
          description: "The project has been successfully deleted.",
        });
        // Redirect is handled in the action
      }
    });
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project || !currentStatus) {
    notFound();
  }

  const manager = userMap.get(project.manager);
  const teamMembers = project.team.map(userId => userMap.get(userId)).filter(Boolean) as User[];
  const isManagerOrAdmin = currentUser.role === 'Admin' || project.manager === currentUser.id;
  const canEditTeam = currentUser.role === 'Admin' || (currentUser.role === 'Agent' && agentCanEditTeam);
  
  return (
    <AlertDialog>
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
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description || "No description was provided for this project."}</p>
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
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle>Project Details</CardTitle>
                      {isManagerOrAdmin && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                    <span className="sr-only">Open Menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0 focus:bg-transparent">
                                    <label htmlFor="tickets-enabled" className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent">
                                        <span>Enable Tickets</span>
                                        <Switch
                                            id="tickets-enabled"
                                            checked={ticketsEnabled}
                                            onCheckedChange={handleTicketsEnabledChange}
                                            disabled={isUpdating}
                                            aria-label="Toggle ticket creation"
                                        />
                                    </label>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ID</span>
                          <code>{project.id}</code>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status</span>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isUpdating || !isManagerOrAdmin}>
                                      <Badge className={`${projectStatusVariantMap[currentStatus]} cursor-pointer`}>
                                        {isUpdating ? <Loader className="h-3 w-3 animate-spin mr-1.5"/> : null}
                                        {currentStatus}
                                      </Badge>
                                  </Button>
                              </DropdownMenuTrigger>
                              {isManagerOrAdmin && (
                                  <DropdownMenuContent align="end">
                                      {Object.keys(projectStatusVariantMap).map(status => (
                                          <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status as any)} disabled={isUpdating}>
                                              {status}
                                          </DropdownMenuItem>
                                      ))}
                                  </DropdownMenuContent>
                              )}
                          </DropdownMenu>
                      </div>
                       <Separator />
                       <div className="space-y-2">
                          <span className="text-sm font-medium">Project Manager</span>
                          {manager && (
                            <Link href={`/users/${manager.id}`} className="block">
                              <div className="flex items-center gap-2 hover:bg-muted p-1 rounded-md">
                                  <Avatar className="h-6 w-6">
                                      <AvatarImage src={manager.avatar} alt={manager.name} />
                                      <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span>{manager.name}</span>
                              </div>
                            </Link>
                          )}
                      </div>
                      <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Team Members</span>
                            {canEditTeam && (
                               <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                        <PlusCircle className="h-4 w-4" />
                                        <span className="sr-only">Add Team Members</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Assign Team Members</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {assignableUsers.map(u => (
                                        <DropdownMenuCheckboxItem
                                            key={u.id}
                                            checked={project.team.includes(u.id)}
                                            onCheckedChange={(checked) => handleTeamChange(u.id, checked)}
                                            disabled={isUpdating || u.id === project.manager}
                                        >
                                            {u.name}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                          </div>
                           <TooltipProvider>
                              <div className="flex flex-wrap gap-1 pt-1">
                                  {teamMembers.map(member => (
                                      <Tooltip key={member.id}>
                                          <TooltipTrigger asChild>
                                            <Link href={`/users/${member.id}`}>
                                              <Avatar className="h-8 w-8">
                                                  <AvatarImage src={member.avatar} alt={member.name} />
                                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                              </Avatar>
                                            </Link>
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
          </div>
        </div>
      </div>
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
          <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteProject}
              disabled={isDeleting}
          >
              {isDeleting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
          </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
