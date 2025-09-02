

'use client';

import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust import path as needed

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserById, getTicketsByAssignee, getTicketsByReporter, getProjectsByManager } from "@/lib/firestore";
import type { User, Ticket, Project } from "@/lib/data";
import { EditProfileForm } from "@/components/settings/edit-profile-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateUserRoleAction } from "../actions";

const ticketStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

// Avatar component with Firebase auth check
const SecureAvatar = ({ user, size = "h-16 w-16" }: { user: User; size?: string }) => {
  const [firebaseUser, setFirebaseUser] = React.useState<any>(null);
  const [authLoaded, setAuthLoaded] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Show avatar only if Firebase user is authenticated and matches the profile user
  const shouldShowAvatar = authLoaded && firebaseUser && user.avatar && 
    (user.avatar.includes(firebaseUser.uid) || user.avatar.startsWith('https://'));

  return (
    <Avatar className={size}>
      {shouldShowAvatar ? (
        <AvatarImage 
          src={user.avatar} 
          alt={user.name}
          onError={(e) => {
            console.log('Avatar failed to load:', user.avatar);
            console.log('Firebase user:', firebaseUser?.uid);
          }}
        />
      ) : null}
      <AvatarFallback className="text-xl">
        {user.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const { toast } = useToast();

  const [user, setUser] = React.useState<User | null>(null);
  const [assignedTickets, setAssignedTickets] = React.useState<Ticket[]>([]);
  const [reportedTickets, setReportedTickets] = React.useState<Ticket[]>([]);
  const [managedProjects, setManagedProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!params.id) return;
    
    const handleOpenChange = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
          refreshUser();
        }
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const userData = await getUserById(params.id as string);
            if (userData) {
                setUser(userData);
                const [assigned, reported, managed] = await Promise.all([
                    getTicketsByAssignee(userData.name),
                    getTicketsByReporter(userData.name),
                    getProjectsByManager(userData.id)
                ]);
                setAssignedTickets(assigned);
                setReportedTickets(reported);
                setManagedProjects(managed);
            } else {
                notFound();
            }
        } catch (error) {
            console.error("Failed to fetch user profile data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [params.id, isEditDialogOpen, refreshUser]);
  

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    notFound();
  }
  
  const isOwner = currentUser.id === user.id;
  const isAdmin = currentUser.role === 'Admin';

  if (!isOwner && !isAdmin) {
    // Limited Public View
    return (
        <div className="flex flex-col gap-6">
            <PageHeader title={user.name} description={`Public profile for ${user.email}.`}>
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
                                <SecureAvatar user={user} />
                                <div>
                                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                                    <CardDescription>{user.role}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
                {/* Rest of public view remains the same */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Activity</CardTitle>
                            <CardDescription>A summary of public activity associated with this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.activityIsPublic ? (
                                <div className="space-y-4">
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
                                        <p className="text-muted-foreground text-center py-4">No public activity found for this user.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    This user's activity is private.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  // Full View for Owner or Admin
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
                        <SecureAvatar user={user} />
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.role}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">Edit Profile & Security</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditProfileForm user={user} setOpen={setEditDialogOpen} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
            </Card>

            {currentUser?.role === 'Admin' && (
              <Card>
                  <CardHeader>
                      <CardTitle>Role Management</CardTitle>
                      <CardDescription>Assign or change the user's role.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={updateUserRoleAction} className="space-y-4">
                      <input type="hidden" name="userId" value={user.id} />
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">User Role</span>
                          <select name="role" defaultValue={user.role} className="p-2 border rounded-md" disabled={currentUser.id === user.id}>
                            <option value="Admin">Admin</option>
                            <option value="Agent">Agent</option>
                            <option value="Client">Client</option>
                          </select>
                      </div>
                      <Button type="submit" className="w-full" disabled={currentUser.id === user.id}>
                        Save Role
                      </Button>
                      {currentUser.id === user.id && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">You cannot change your own role.</p>
                      )}
                    </form>
                  </CardContent>
              </Card>
            )}
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>A summary of tickets and projects associated with this user.</CardDescription>
              

            </CardHeader>
            <CardContent>
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
                <div className="mt-4">
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
                 <div className="mt-4">
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
