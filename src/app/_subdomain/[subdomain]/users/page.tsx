

'use client';

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { Loader, ShieldAlert, PlusCircle, MoreVertical, ShieldCheck, ShieldClose, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateUserForm } from "./create-user-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, differenceInMinutes, isValid } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { updateUserStatusAction } from "./actions";
import { cn } from "@/lib/utils";

const UserTableRowActions = ({ user, currentUser }: { user: User, currentUser: User }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();
    const [isConfirmOpen, setConfirmOpen] = React.useState(false);

    const handleStatusChange = () => {
        startTransition(async () => {
            const newStatus = user.status === 'active' ? 'disabled' : 'active';
            const result = await updateUserStatusAction(user.id, newStatus);
            if (result.success) {
                toast({ title: 'Status Updated', description: `User account has been ${newStatus}.` });
                // The page will refetch data, so no need to update state here.
                setConfirmOpen(false);
            } else {
                toast({ title: 'Update Failed', description: result.error, variant: 'destructive' });
            }
        });
    }

    if (user.id === currentUser.id) {
        return null; // Don't show menu for the current user
    }

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {user.status === 'active' ? 'disable' : 'enable'} the user's account. 
                            {user.status === 'active' && ' They will be logged out and unable to access the application.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStatusChange} disabled={isPending} className={user.status === 'active' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                             {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                             Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                        View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setConfirmOpen(true)} className={user.status === 'active' ? "text-destructive focus:bg-destructive/10" : ""}>
                        {user.status === 'active' ? (
                            <>
                                <ShieldClose className="mr-2 h-4 w-4" />
                                <span>Disable Account</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Enable Account</span>
                            </>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

const UserTable = ({ users, role, currentUser }: { users: User[], role: 'Admin' | 'Agent' | 'Client', currentUser: User }) => {
    const router = useRouter();

    const renderLastSeen = (user: User) => {
        if (!user.lastSeen) return <span className="text-muted-foreground">Never</span>;
        
        const lastSeenDate = new Date(user.lastSeen);
        if (!isValid(lastSeenDate)) return <span className="text-muted-foreground">...</span>;
        
        const minutesAgo = differenceInMinutes(new Date(), lastSeenDate);
        if (minutesAgo < 3) {
            return <span className="flex items-center gap-2 text-green-600"><div className="h-2 w-2 rounded-full bg-green-600 animate-pulse"/>Online</span>
        }
        
        return <span className="text-muted-foreground">{formatDistanceToNow(lastSeenDate, { addSuffix: true })}</span>;
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        {role === 'Agent' && <TableHead>Last Seen</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <TableRow
                                key={user.id}
                                onClick={() => router.push(`/users/${user.id}`)}
                                className="cursor-pointer"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{user.role}</Badge>
                                        {user.createdByAdmin && user.role === 'Client' && (
                                            <Badge variant="secondary" className="font-normal">
                                                <UserCheck className="h-3 w-3 mr-1.5" />
                                                Managed
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                {role === 'Agent' && (
                                    <TableCell>
                                        {renderLastSeen(user)}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'} className={cn(user.status === 'active' && 'text-green-700 border-green-500/50 bg-green-500/10 hover:bg-green-500/20')}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <UserTableRowActions user={user} currentUser={currentUser} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={role === 'Agent' ? 5 : 4} className="h-24 text-center">
                                No {role.toLowerCase()}s found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};


export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateUserOpen, setCreateUserOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("agents");

  React.useEffect(() => {
    if (!currentUser || !currentUser.organizationId) {
      if (!currentUser && !loading) {
      }
      return;
    }
    
    if (currentUser.role !== 'Admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("organizationId", "==", currentUser.organizationId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => {
            const data = doc.data();
            const lastSeen = data.lastSeen as Timestamp;
            return { 
                id: doc.id,
                ...data,
                lastSeen: lastSeen ? lastSeen.toDate().toISOString() : undefined,
             } as User;
        });
        setUsers(usersData);
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch real-time users:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);
  
  const admins = React.useMemo(() => users.filter(u => u.role === 'Admin'), [users]);
  const agents = React.useMemo(() => users.filter(u => u.role === 'Agent'), [users]);
  const clients = React.useMemo(() => users.filter(u => u.role === 'Client'), [users]);

  if (loading || !currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (currentUser.role !== 'Admin') {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground max-w-sm mt-2">
              You do not have permission to view this page.
            </p>
            <Link href="/dashboard" passHref>
                <Button className="mt-6">Return to Dashboard</Button>
            </Link>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Accounts Management"
        description="View and manage all user accounts in your organization."
      >
        <Dialog open={isCreateUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user and assign them a role. They will receive an email to set their password.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm setOpen={setCreateUserOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
            <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="admins">
            <Card>
                <CardHeader>
                    <CardTitle>Administrators</CardTitle>
                    <CardDescription>Users with full system access.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-40 w-full" /> : <UserTable users={admins} role="Admin" currentUser={currentUser} />}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="agents">
             <Card>
                <CardHeader>
                    <CardTitle>Agents</CardTitle>
                    <CardDescription>Support staff who manage and resolve tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? <Skeleton className="h-40 w-full" /> : <UserTable users={agents} role="Agent" currentUser={currentUser}/>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="clients">
             <Card>
                <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>Users who submit tickets and interact with support.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-40 w-full" /> : <UserTable users={clients} role="Client" currentUser={currentUser} />}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
