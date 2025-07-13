

'use client';

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/firestore";
import type { User } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { Loader, ShieldAlert, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateUserForm } from "./create-user-form";


export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateUserOpen, setCreateUserOpen] = React.useState(false);

  React.useEffect(() => {
    if (currentUser?.role === 'Admin') {
      const fetchUsers = async () => {
          setLoading(true);
          try {
              const usersData = await getUsers(currentUser);
              setUsers(usersData);
          } catch (error) {
              console.error("Failed to fetch users:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchUsers();
    } else if (currentUser) {
      setLoading(false);
    }
  }, [currentUser, isCreateUserOpen]);

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
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Here is a list of all users in your organization. Click a user to view their profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                         <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
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
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                       <TableCell>
                        Active
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
