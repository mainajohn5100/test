
'use client';

import { notFound, useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, ArrowLeft, Send, Loader, XCircle } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { generateSmartReply } from "@/ai/flows/smart-replies";
import { useToast } from "@/hooks/use-toast";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { getTicketById, getUsers } from "@/lib/firestore";
import type { Ticket, User } from "@/lib/data";
import { updateTicketStatusAction } from "./actions";

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
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [pageDescription, setPageDescription] = React.useState<React.ReactNode | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<string | undefined>(undefined);
  const [currentPriority, setCurrentPriority] = React.useState<string | undefined>(undefined);
  const [reply, setReply] = React.useState("");
  const [isSuggestingReply, setIsSuggestingReply] = React.useState(false);
  const [currentTags, setCurrentTags] = React.useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = React.useState(false);

  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const [ticketData, usersData] = await Promise.all([
          getTicketById(params.id as string),
          getUsers()
        ]);

        if (ticketData) {
          setTicket(ticketData);
          setCurrentStatus(ticketData.status);
          setCurrentPriority(ticketData.priority);
          setCurrentTags(ticketData.tags || []);
        } else {
          notFound();
        }
        setUsers(usersData);

      } catch (error) {
        console.error("Failed to fetch ticket or users", error);
        toast({
          title: "Error",
          description: "Could not load ticket data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, toast]);
  

  React.useEffect(() => {
    if (ticket && userMap.size > 0) {
      const reporterUser = userMap.get(ticket.reporter);
      const reporterName = reporterUser ? (
        <Link href={`/users/${reporterUser.id}`} className="font-medium hover:underline">{reporterUser.name}</Link>
      ) : (
        <span className="font-medium">{ticket.reporter}</span>
      );

      setPageDescription(
        <>
          <div>Opened by {reporterName} on {format(new Date(ticket.createdAt), "PPp")}.</div>
          <div>Last updated on {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}.</div>
        </>
      );
    }
  }, [ticket, userMap]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket || !currentStatus || !currentPriority) {
    notFound();
  }
  
  const assignee = userMap.get(ticket.assignee);
  const reporter = userMap.get(ticket.reporter);

  const handleStatusChange = (status: Ticket['status']) => {
    startTransition(async () => {
        setCurrentStatus(status);
        const assigneeId = assignee ? assignee.id : null;
        const result = await updateTicketStatusAction(ticket.id, status, assigneeId, ticket.title);
        if(result.success) {
            toast({ title: "Status updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentStatus(ticket.status); // Revert optimistic update on failure
        }
    });
  };

  const handleSmartReply = async () => {
    setIsSuggestingReply(true);
    try {
      // Note: In a real app, this data would be fetched from the DB
      const userHistory = "No previous tickets for this user.";
      const cannedResponses = "1. Thank you for your patience. We are looking into it.\n2. Could you please provide more details?\n3. This issue has been resolved and the fix will be deployed shortly.";
      
      const conversation = `User: ${ticket.description}`;

      const result = await generateSmartReply({
        ticketContent: conversation,
        userHistory: userHistory,
        cannedResponses: cannedResponses,
      });

      setReply(result.suggestedReply);
    } catch (error) {
      console.error("Error generating smart reply:", error);
      toast({
        title: "Error",
        description: "Could not generate a smart reply.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingReply(false);
    }
  };

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    try {
      const result = await suggestTags({ ticketContent: ticket.description });
      const newSuggestions = result.tags.filter(t => !currentTags.includes(t));
      setSuggestedTags(newSuggestions);
      if (newSuggestions.length === 0) {
        toast({ title: "No new tags to suggest." });
      }
    } catch(e) {
      console.error("Error suggesting tags:", e);
      toast({
        title: "Error",
        description: "Could not suggest tags at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const addTag = (tag: string) => {
    if (!currentTags.includes(tag)) {
      setCurrentTags([...currentTags, tag]);
      setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };


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
                    {/* Conversation history would be rendered here from DB */}
                    <p className="text-sm text-muted-foreground text-center">No conversation history yet.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Add Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                      placeholder="Type your response..." 
                      className="min-h-24"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="ghost" onClick={handleSmartReply} disabled={isSuggestingReply}>
                        {isSuggestingReply ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
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
                                <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending}>
                                    <Badge variant={statusVariantMap[currentStatus] || 'default'} className="cursor-pointer">
                                       {isPending ? <Loader className="h-3 w-3 animate-spin mr-1.5"/> : null}
                                       {currentStatus}
                                    </Badge>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.keys(statusVariantMap).map(status => (
                                    <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status as Ticket['status'])} disabled={isPending}>
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
                                    <Badge className={`font-medium ${priorityVariantMap[currentPriority]} cursor-pointer`}>{currentPriority}</Badge>
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
                          <Link href={`/users/${assignee.id}`} className="block">
                            <div className="flex items-center gap-2 hover:bg-muted p-1 rounded-md -m-1">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{assignee.name}</span>
                            </div>
                          </Link>
                        ) : (
                            <span>{ticket.assignee}</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reporter</span>
                         {reporter ? (
                            <Link href={`/users/${reporter.id}`} className="block">
                                <div className="flex items-center gap-2 hover:bg-muted p-1 rounded-md -m-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={reporter.avatar} alt={reporter.name} />
                                        <AvatarFallback>{reporter.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{reporter.name}</span>
                                </div>
                            </Link>
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
                     <Button variant="ghost" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags}>
                        {isSuggestingTags ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {currentTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1.5">
                              {tag}
                              <XCircle className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                            </Badge>
                        ))}
                    </div>
                    {suggestedTags.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTags.map(tag => (
                              <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>+ {tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
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
