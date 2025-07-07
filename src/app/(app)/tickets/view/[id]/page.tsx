'use client';

import { tickets, users } from "@/lib/data";
import { notFound, useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, ArrowLeft, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const priorityVariantMap: { [key: string]: string } = {
    'Low': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Urgent': 'bg-red-100 text-red-800 border-red-200',
};

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'New': 'secondary',
  'Active': 'default',
  'Pending': 'outline',
  'On Hold': 'outline',
  'Closed': 'secondary',
  'Terminated': 'destructive',
};

export default function ViewTicketPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), []);
  
  const ticket = tickets.find(t => t.id === params.id);
  
  const [pageDescription, setPageDescription] = React.useState<React.ReactNode | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState(ticket?.status);
  const [currentPriority, setCurrentPriority] = React.useState(ticket?.priority);


  React.useEffect(() => {
    if (ticket) {
      const reporter = userMap.get(ticket.reporter) || { name: ticket.reporter, email: '', avatar: ''};
      const reporterEmail = reporter.email ? `(${reporter.email})` : '';

      setPageDescription(
        <>
          <div>Opened by {reporter.name} {reporterEmail} on {format(new Date(ticket.createdAt), "PPp")}.</div>
          <div>Last updated on {format(new Date(ticket.updatedAt), "PPp")}.</div>
        </>
      );
    }
  }, [ticket, userMap]);
  
  if (!ticket || !currentStatus || !currentPriority) {
    notFound();
  }

  const assignee = userMap.get(ticket.assignee);
  const reporter = userMap.get(ticket.reporter) || { name: ticket.reporter, email: '', avatar: ''};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ticket.title} description={pageDescription}>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">{ticket.description}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Avatar>
                            <AvatarImage src={assignee?.avatar} />
                            <AvatarFallback>{assignee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-semibold">{assignee?.name}</span>
                                <span className="text-xs text-muted-foreground">2 days ago</span>
                            </div>
                            <p className="text-muted-foreground">Hey, I've started looking into this. It seems to be an issue with the latest Safari update. I'll keep you posted.</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="flex gap-3">
                        <Avatar>
                            <AvatarImage src={reporter?.avatar} />
                            <AvatarFallback>{reporter?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-semibold">{reporter?.name}</span>
                                <span className="text-xs text-muted-foreground">1 day ago</span>
                            </div>
                            <p className="text-muted-foreground">Thanks for the update, Maria!</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Add Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Type your response..." className="min-h-24"/>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="ghost">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Smart Reply
                    </Button>
                    <Button>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                    </Button>
                </CardFooter>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ID</span>
                        <code>{ticket.id}</code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-0 h-auto justify-end">
                                    <Badge variant={statusVariantMap[currentStatus] || 'default'} className="cursor-pointer">{currentStatus}</Badge>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.keys(statusVariantMap).map(status => (
                                    <DropdownMenuItem key={status} onSelect={() => setCurrentStatus(status as any)}>
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Priority</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-0 h-auto justify-end">
                                    <Badge className={`font-medium ${priorityVariantMap[currentPriority]}`}>{currentPriority}</Badge>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.keys(priorityVariantMap).map(p => (
                                    <DropdownMenuItem key={p} onSelect={() => setCurrentPriority(p as any)}>
                                        {p}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {ticket.project && (
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Project</span>
                            <span>{ticket.project}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Assignee</span>
                        {assignee ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{assignee.name}</span>
                            </div>
                        ) : (
                            <span>{ticket.assignee}</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reporter</span>
                         {reporter ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={reporter.avatar} alt={reporter.name} />
                                    <AvatarFallback>{reporter.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{reporter.name}</span>
                            </div>
                        ) : (
                            <span>{ticket.reporter}</span>
                        )}
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Updated</span>
                        <span>{format(new Date(ticket.updatedAt), "MMM d, yyyy")}</span>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Tags</CardTitle>
                     <Button variant="ghost" size="sm">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Suggest
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {ticket.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
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
                          Delete Ticket
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            ticket and remove its data from our servers.
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
