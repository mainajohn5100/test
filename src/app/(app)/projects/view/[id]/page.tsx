

'use client';

import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader, MoreVertical, Ticket as TicketIcon } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { getTicketsByProject, getUsers } from "@/lib/firestore";
import type { Project, Ticket, User, Task } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { updateProjectAction, deleteProjectAction } from "./actions";
import { useAuth } from "@/contexts/auth-context";
import { ProjectTasks } from "@/components/projects/tasks/project-tasks";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectDetailsContent } from "@/components/projects/project-details-content";
import { cn } from "@/lib/utils";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmationWord: string;
  confirmButtonText: string;
  confirmButtonVariant?: "default" | "destructive";
  isPending: boolean;
}

function ConfirmationDialog({ open, onOpenChange, onConfirm, title, description, confirmationWord, confirmButtonText, confirmButtonVariant = 'default', isPending }: ConfirmationDialogProps) {
    const [inputValue, setInputValue] = React.useState('');
    const isMatch = inputValue === confirmationWord;

    React.useEffect(() => {
        if (open) {
            setInputValue('');
        }
    }, [open]);
    
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="confirmation-input" className="text-sm text-muted-foreground">
                        To confirm, please type "<span className="font-bold text-foreground">{confirmationWord}</span>" in the box below.
                    </Label>
                    <Input 
                        id="confirmation-input" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        disabled={!isMatch || isPending}
                        className={cn(confirmButtonVariant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
                    >
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                        {confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export default function ViewProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isUpdating, startTransition] = React.useTransition();

  const [project, setProject] = React.useState<Project | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [associatedTickets, setAssociatedTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationConfig, setConfirmationConfig] = React.useState<Omit<ConfirmationDialogProps, 'open' | 'onOpenChange' | 'isPending'> | null>(null);
  
  const userMap = React.useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const assignableUsers = React.useMemo(() => users.filter(u => u.role === 'Admin' || u.role === 'Agent'), [users]);
  const clientUsers = React.useMemo(() => users.filter(u => u.role === 'Client'), [users]);
  
  const fetchAssociatedData = React.useCallback(async () => {
    if (!params.id || !currentUser) return;
    try {
      const [usersData, ticketsData] = await Promise.all([
        getUsers(currentUser),
        getTicketsByProject(params.id as string),
      ]);
      setUsers(usersData);
      setAssociatedTickets(ticketsData);
    } catch (error) {
      console.error("Failed to fetch associated project data:", error);
      toast({ title: "Error", description: "Could not load associated tickets and users.", variant: "destructive" });
    }
  }, [params.id, currentUser, toast]);

  React.useEffect(() => {
    if (!params.id) return;
    const projectId = params.id as string;
    
    setLoading(true);
    fetchAssociatedData(); // Fetch non-realtime data
    
    const projectDocRef = doc(db, 'projects', projectId);
    const unsubscribe = onSnapshot(projectDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const deadline = data.deadline;
        setProject({ 
            id: docSnap.id, 
            ...data,
            deadline: deadline instanceof Timestamp ? deadline.toDate().toISOString() : deadline,
        } as Project);
      } else {
        notFound();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time project:", error);
      toast({ title: "Real-time Error", description: "Could not fetch project details automatically.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id, fetchAssociatedData, toast]);

  const handleUpdateProject = (updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
     if (!project || !currentUser) return;

    const performUpdate = () => {
        startTransition(async () => {
            const oldProjectState = { ...project };
            setProject(prev => prev ? { ...prev, ...updates } : null);

            const result = await updateProjectAction(project.id, updates, currentUser.id);
            if (result.success) {
                toast({ title: "Project updated!" });
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
                setProject(oldProjectState); // Revert on failure
            }
            setConfirmationOpen(false);
        });
    }

    if (updates.status && project.status === 'Completed' && currentUser.role === 'Admin') {
        setConfirmationConfig({
            onConfirm: performUpdate,
            title: "Reopen this project?",
            description: `This project is currently Completed. Reopening it will change its status to "${updates.status}".`,
            confirmationWord: 'REOPEN',
            confirmButtonText: 'Confirm & Reopen',
        });
        setConfirmationOpen(true);
        return;
    }
    
    performUpdate();
  }

  const handleDeleteProject = () => {
    if (!project) return;
    startTransition(async () => {
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
      }
      setConfirmationOpen(false);
    });
  };

  const handleDeleteRequest = () => {
    setConfirmationConfig({
        onConfirm: handleDeleteProject,
        title: "Are you absolutely sure?",
        description: "This will permanently delete this project and all its associated data. This action cannot be undone.",
        confirmationWord: "DELETE",
        confirmButtonText: "Confirm & Delete",
        confirmButtonVariant: "destructive",
    });
    setConfirmationOpen(true);
  };


  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const manager = userMap.get(project.manager);
  const teamMembers = project.team.map(userId => userMap.get(userId)).filter(Boolean) as User[];
  const isCreatorOrAdmin = currentUser.role === 'Admin' || project.creatorId === currentUser.id;
  const isManager = project.manager === currentUser.id;
  const canEditTeam = isCreatorOrAdmin || isManager;
  
  const canChangeStatus = (currentUser.role === 'Admin' || (project.statusLastSetBy !== 'Admin' && (isCreatorOrAdmin || isManager))) || project.status !== 'Completed';
  const canReopen = currentUser.role === 'Admin' && project.status === 'Completed';


  const detailsProps = {
    project,
    userMap,
    teamMembers,
    manager,
    assignableUsers,
    clientUsers,
    isCreatorOrAdmin,
    canEditTeam,
    canChangeStatus: canChangeStatus || canReopen,
    isUpdating,
    handleUpdateProject,
    handleDeleteRequest,
    onProjectUpdate: fetchAssociatedData
  };

  return (
    <>
      {confirmationConfig && (
        <ConfirmationDialog 
            open={isConfirmationOpen}
            onOpenChange={setConfirmationOpen}
            isPending={isUpdating}
            {...confirmationConfig}
        />
      )}
      <div className="flex flex-col gap-4">
        <PageHeader title={project.name} description={manager ? `Managed by ${manager.name}.` : ''}>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {project.ticketsEnabled !== false && project.status !== 'Completed' && (
                 <Link href={`/tickets/new?project=${encodeURIComponent(project.name)}`} passHref>
                    <Button>
                        <TicketIcon />
                        New Ticket
                    </Button>
                </Link>
            )}
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Project Summary</CardTitle>
                  <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                             <SheetHeader>
                                <SheetTitle>Project Details</SheetTitle>
                            </SheetHeader>
                             <ScrollArea className="h-full pb-10">
                                <div className="space-y-4 pt-4">
                                  <ProjectDetailsContent {...detailsProps} />
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                  </div>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description || "No description was provided for this project."}</p>
              </CardContent>
            </Card>
            
            <ProjectTasks 
                project={project}
                assignableUsers={assignableUsers}
                onTasksUpdate={fetchAssociatedData}
            />

            <AssociatedTicketsCard tickets={associatedTickets} />

          </div>
          <div className="hidden lg:block lg:col-span-1 space-y-4">
             <div className="sticky top-24 space-y-4">
              <ProjectDetailsContent {...detailsProps} />
             </div>
          </div>
        </div>
    </div>
  </>
  );
}

const AssociatedTicketsCard = React.memo(({ tickets }: { tickets: Ticket[] }) => {
  const router = useRouter();
  
  const ticketStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'New': 'secondary',
    'Active': 'default',
    'Pending': 'outline',
    'On Hold': 'outline',
    'Closed': 'secondary',
    'Terminated': 'destructive',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associated Tickets</CardTitle>
        <CardDescription>
          {tickets.length > 0
            ? `Showing ${tickets.length} ticket(s) related to this project.`
            : 'No tickets are currently associated with this project.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
          {tickets.length > 0 ? (
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
                          {tickets.map((ticket) => (
                              <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                                  <TableCell>
                                    <div className="font-medium">{ticket.title}</div>
                                    <div className="text-sm text-muted-foreground">Reported by {ticket.reporter}</div>
                                  </TableCell>
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
  );
});
AssociatedTicketsCard.displayName = "AssociatedTicketsCard";
