
'use client';

import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, Loader, ShieldCheck, Trash2 } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getUserById, getTicketsByAssignee, getTicketsByReporter, getProjectsByManager } from "@/lib/firestore";
import type { User, Ticket, Project } from "@/lib/data";
import { deleteUserAction, updateUserAction } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { updateUserSchema } from "../schema";


const ticketStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

function EditProfileForm({ user, setOpen }: { user: User; setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const onSubmit = (values: z.infer<typeof updateUserSchema>) => {
    startTransition(async () => {
      const result = await updateUserAction(user.id, values);
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message,
        });
        setOpen(false);
        router.refresh(); // This will re-fetch data for the layout and page
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                  <Label htmlFor="avatar-file" className="text-sm font-medium">Profile Photo</Label>
                  <Input id="avatar-file" type="file" className="mt-1" disabled />
                  <p className="text-xs text-muted-foreground pt-1">
                      Avatar updates are not yet supported.
                  </p>
              </div>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();


  const [user, setUser] = React.useState<User | null>(null);
  const [assignedTickets, setAssignedTickets] = React.useState<Ticket[]>([]);
  const [reportedTickets, setReportedTickets] = React.useState<Ticket[]>([]);
  const [managedProjects, setManagedProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);


  React.useEffect(() => {
    if (!params.id) return;
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
  }, [params.id, isEditDialogOpen]);

  const handleDelete = () => {
    if (!user) return;
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result?.error) {
        toast({
          title: "Error deleting user",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "User deleted",
          description: "The user has been permanently deleted.",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    notFound();
  }

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
                  <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">Edit Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <EditProfileForm user={user} setOpen={setEditDialogOpen} />
                    </DialogContent>
                  </Dialog>
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
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            user and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={isPending}
                          >
                             {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
