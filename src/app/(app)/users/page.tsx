
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Accounts Management"
        description="View all user accounts in the system. New users can be created via the signup page."
      />
      <Card>
        <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Here is a list of all users in the system. Click a user to view their profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    </TableRow>
                ))
              ) : (
                users.map(user => (
                  <TableRow key={user.id} onClick={() => router.push(`/users/${user.id}`)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ))
              )}
              {!loading && users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
