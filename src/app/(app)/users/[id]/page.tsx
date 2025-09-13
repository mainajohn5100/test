

'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, Mail, Phone, Briefcase, Ticket as TicketIcon, MoreVertical, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getUserById, getTicketsByReporter, getProjectsByManager } from '@/lib/firestore';
import type { User, Ticket, Project } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { updateUserRoleAction } from '../actions';

function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!id || !currentUser) return;
    const userId = Array.isArray(id) ? id[0] : id;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);

        if (!userData || userData.organizationId !== currentUser.organizationId) {
          setUser(null); // Will trigger notFound()
          return;
        }
        
        setUser(userData);
        
        const [ticketData, projectData] = await Promise.all([
          getTicketsByReporter(userData.name),
          getProjectsByManager(userData.id),
        ]);

        setTickets(ticketData);
        setProjects(projectData);

      } catch (error) {
        console.error("Error fetching user profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);
  
  const handleRoleChange = (newRole: 'Admin' | 'Agent' | 'Client') => {
      if (!user || newRole === user.role) return;
      startTransition(async () => {
          const result = await updateUserRoleAction(user.id, newRole);
           if (result.success) {
              toast({ title: 'Role Updated', description: `${user.name}'s role has been changed to ${newRole}.` });
              // Refetch user data to update the view
              const updatedUser = await getUserById(user.id);
              setUser(updatedUser);
          } else {
              toast({ title: 'Update Failed', description: result.error, variant: 'destructive' });
          }
      });
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return notFound();
  }
  
  const recentTickets = tickets.slice(0, 5);
  const recentProjects = projects.slice(0, 5);
  
  const statusVariantMap: { [key: string]: string } = {
    'New': 'bg-blue-100 text-blue-800',
    'Active': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Closed': 'bg-gray-100 text-gray-800',
    'Terminated': 'bg-red-100 text-red-800',
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Profile"
        description={`Details for ${user.name}`}
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="relative">
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.role}</p>
                    </div>
                     <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-600' : ''}>
                          {user.status}
                        </Badge>
                        <Badge variant="secondary">
                           Joined {isValid(new Date(user.createdAt || '')) ? format(new Date(user.createdAt!), 'PP') : '...'}
                        </Badge>
                    </div>
                </CardContent>
                <Separator />
                <CardContent className="pt-6 space-y-3 text-sm">
                     <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone || 'Not provided'}</span>
                    </div>
                </CardContent>
                 {currentUser?.role === 'Admin' && currentUser.id !== user.id && (
                    <CardFooter>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Change Role
                                     {isPending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleRoleChange('Admin')} disabled={user.role === 'Admin' || isPending}>Admin</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange('Agent')} disabled={user.role === 'Agent' || isPending}>Agent</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange('Client')} disabled={user.role === 'Client' || isPending}>Client</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardFooter>
                )}
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TicketIcon className="h-5 w-5"/> Recent Tickets</CardTitle>
                    <CardDescription>Tickets recently reported by {user.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTickets.length > 0 ? recentTickets.map(ticket => (
                                <TableRow key={ticket.id} className="cursor-pointer" onClick={() => router.push(`/tickets/view/${ticket.id}`)}>
                                    <TableCell className="font-medium truncate max-w-xs">{ticket.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusVariantMap[ticket.status]}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No tickets found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
           </Card>
           
           {user.role !== 'Client' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/> Managed Projects</CardTitle>
                    <CardDescription>Projects currently managed by {user.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentProjects.length > 0 ? recentProjects.map(project => (
                                <TableRow key={project.id} className="cursor-pointer" onClick={() => router.push(`/projects/view/${project.id}`)}>
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusVariantMap[project.status]}>{project.status}</Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(project.deadline), 'PP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No managed projects.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
           </Card>
           )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
