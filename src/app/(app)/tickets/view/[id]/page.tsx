

'use client'; 

import { notFound, useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, ArrowLeft, Send, Loader, XCircle, File as FileIcon, Image as ImageIcon, MoreVertical, Mail, Link as LinkIcon, KeyRound, Flag, NotebookText, MessageCircleQuestion, MessageSquarePlus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { getUsers } from "@/lib/firestore";
import type { Ticket, User, TicketConversation } from "@/lib/data";
import { updateTicketAction, deleteTicketAction, addReplyAction } from "./actions";
import { useAuth } from "@/contexts/auth-context";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Switch } from "@/components/ui/switch";
import { collection, query, onSnapshot, orderBy, Timestamp, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/settings-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TipTapLink from '@tiptap/extension-link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlaStatus } from "@/components/tickets/sla-status";

const categories: Ticket['category'][] = ['General', 'Support', 'Advertising', 'Billing'];

const categoryVariantMap: { [key: string]: string } = {
  'Support': 'bg-blue-100 text-blue-800 border-blue-200',
  'Billing': 'bg-green-100 text-green-800 border-green-200',
  'Advertising': 'bg-orange-100 text-orange-800 border-orange-200',
  'General': 'bg-gray-100 text-gray-800 border-gray-200',
};

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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmationWord: string;
  confirmButtonText: string;
  confirmButtonVariant?: "default" | "destructive";
  isPending: boolean;
}

function ConfirmationDialog({ open, onOpenChange, onConfirm, title, description, confirmationWord, confirmButtonText, confirmButtonVariant = 'default', isPending }: ConfirmationDialogProps) {
    const [inputValue, setInputValue] = React.useState('');
    const isMatch = inputValue === confirmationWord;

    React.useEffect(() => {
        if (open) {
            setInputValue('');
        }
    }, [open]);
    
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="confirmation-input" className="text-sm text-muted-foreground">
                        To confirm, please type "<span className="font-bold text-foreground">{confirmationWord}</span>" in the box below.
                    </Label>
                    <Input 
                        id="confirmation-input" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        disabled={!isMatch || isPending}
                        className={cn(confirmButtonVariant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
                    >
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                        {confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function TicketDetailsCard({ ticket, currentStatus, currentPriority, currentCategory, currentAssignee, userMap, canChangePriority, canChangeCategory, handleAssigneeChange, canChangeAssignee, isTicketClosed, isStatusChangeAllowed, handleStatusChange, handlePriorityChange, handleCategoryChange, handleUnassign, isPending, assignableUsers, canDeleteTicket, handleDeleteRequest, currentTags, handleSuggestTags, isSuggestingTags, removeTag, suggestedTags, addTag, isMobile, ticketStatuses }: any) {
    const assignee = userMap.get(currentAssignee);
    const truncatedId = `${ticket.id.substring(0, 5)}...${ticket.id.slice(-3)}`;
    const { user: currentUser } = useAuth();
    
    const isTagsDisabled = isTicketClosed || !(currentUser.role === 'Admin' || currentUser.role === 'Agent');

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle>{isMobile ? 'Ticket Details' : 'Details'}</CardTitle>
            {canDeleteTicket && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={handleDeleteRequest} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Ticket
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ID</span>
                <code className="text-sm">{truncatedId}</code>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Category</span>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending || !canChangeCategory}>
                    <Badge className={`${categoryVariantMap[currentCategory]} cursor-pointer`}>
                        {isPending && <Loader className="mr-1.5 h-3 w-3 animate-spin" />}
                        {currentCategory}
                    </Badge>
                    </Button>
                </DropdownMenuTrigger>
                {canChangeCategory && (
                    <DropdownMenuContent align="end">
                    {categories.map(c => (
                        <DropdownMenuItem key={c} onSelect={() => handleCategoryChange(c)} disabled={isPending}>
                        {c}
                        </DropdownMenuItem>
                    ))}
                    </DropdownMenuContent>
                )}
                </DropdownMenu>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending || !isStatusChangeAllowed}>
                    <Badge variant={statusVariantMap[currentStatus] || 'default'}>
                        {isPending && <Loader className="mr-1.5 h-3 w-3 animate-spin" />}
                        {currentStatus}
                    </Badge>
                    </Button>
                </DropdownMenuTrigger>
                {isStatusChangeAllowed && (
                    <DropdownMenuContent align="end">
                        {ticketStatuses.map((status: string) => (
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
                    <Button variant="ghost" className="p-0 h-auto justify-end" disabled={isPending || !canChangePriority}>
                    <Badge className={`${priorityVariantMap[currentPriority]} cursor-pointer`}>
                        {isPending && <Loader className="mr-1.5 h-3 w-3 animate-spin" />}
                        {currentPriority}
                    </Badge>
                    </Button>
                </DropdownMenuTrigger>
                {canChangePriority && (
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
                    <Button variant="ghost" className="p-0 h-auto justify-end max-w-[150px]" disabled={isPending || !canChangeAssignee}>
                        <div className="flex items-center gap-2 truncate">
                        {assignee && (
                            <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <span className="truncate text-sm">{currentAssignee}</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                {canChangeAssignee && (
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={handleUnassign} disabled={isPending || currentAssignee === 'Unassigned'}>
                            Unassigned
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {assignableUsers.map((u: User) => (
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
                    {currentTags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="group">
                            {tag}
                            {!isTagsDisabled && (
                                <button onClick={() => removeTag(tag)} className="ml-1.5 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </Badge>
                    ))}
                        {!isTagsDisabled && (
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
                                    {suggestedTags.map((tag: string) => (
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
    )
}

function ClientDetailsCard({ ticket, reporter, reporterEmail }: { ticket: Ticket, reporter: User | undefined, reporterEmail: string | undefined }) {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                {reporter && (
                    <Link href={`/users/${reporter.id}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={reporter.avatar} />
                            <AvatarFallback>{ticket.reporter.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                )}
                <div className="flex-1">
                    <p className="font-semibold text-sm">{ticket.reporter}</p>
                    {reporterEmail && (
                        <a href={`mailto:${reporterEmail}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                            <Mail className="h-3 w-3" />
                            {reporterEmail}
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


export default function ViewTicketPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { ticketStatuses, cannedResponses } = useSettings();
  const [isPending, startTransition] = React.useTransition();
  
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [conversations, setConversations] = React.useState<TicketConversation[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [currentStatus, setCurrentStatus] = React.useState<Ticket['status'] | undefined>();
  const [currentPriority, setCurrentPriority] = React.useState<Ticket['priority'] | undefined>();
  const [currentCategory, setCurrentCategory] = React.useState<Ticket['category'] | undefined>();
  const [currentAssignee, setCurrentAssignee] = React.useState<string | undefined>();
  const [reply, setReply] = React.useState("");
  const [currentTags, setCurrentTags] = React.useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = React.useState(false);
  const [clientCanReply, setClientCanReply] = React.useState(true);
  
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationConfig, setConfirmationConfig] = React.useState<Omit<ConfirmationDialogProps, 'open' | 'onOpenChange' | 'isPending'> | null>(null);

  const [isHeaderShrunk, setHeaderShrunk] = React.useState(false);

  const isMobile = useIsMobile();

  const userMap = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);
  const userMapById = React.useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const assignableUsers = React.useMemo(() => users.filter(u => u.role === 'Admin' || u.role === 'Agent'), [users]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type your reply here..." }),
      TipTapLink.configure({ openOnClick: false, autolink: true }),
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none',
      },
    },
    onUpdate({ editor }) {
      setReply(editor.getHTML());
    },
  });

  // Initial data fetch for non-realtime data like users
  React.useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getUsers(currentUser)
      .then(setUsers)
      .catch((error) => {
        console.error("Failed to fetch users", error);
        toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [currentUser, toast]);
  
  // Real-time listener for the main ticket document
  React.useEffect(() => {
    if (!params.id) return;
    const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    // Listener for the main ticket document
    const ticketUnsub = onSnapshot(doc(db, "tickets", ticketId), (doc) => {
      if (doc.exists()) {
        const ticketData = { 
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Ticket;
        
        setTicket(ticketData);
        setCurrentStatus(ticketData.status);
        setCurrentPriority(ticketData.priority);
        setCurrentCategory(ticketData.category);
        setCurrentAssignee(ticketData.assignee);
        setCurrentTags(ticketData.tags || []);
        setClientCanReply(ticketData.clientCanReply ?? true);
      } else {
        notFound();
      }
    });

    // Listener for the conversations sub-collection
    const conversationsQuery = query(collection(db, "tickets", ticketId, "conversations"), orderBy("createdAt", "asc"));
    const conversationsUnsub = onSnapshot(conversationsQuery, (snapshot) => {
        const convos = snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
             } as TicketConversation
        });
        setConversations(convos);
    });

    return () => {
        ticketUnsub();
        conversationsUnsub();
    };
  }, [params.id]);

  // Scroll listener for header shrink effect
  React.useEffect(() => {
    const mainContent = document.querySelector('main');
    if (isMobile || !mainContent) return;

    const handleScroll = () => {
        const threshold = 50;
        setHeaderShrunk(mainContent.scrollTop > threshold);
    };

    mainContent.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, [isMobile]);
  
  if (loading || !currentUser || !ticket) {
    return (
      <div className="flex items-center justify-center h-full">
          <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const assignee = userMap.get(currentAssignee);
  const reporter = userMap.get(ticket.reporter);
  const reporterEmail = ticket.reporterEmail || reporter?.email;
  const isTicketClosed = currentStatus === 'Closed' || currentStatus === 'Terminated';
  
  const canDeleteTicket = currentUser.role === 'Admin';
  
  const canChangeStatus = currentUser.role === 'Admin' || (currentUser.role === 'Agent' && ticket.assignee === currentUser.name);

  // Clients cannot change priority or category after creation.
  const canChangePriority = currentUser.role !== 'Client' && !isTicketClosed;
  const canChangeCategory = currentUser.role !== 'Client' && !isTicketClosed;

  const canChangeAssignee = currentUser.role === 'Admin' && !isTicketClosed;

  const isStatusChangeAllowed = canChangeStatus && (!isTicketClosed || currentUser.role === 'Admin');

  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (!ticket || !isStatusChangeAllowed || !currentUser) return;

    const performUpdate = () => {
      startTransition(async () => {
          const oldStatus = currentStatus;
          setCurrentStatus(newStatus);
          const result = await updateTicketAction(ticket.id, { status: newStatus }, currentUser.id);
          if(result.success) {
              toast({ title: "Status updated successfully!" });
          } else {
              toast({ title: "Error", description: result.error, variant: 'destructive' });
              setCurrentStatus(oldStatus);
          }
          setConfirmationOpen(false);
      });
    };
    
    if (currentUser.role === 'Admin' && isTicketClosed) {
      setConfirmationConfig({
        onConfirm: performUpdate,
        title: "Are you sure you want to reopen this ticket?",
        description: `This ticket is currently ${currentStatus}. Reopening it will change its status to "Active".`,
        confirmationWord: 'REOPEN',
        confirmButtonText: 'Confirm & Reopen',
      });
      setConfirmationOpen(true);
    } else {
      performUpdate();
    }
  };

  const handlePriorityChange = (newPriority: Ticket['priority']) => {
    if (!ticket || !canChangePriority || !currentUser) return;
    startTransition(async () => {
        const oldPriority = currentPriority;
        setCurrentPriority(newPriority);
        const result = await updateTicketAction(ticket.id, { priority: newPriority }, currentUser.id);
        if(result.success) {
            toast({ title: "Priority updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentPriority(oldPriority);
        }
    });
  };
  
  const handleCategoryChange = (newCategory: Ticket['category']) => {
    if (!ticket || !canChangeCategory || !currentUser) return;
    startTransition(async () => {
        const oldCategory = currentCategory;
        setCurrentCategory(newCategory);
        const result = await updateTicketAction(ticket.id, { category: newCategory }, currentUser.id);
        if(result.success) {
            toast({ title: "Category updated successfully!" });
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setCurrentCategory(oldCategory);
        }
    });
  };

  const handleClientReplyToggle = (enabled: boolean) => {
    if (!ticket || !currentUser) return;
    startTransition(async () => {
      const oldState = clientCanReply;
      setClientCanReply(enabled);
      const result = await updateTicketAction(ticket.id, { clientCanReply: enabled }, currentUser.id);
      if (result.success) {
        toast({ title: `Client replies have been ${enabled ? 'enabled' : 'disabled'}.` });
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
        setClientCanReply(oldState);
      }
    });
  };

  const handleAssigneeChange = (newAssigneeUser: User) => {
    if (!ticket || !canChangeAssignee || !currentUser) return;
    startTransition(async () => {
        const oldAssignee = currentAssignee;
        setCurrentAssignee(newAssigneeUser.name);

        const result = await updateTicketAction(
            ticket.id,
            { assignee: newAssigneeUser.name },
            currentUser.id
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
    if (!ticket || !canChangeAssignee || !currentUser) return;
    startTransition(async () => {
        const oldAssignee = currentAssignee;
        setCurrentAssignee('Unassigned');

        const result = await updateTicketAction(
            ticket.id,
            { assignee: 'Unassigned' },
            currentUser.id
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
    if (!ticket || isTicketClosed || !currentUser) return;
    startTransition(async () => {
      const oldTags = [...currentTags];
      setCurrentTags(newTags);

      const result = await updateTicketAction(
        ticket.id,
        { tags: newTags },
        currentUser.id
      );

      if (result.success) {
        toast({ title: 'Tags updated' });
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
        setCurrentTags(oldTags);
      }
    });
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
  
  const handleDeleteTicket = () => {
    if (!ticket) return;
    startTransition(async () => {
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
      setConfirmationOpen(false);
    });
  };
  
  const handleDeleteRequest = () => {
    if (!canDeleteTicket) return;
    setConfirmationConfig({
        onConfirm: handleDeleteTicket,
        title: "Are you absolutely sure?",
        description: "This action cannot be undone. This will permanently delete this ticket and all of its associated data from our servers.",
        confirmationWord: 'DELETE',
        confirmButtonText: 'Confirm & Delete',
        confirmButtonVariant: 'destructive',
    });
    setConfirmationOpen(true);
  };

  const handleTemplateSelect = (templateContent: string) => {
    if (!editor) return;
    editor.commands.insertContent(templateContent);
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
            editor?.commands.clearContent();
            setReply("");
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
  
  const canReply = ((currentUser.role === 'Admin' || currentUser.role === 'Agent') || (currentUser.role === 'Client' && clientCanReply)) && !isTicketClosed;

  const detailProps = { ticket, currentStatus, currentPriority, currentCategory, currentAssignee, userMap, canChangePriority, canChangeCategory, handleAssigneeChange, canChangeAssignee, isTicketClosed, isStatusChangeAllowed, handleStatusChange, handlePriorityChange, handleCategoryChange, handleUnassign, isPending, assignableUsers, canDeleteTicket, handleDeleteRequest, currentTags, handleSuggestTags, isSuggestingTags, removeTag, suggestedTags, addTag, isMobile, ticketStatuses };
  
  return (
    <>
      {confirmationConfig && (
        <ConfirmationDialog
            open={isConfirmationOpen}
            onOpenChange={setConfirmationOpen}
            isPending={isPending}
            {...confirmationConfig}
        />
      )}

      <div className="flex h-full flex-col">
        {/* Main Header */}
        <PageHeader 
          title={ticket.title} 
          description={
             <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>Opened by {reporter?.name || ticket.reporter} on {format(new Date(ticket.createdAt), "PPp")}.</span>
              <span className="hidden sm:inline-block">•</span>
              <span>Last updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}.</span>
            </div>
          }
          className={cn(
            "transition-all duration-300 hidden md:flex",
            isHeaderShrunk && !isMobile && "pb-2 [&>div>h1]:text-xl [&>div>div]:opacity-0"
          )}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
            </Button>
          </div>
        </PageHeader>
        
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 md:gap-6 overflow-hidden mt-4 md:mt-0">
            {/* Left Column (Main content) */}
            <div className="md:col-span-2 flex flex-col overflow-hidden h-full">
                
                {/* Conversation Card */}
                <Card className="flex flex-col flex-1 overflow-hidden shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="flex-1">
                            {/* Mobile Title */}
                            <div className="md:hidden">
                                <h1 className="font-headline text-xl font-bold tracking-tight">{ticket.title}</h1>
                            </div>
                            {/* Desktop Title */}
                            <CardTitle className="hidden md:block">Conversation</CardTitle>
                        </div>
                        {(currentUser.role === 'Admin' || currentUser.role === 'Agent') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 flex-shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0 focus:bg-transparent">
                                        <label htmlFor="client-reply-toggle" className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent">
                                            <span>Client Can Reply</span>
                                            <Switch
                                                id="client-reply-toggle"
                                                checked={clientCanReply}
                                                onCheckedChange={handleClientReplyToggle}
                                                disabled={isPending}
                                                aria-label="Toggle client replies"
                                            />
                                        </label>
                                    </DropdownMenuItem>
                                    {isMobile && <DropdownMenuSeparator />}
                                    {isMobile && 
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <NotebookText className="mr-2 h-4 w-4" />
                                                    <span>View Details</span>
                                                </DropdownMenuItem>
                                            </SheetTrigger>
                                            <SheetContent side="bottom" className="h-[90svh]">
                                                <SheetHeader>
                                                    <SheetTitle>Ticket Details</SheetTitle>
                                                </SheetHeader>
                                                <ScrollArea className="h-full pb-10">
                                                    <div className="space-y-4 pt-4">
                                                    <TicketDetailsCard {...detailProps} />
                                                    <ClientDetailsCard ticket={ticket} reporter={reporter} reporterEmail={reporterEmail} />
                                                    <SlaStatus ticket={ticket} />
                                                    </div>
                                                </ScrollArea>
                                            </SheetContent>
                                        </Sheet>
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden pt-0 px-2 md:px-4 space-y-4">
                        <ScrollArea className="h-full pr-4 -mr-4">
                            <div className="space-y-6">
                                {/* Initial Description */}
                                <div className="flex w-full gap-2 md:gap-4 justify-start">
                                    <div className="flex flex-col gap-1 w-full items-start">
                                        <div className="flex items-center gap-2 flex-row">
                                            {reporter && (
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={reporter.avatar} />
                                                    <AvatarFallback>{reporter.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <span className="text-xs text-muted-foreground">{reporter?.name || ticket.reporter}</span>
                                        </div>
                                        <div className="rounded-lg p-3 text-sm w-fit max-w-[80%] break-words bg-muted/60 border">
                                            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: ticket.description }} />
                                            {ticket.attachments && ticket.attachments.length > 0 && (
                                                <>
                                                    <Separator className="my-3"/>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ticket.attachments.map((file) => (
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" key={file.name}>
                                                                <Button variant="outline" size="sm" className="h-auto py-1 px-2">
                                                                    {file.type.startsWith('image/') ? <ImageIcon className="mr-2 h-3.5 w-3.5"/> : <FileIcon className="mr-2 h-3.5 w-3.5"/>}
                                                                    {file.name}
                                                                </Button>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>

                                {conversations.length > 0 && <Separator />}
                                
                                {conversations.map((conv, idx) => {
                                    const author = userMapById.get(conv.authorId);
                                    const isCurrentUserAuthor = author?.id === currentUser.id;
                                    return (
                                    <div key={idx} className={cn('flex w-full gap-2 md:gap-4', isCurrentUserAuthor ? 'justify-end' : 'justify-start')}>
                                        <div className={cn("flex flex-col gap-1 w-full", isCurrentUserAuthor ? "items-end" : "items-start")}>
                                            <div className={cn("flex items-center gap-2", isCurrentUserAuthor ? "flex-row-reverse" : "flex-row")}>
                                                {author && (
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={author.avatar} />
                                                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className="text-xs text-muted-foreground">{author?.name || 'Unknown User'}</span>
                                            </div>
                                            <div className={cn('rounded-lg p-2 text-sm w-fit max-w-[80%] break-all', isCurrentUserAuthor ? 'bg-primary text-primary-foreground dark:bg-[#0066ff]' : 'bg-muted')}>
                                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: conv.content }} />
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                                {conversations.length === 0 && !ticket.description && (
                                    <p className="text-sm text-center text-muted-foreground py-4">No replies yet.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Reply Section */}
                <div className={cn("bg-background/95 backdrop-blur-sm z-10", isMobile ? "sticky bottom-0 border-t" : "static")}>
                    <div className={cn("p-4", isMobile ? "flex-col items-stretch" : "")}>
                    {canReply ? (
                        <div className="w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Add Reply</h4>
                            {(currentUser.role === 'Admin' || currentUser.role === 'Agent') && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                                            Templates
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <DropdownMenuLabel>Select a Template</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {cannedResponses.length > 0 ? (
                                            cannedResponses.map((res, index) => (
                                                <DropdownMenuItem key={index} onSelect={() => handleTemplateSelect(res.content)}>
                                                    <p className="font-medium truncate">{res.title}</p>
                                                </DropdownMenuItem>
                                            ))
                                        ) : (
                                            <DropdownMenuItem disabled>No templates found.</DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                        <TiptapEditor 
                            editor={editor}
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
                    ) : (
                        <p className="text-sm text-muted-foreground text-center w-full">
                            This ticket is {currentStatus.toLowerCase()}. Replying has been disabled.
                        </p>
                    )}
                    </div>
                </div>
            </div>

            {/* Right Column (Details) - hidden on mobile */}
            <div className="hidden md:block md:col-span-1 space-y-4">
                <TicketDetailsCard {...detailProps} />
                <ClientDetailsCard ticket={ticket} reporter={reporter} reporterEmail={reporterEmail} />
                <SlaStatus ticket={ticket} />
            </div>
        </div>
      </div>
    </>
  );
}
