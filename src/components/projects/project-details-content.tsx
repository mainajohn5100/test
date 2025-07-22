

'use client';

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Loader,
  MoreVertical,
  Trash2,
  Plus,
  Mail,
  Edit,
  Users,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { inviteUserToProjectAction } from "@/app/(app)/projects/view/[id]/actions";
import type { Project, User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { EditProjectForm } from "./edit-project-form";
import { useAuth } from "@/contexts/auth-context";

const projectStatusVariantMap: { [key: string]: string } = {
  'Active': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  'Completed': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  'New': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

function InviteUserDialog({ projectId, projectName }: { projectId: string, projectName: string }) {
    const { toast } = useToast();
    const [email, setEmail] = React.useState('');
    const [isInviting, startInviteTransition] = React.useTransition();
    const [open, setOpen] = React.useState(false);

    const handleInvite = () => {
        if (!email) return;
        startInviteTransition(async () => {
            const result = await inviteUserToProjectAction(projectId, projectName, email);
            if (result.success) {
                toast({ title: 'Invitation Sent', description: `An invitation has been sent to ${email}.` });
                setOpen(false);
                setEmail('');
            } else {
                toast({ title: 'Invitation Failed', description: result.error, variant: 'destructive' });
            }
        });
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite by Email
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Enter the email address of the person you want to invite. They will receive an email with instructions to join the project.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" disabled={isInviting}>Cancel</Button></DialogClose>
                    <Button onClick={handleInvite} disabled={isInviting || !email}>
                        {isInviting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ProjectDetailsContentProps {
  project: Project;
  userMap: Map<string, User>;
  teamMembers: User[];
  manager: User | undefined;
  assignableUsers: User[];
  clientUsers: User[];
  isCreatorOrAdmin: boolean;
  canEditTeam: boolean;
  canChangeStatus: boolean;
  isUpdating: boolean;
  handleUpdateProject: (updates: Partial<Project>) => void;
  handleDeleteRequest: () => void;
  onProjectUpdate: () => void;
}

interface MemberAvatarProps {
  member: User;
  onRemove: (userId: string) => void;
  canRemove: boolean;
}

const MemberAvatar = ({ member, onRemove, canRemove }: MemberAvatarProps) => {
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  
  const handleRemoveConfirm = () => {
    onRemove(member.id);
    setConfirmOpen(false);
  }

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the project?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm} className="bg-destructive hover:bg-destructive/90">
              Confirm & Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="relative group">
         <Link href={`/users/${member.id}`}>
             <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:ring-2 hover:ring-primary">
                 <AvatarImage src={member.avatar} />
                 <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
             </Avatar>
        </Link>
        {canRemove && (
            <button onClick={() => setConfirmOpen(true)} className="absolute -top-1 -right-1 z-10 p-0.5 bg-background rounded-full hidden group-hover:block hover:bg-destructive-foreground">
                <X className="h-3 w-3 text-destructive" />
                <span className="sr-only">Remove {member.name}</span>
            </button>
        )}
      </div>
    </>
  );
};


export function ProjectDetailsContent({
  project,
  userMap,
  teamMembers,
  manager,
  assignableUsers,
  clientUsers,
  isCreatorOrAdmin,
  canEditTeam,
  canChangeStatus,
  isUpdating,
  handleUpdateProject,
  handleDeleteRequest,
  onProjectUpdate
}: ProjectDetailsContentProps) {
  
  const { user: currentUser } = useAuth();
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  
  const isManager = currentUser?.id === project.manager;
  const isProjectClosed = project.status === 'Completed';

  const stakeholders = project.stakeholders?.map(id => userMap.get(id)).filter(Boolean) as User[] || [];

  const handleTeamChange = (userId: string, isChecked: boolean) => {
    if (!project) return;
    
    const currentTeam = project.team || [];
    const newTeam = isChecked 
        ? [...currentTeam, userId]
        : currentTeam.filter(id => id !== userId);
    
    handleUpdateProject({ team: newTeam });
  };
  
  const handleRemoveMember = (userIdToRemove: string) => {
    if (!project) return;
    const newTeam = project.team.filter(id => id !== userIdToRemove);
    handleUpdateProject({ team: newTeam });
  };

  const handleStakeholderChange = (userId: string, isChecked: boolean) => {
    if (!project) return;
    
    const currentStakeholders = project.stakeholders || [];
    const newStakeholders = isChecked
        ? [...currentStakeholders, userId]
        : currentStakeholders.filter(id => id !== userId);
    
    handleUpdateProject({ stakeholders: newStakeholders });
  };
  
  const handleRemoveStakeholder = (userIdToRemove: string) => {
    if (!project) return;
    const newStakeholders = (project.stakeholders || []).filter(id => id !== userIdToRemove);
    handleUpdateProject({ stakeholders: newStakeholders });
  };


  const truncatedId = `${project.id.substring(0, 5)}...${project.id.slice(-3)}`;

  return (
    <>
    <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Make changes to your project here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <EditProjectForm project={project} onProjectUpdated={() => { setEditDialogOpen(false); onProjectUpdate(); }} />
        </DialogContent>
    </Dialog>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Project Details</CardTitle>
        {isManager && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                <span className="sr-only">Open Menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0 focus:bg-transparent">
                <label htmlFor="tickets-enabled" className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent">
                  <span>Enable Tickets</span>
                  <Switch
                    id="tickets-enabled"
                    checked={project.ticketsEnabled !== false}
                    onCheckedChange={(checked) => handleUpdateProject({ ticketsEnabled: checked })}
                    disabled={isUpdating}
                    aria-label="Toggle ticket creation"
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteRequest} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">ID</span>
          <code>{truncatedId}</code>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-semibold flex items-center">Kes {project.budget?.toLocaleString() ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Deadline</span>
          <span>{format(new Date(project.deadline), "PP")}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isUpdating || !canChangeStatus}>
                <Badge className={`${projectStatusVariantMap[project.status]} cursor-pointer`}>
                  {isUpdating ? <Loader className="h-3 w-3 animate-spin mr-1.5" /> : null}
                  {project.status}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            {canChangeStatus && (
              <DropdownMenuContent align="end">
                {Object.keys(projectStatusVariantMap).map(status => (
                  <DropdownMenuItem key={status} onSelect={() => handleUpdateProject({ status: status as Project['status'] })} disabled={isUpdating}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-2">Project Manager</h4>
          {manager ? (
            <Link href={`/users/${manager.id}`} className="flex items-center gap-2 p-1 -ml-1 rounded-md hover:bg-accent w-fit">
              <Avatar className="h-8 w-8">
                <AvatarImage src={manager.avatar} />
                <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{manager.name}</p>
                <p className="text-xs text-muted-foreground">{manager.email}</p>
              </div>
            </Link>
          ) : (<p className="text-sm text-muted-foreground">Not assigned</p>)}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Team Members</h4>
            {isManager && !isProjectClosed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Team Members</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Add from existing</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {assignableUsers.map(u => (
                    <DropdownMenuCheckboxItem
                      key={u.id}
                      checked={project.team?.includes(u.id)}
                      onCheckedChange={(checked) => handleTeamChange(u.id, checked)}
                      disabled={isUpdating}
                    >
                      {u.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <InviteUserDialog projectId={project.id} projectName={project.name} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
            <div className="flex items-center space-x-2">
                {teamMembers.length > 0 ? (
                    <div className="flex -space-x-2">
                        {teamMembers.map(member => (
                            <MemberAvatar 
                                key={member.id} 
                                member={member}
                                onRemove={handleRemoveMember}
                                canRemove={isManager && !isProjectClosed && member.id !== project.manager}
                            />
                        ))}
                    </div>
                ) : (
                <p className="text-sm text-muted-foreground">No team members assigned.</p>
                )}
            </div>
        </div>
        <Separator />
         <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Stakeholders (Clients)</h4>
            {isManager && !isProjectClosed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Add Stakeholders</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Assign Clients</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {clientUsers.map(u => (
                    <DropdownMenuCheckboxItem
                      key={u.id}
                      checked={project.stakeholders?.includes(u.id)}
                      onCheckedChange={(checked) => handleStakeholderChange(u.id, checked)}
                      disabled={isUpdating}
                    >
                      {u.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
            <div className="flex items-center space-x-2">
                {stakeholders.length > 0 ? (
                    <div className="flex -space-x-2">
                        {stakeholders.map(stakeholder => (
                           <MemberAvatar 
                                key={stakeholder.id} 
                                member={stakeholder}
                                onRemove={handleRemoveStakeholder}
                                canRemove={isManager && !isProjectClosed}
                            />
                        ))}
                    </div>
                ) : (
                <p className="text-sm text-muted-foreground">No clients are associated with this project.</p>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
