

'use client'; 

import { notFound, useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, ArrowLeft, Send, Loader, XCircle, File as FileIcon, Image as ImageIcon, MoreVertical, Mail } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { generateSmartReply } from "@/ai/flows/smart-replies";
import { useToast } from "@/hooks/use-toast";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { getTicketById, getUsers, getTicketConversations } from "@/lib/firestore";
import type { Ticket, User, TicketConversation } from "@/lib/data";
import { updateTicketAction, deleteTicketAction, addReplyAction } from "./actions";
import { useAuth } from "@/contexts/auth-context";
import { TiptapEditor } from "@/components/tiptap-editor";

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
  const params = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isPending, startTransition] = React.useTransition();
  const [isDeleting, startDeleteTransition] = React.useTransition();
  
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [conversations, setConversations] = React.useState<TicketConversation[]>([]);

  const [pageDescription, setPageDescription] = React.useState<React.ReactNode>(null);
  const [currentStatus, setCurrentStatus] = React.useState<Ticket['status'] | undefined>();
  const [currentPriority, setCurrentPriority] = React.useState<Ticket['priority'] | undefined>();
  const [currentAssignee, setCurrentAssignee] = React.useState<string | undefined>();
  const [reply, setReply] = React.useState("");
  const [isSuggestingReply, setIsSuggestingReply] = React.useState(false);
  const [currentTags, setCurrentTags] = React.useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = React.useState(false);

  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);
  const userMapById = React.useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const assignableUsers = React.useMemo(() => users.filter(u => u.role === 'Agent' || u.role === 'Admin'), [users]);


  const fetchTicketData = React.useCallback(async () => {
    if (!params.id || !currentUser) return;
    setLoading(true);
    try {
      const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
      const [ticketData, usersData, conversationsData] = await Promise.all([
        getTicketById(ticketId),
        getUsers(currentUser),
        getTicketConversations(ticketId)
      ]);

      if (ticketData) {
        setTicket(ticketData);
        setCurrentStatus(ticketData.status);
        setCurrentPriority(ticketData.priority);
        setCurrentAssignee(ticketData.assignee);
        setCurrentTags(ticketData.tags || []);
        setConversations(conversationsData);
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
  }, [params.id, toast, currentUser]);

  React.useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);
  

  React.useEffect(() => {
    if (ticket) {
      const reporterUser = userMap.get(ticket.reporter);
      const reporterName = reporterUser ? (
        <span className="font-medium text-foreground">{reporterUser.name}</span>
      ) : (
        <span className="font-medium text-foreground">{ticket.reporter}</span>
      );

      setPageDescription(
        <div className="flex items-center gap-2 text-sm">
          <span>
            Opened by {reporterName} on {format(new Date(ticket.createdAt), "PPp")}.
          </span>
          <span className="hidden sm:inline-block">•</span>
          <span className="hidden sm:inline-block">
            Last updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}.
          </span>
        </div>
      );
    }
  }, [ticket, userMap]);
  
  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
          <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket || !currentStatus || !currentPriority || typeof currentAssignee === 'undefined') {
    notFound();
  }
  
  const assignee = userMap.get(currentAssignee);
  const reporter = userMap.get(ticket.reporter);
  const reporterEmail = ticket.reporterEmail || reporter?.email;

  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (!ticket) return;
    startTransition(async () => {
        const oldStatus = currentStatus;
        setCurrentStatus(newStatus);
        const result = await updateTicketAction(ticket.id, { status: newStatus }, { oldAssigneeId: assignee?.id ?? null });
        if(result.success) {
            toast({ title: "Status updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentStatus(oldStatus); // Revert optimistic update on failure
        }
    });
  };

  const handlePriorityChange = (newPriority: Ticket['priority']) => {
    if (!ticket) return;
    startTransition(async () => {
        const oldPriority = currentPriority;
        setCurrentPriority(newPriority);
        const result = await updateTicketAction(ticket.id, { priority: newPriority }, { oldAssigneeId: assignee?.id ?? null });
        if(result.success) {
            toast({ title: "Priority updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentPriority(oldPriority); // Revert on failure
        }
    });
  };

  const handleAssigneeChange = (newAssigneeUser: User) => {
    if (!ticket) return;
    startTransition(async () => {
        const oldAssignee = currentAssignee;
        setCurrentAssignee(newAssigneeUser.name);

        const result = await updateTicketAction(
            ticket.id,
            { assignee: newAssigneeUser.name },
            { 
              oldAssigneeId: assignee?.id ?? null,
              newAssignee: newAssigneeUser 
            }
        );

        if (result.success) {
            toast({ title: "Assignee updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentAssignee(oldAssignee);
        }
    });
  };
  
  const handleUnassign = () => {
    if (!ticket) return;
    startTransition(async () => {
        const oldAssignee = currentAssignee;
        setCurrentAssignee('Unassigned');

        const result = await updateTicketAction(
            ticket.id,
            { assignee: 'Unassigned' },
            { 
              oldAssigneeId: assignee?.id ?? null,
              newAssignee: null
            }
        );

        if (result.success) {
            toast({ title: "Ticket unassigned successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentAssignee(oldAssignee);
        }
    });
};

  const updateTags = (newTags: string[]) => {
    if (!ticket) return;
    startTransition(async () => {
      const oldTags = [...currentTags];
      setCurrentTags(newTags);

      const result = await updateTicketAction(
        ticket.id,
        { tags: newTags },
        { oldAssigneeId: assignee?.id ?? null }
      );

      if (result.success) {
        toast({ title: 'Tags updated' });
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
        setCurrentTags(oldTags);
      }
    });
  };

  const handleSmartReply = async () => {
    setIsSuggestingReply(true);
    try {
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
      const newTags = [...currentTags, tag];
      updateTags(newTags);
      setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    updateTags(newTags);
  };
  
  const handleDeleteTicket = async () => {
    if (!ticket) return;
    startDeleteTransition(async () => {
      const result = await deleteTicketAction(ticket.id);
      if (result?.error) {
        toast({
          title: "Error deleting ticket",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ticket Deleted",
          description: "The ticket has been successfully deleted.",
        });
      }
    });
  };

  const handleAddReply = () => {
    if (!reply.trim() || !currentUser || !ticket) return;
    startTransition(async () => {
        const result = await addReplyAction({
            ticketId: ticket.id,
            content: reply,
            authorId: currentUser.id,
        });

        if (result.success) {
            setReply("");
            await fetchTicketData();
            toast({ title: "Reply added" });
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive'
            });
        }
    });
  };

  const canEditTicket = currentUser.role === 'Admin' || currentUser.role === 'Agent';

  return (
    <AlertDialog>
      <div className="flex flex-col gap-6">
        <PageHeader 
          title={ticket.title} 
          description={pageDescription}
        >
          <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: ticket.description }} />

                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <h4 className="font-medium mb-2">Attachments</h4>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((file) => (
                              <a href={file.url} target="_blank" rel="noopener noreferrer" key={file.name}>
                                <Button variant="outline" size="sm">
                                  {file.type.startsWith('image/') ? <ImageIcon className="mr-2 h-4 w-4"/> : <FileIcon className="mr-2 h-4 w-4"/>}
                                  {file.name}
                                </Button>
                              </a>
                          ))}
                        </div>
                      </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Conversation</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="space-y-6">
                      {conversations.map((conv) => {
                        const author = userMapById.get(conv.authorId);
                        const isCurrentUser = author?.id === currentUser.id;
                        return (
                          <div key={conv.id} className={`flex items-start gap-4 ${isCurrentUser ? 'justify-end' : ''}`}>
                             {!isCurrentUser && author && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={author.avatar} />
                                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                            <div className={`flex flex-col max-w-xl ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                               <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: conv.content }} />
                               </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {author?.name || 'Unknown User'} • {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                               </div>
                            </div>
                            {isCurrentUser && author && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={author.avatar} />
                                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                          </div>
                        )
                      })}
                      {conversations.length === 0 && (
                        <p className="text-muted-foreground text-center">No conversation yet.</p>
                      )}
                    </div>
                </CardContent>
                <CardFooter className="pt-6">
                  {canEditTicket && (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                          <h4 className="font-medium">Add Reply</h4>
                          <Button variant="ghost" size="sm" onClick={handleSmartReply} disabled={isSuggestingReply}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isSuggestingReply ? 'Thinking...' : 'Smart Reply'}
                          </Button>
                      </div>
                      <TiptapEditor 
                          content={reply}
                          onChange={setReply}
                          placeholder="Type your reply here..."
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleAddReply} disabled={isPending || !reply.trim()}>
                          {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Add Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle>Details</CardTitle>
                {canEditTicket && (
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 -mr-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ID</span>
                  <code className="text-sm">{ticket.id.substring(0, 6)}...</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending || !canEditTicket}>
                        <Badge variant={statusVariantMap[currentStatus] || 'default'}>
                          {isPending && <Loader className="mr-1.5 h-3 w-3 animate-spin" />}
                          {currentStatus}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    {canEditTicket && (
                        <DropdownMenuContent align="end">
                            {Object.keys(statusVariantMap).map(status => (
                                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status as any)} disabled={isPending}>
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Priority</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending || !canEditTicket}>
                        <Badge className={`${priorityVariantMap[currentPriority]} cursor-pointer`}>
                            {isPending && <Loader className="mr-1.5 h-3 w-3 animate-spin" />}
                            {currentPriority}
                        </Badge>
                       </Button>
                    </DropdownMenuTrigger>
                    {canEditTicket && (
                      <DropdownMenuContent align="end">
                        {Object.keys(priorityVariantMap).map(p => (
                          <DropdownMenuItem key={p} onSelect={() => handlePriorityChange(p as any)} disabled={isPending}>
                            {p}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assignee</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto justify-end max-w-[150px]" disabled={isPending || !canEditTicket}>
                            <div className="flex items-center gap-2 truncate">
                            {assignee && (
                                <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <span className="truncate">{currentAssignee}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    {canEditTicket && (
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={handleUnassign} disabled={isPending || currentAssignee === 'Unassigned'}>
                                Unassigned
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {assignableUsers.map(u => (
                                <DropdownMenuItem key={u.id} onSelect={() => handleAssigneeChange(u)} disabled={isPending}>
                                    {u.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>
                 <div className="flex justify-between items-start">
                    <span className="text-muted-foreground pt-1.5">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                        {currentTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="group">
                                {tag}
                                {canEditTicket && (
                                    <button onClick={() => removeTag(tag)} className="ml-1.5 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </Badge>
                        ))}
                         {canEditTicket && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSuggestTags} disabled={isSuggestingTags}>
                                       {isSuggestingTags ? <Loader className="h-3 w-3 animate-spin"/> : <Sparkles className="h-3 w-3" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                {suggestedTags.length > 0 && (
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Suggested Tags</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {suggestedTags.map(tag => (
                                            <DropdownMenuItem key={tag} onSelect={() => addTag(tag)}>
                                                {tag}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                )}
                            </DropdownMenu>
                        )}
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Client Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {reporter && (
                            <Link href={`/users/${reporter.id}`}>
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={reporter.avatar} />
                                    <AvatarFallback>{ticket.reporter.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                        <div>
                            <p className="font-semibold">{ticket.reporter}</p>
                            {reporterEmail && (
                                <a href={`mailto:${reporterEmail}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                                    <Mail className="h-3 w-3" />
                                    {reporterEmail}
                                </a>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
       <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                ticket and remove its data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={handleDeleteTicket}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
            >
                {isDeleting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
