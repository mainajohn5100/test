

'use client'; 

import { notFound, useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, ArrowLeft, Send, Loader, XCircle, File as FileIcon, Image as ImageIcon, MoreVertical, Mail, Link as LinkIcon, KeyRound, Flag, NotebookText, MessageCircleQuestion, MessageSquarePlus, Paperclip } from "lucide-react";
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
import React, { useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { getUsers } from "@/lib/firestore";
import type { Ticket, User, TicketConversation, Attachment } from "@/lib/data";
import { updateTicketAction, deleteTicketAction, addReplyAction } from "./actions";
import { useFormStatus } from 'react-dom';
import { useAuth } from "@/contexts/auth-context";
import  TiptapEditor  from "@/components/tiptap-editor";
import { Switch } from "@/components/ui/switch";
import { collection, query, onSnapshot, orderBy, Timestamp, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/settings-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlaStatus } from "@/components/tickets/sla-status";
import { Textarea } from "@/components/ui/textarea";

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
    const getInitials = (name: string) => {
        if (!name) return '?';
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    return (
         <Card>
            <CardHeader>
                <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={reporter?.avatar} />
                    <AvatarFallback>{getInitials(reporter?.name || ticket.reporter || '?')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-sm">{reporter?.name || ticket.reporter}</p>
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

const getAttachmentSummary = (attachments: Attachment[]) => {
    if (!attachments || attachments.length === 0) return null;
    const photoCount = attachments.filter(att => att.type.startsWith('image/')).length;
    const pdfCount = attachments.filter(att => att.type === 'application/pdf').length;
    const otherCount = attachments.length - photoCount - pdfCount;

    const parts = [];
    if (photoCount > 0) parts.push(`${photoCount} Photo${photoCount > 1 ? 's' : ''}`);
    if (pdfCount > 0) parts.push(`${pdfCount} PDF${pdfCount > 1 ? 's' : ''}`);
    if (otherCount > 0) parts.push(`${otherCount} other file${otherCount > 1 ? 's' : ''}`);
    
    if (parts.length === 0) return null;
    
    return (
        <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
            <Paperclip className="h-4 w-4" />
            <span>{parts.join(', ')}</span>
        </div>
    );
};

const TicketEvent = ({ event, userMapById }: { event: TicketConversation, userMapById: Map<string, User>}) => {
    const author = userMapById.get(event.authorId);
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border">
                {author?.avatar && <AvatarImage src={author.avatar} />}
                <AvatarFallback>{author?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                    <p className="font-sans font-bold text-[14px]">{author?.name || event.authorName}</p>
                    <p className="font-sans text-[12px] text-muted-foreground">{format(new Date(event.createdAt), "MMM d, yyyy 'at' p")}</p>
                </div>
                {event.content && <div 
                    className="font-sans text-muted-foreground text-sm mt-1 prose prose-sm dark:prose-invert max-w-none tiptap-content" 
                    dangerouslySetInnerHTML={{ __html: event.content }}
                />}
                {event.attachments && event.attachments.length > 0 && (
                     <div className="mt-2 flex flex-col items-start gap-2">
                        {event.attachments.map((file, index) => (
                             <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                key={index} 
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline"
                            >
                                <Paperclip className="h-3.5 w-3.5" />
                                {file.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function ImageAttachment({ src }: { src: string }) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <img
            src={src}
            alt="Attachment"
            width={100}
            height={75}
            className="rounded-md object-cover cursor-pointer tiptap-content-image"
          />
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-2">
          <img
            src={src}
            alt="Attachment"
            className="rounded-md object-contain max-h-[80vh] w-full"
          />
        </DialogContent>
      </Dialog>
    );
  }

  const addReplyWithState = async (
    prevState: { success: boolean; error?: string },
    formData: FormData
  ) => {
    return await addReplyAction(formData);
  };

export default function ViewTicketPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { ticketStatuses, cannedResponses } = useSettings();
  const [isPending, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [conversations, setConversations] = React.useState<TicketConversation[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [currentStatus, setCurrentStatus] = React.useState<Ticket['status'] | undefined>();
  const [currentPriority, setCurrentPriority] = React.useState<Ticket['priority'] | undefined>();
  const [currentCategory, setCurrentCategory] = React.useState<Ticket['category'] | undefined>();
  const [currentAssignee, setCurrentAssignee] = React.useState<string | undefined>();
  const [reply, setReply] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [currentTags, setCurrentTags] = React.useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = React.useState(false);
  const [clientCanReply, setClientCanReply] = React.useState(true);
  
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationConfig, setConfirmationConfig] = React.useState<Omit<ConfirmationDialogProps, 'open' | 'onOpenChange' | 'isPending'> | null>(null);

  const [isHeaderShrunk, setHeaderShrunk] = React.useState(false);

  const isMobile = useIsMobile();

  const userMapById = React.useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const userMapByName = React.useMemo(() => new Map(users.map(u => [u.name, u])), [users]);
  const userMapByEmail = React.useMemo(() => new Map(users.filter(u => u.email).map(u => [u.email, u])), [users]);
  const assignableUsers = React.useMemo(() => users.filter(u => u.role === 'Admin' || u.role === 'Agent'), [users]);

  // Initial data fetch for non-realtime data like users
  React.useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getUsers({organizationId: currentUser.organizationId})
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



const [formState, formAction] = useActionState(addReplyWithState, { success: true });


  // useEffect to handle successful form submissions and reset the form 
  React.useEffect(() => {
    if (formState.success && !formState.error) {
        // Reset form on successful submission
        setReply("");
        setFiles([]);
        toast({ title: "Reply added" });
    } else if (!formState.success && formState.error) {
        toast({
            title: "Error",
            description: formState.error,
            variant: 'destructive'
        });
    }
}, [formState, toast]);
  
  if (loading || !currentUser || !ticket) {
    return (
      <div className="flex items-center justify-center h-full">
          <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const assignee = userMapByName.get(currentAssignee || '');
  const reporter = ticket.reporterId ? userMapById.get(ticket.reporterId) : userMapByEmail.get(ticket.reporterEmail);
  const reporterEmail = ticket.reporterEmail || reporter?.email;
  const isTicketClosed = currentStatus === 'Closed' || currentStatus === 'Terminated';
  const canDeleteTicket = currentUser.role === 'Admin';
  const canChangeStatus = currentUser.role === 'Admin' || (currentUser.role === 'Agent' && ticket.assignee === currentUser.name);
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
        const result = await updateTicketAction(ticket.id, { assignee: newAssigneeUser.name }, currentUser.id);
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
        const result = await updateTicketAction(ticket.id, { assignee: 'Unassigned' }, currentUser.id);
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
      const result = await updateTicketAction(ticket.id, { tags: newTags }, currentUser.id);
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
      toast({ title: "Error", description: "Could not suggest tags at this time.", variant: "destructive" });
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
        toast({ title: "Error deleting ticket", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Ticket Deleted", description: "The ticket has been successfully deleted." });
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
     setReply(prev => `${prev}${templateContent}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (fileNameToRemove: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };


  const handleAddReply = () => {
    if ((!reply || !reply.trim()) && files.length === 0) return;
    if (!currentUser || !ticket) return;

    startTransition(async () => {
        const formData = new FormData();
        formData.append('ticketId', ticket.id);
        formData.append('content', reply);
        formData.append('authorId', currentUser.id);
        files.forEach(file => formData.append('attachments', file));

        const result = await addReplyAction(formData);

        if (result.success) {
            setReply("");
            setFiles([]);
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

  // Create a SubmitButton component that uses useFormStatus
function SubmitButton({ reply, files, isPending }: { reply: string; files: File[]; isPending: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = pending || isPending || (!reply.trim() && files.length === 0);
    
    return (
        <Button 
            type="submit"
            style={{ backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
            disabled={isDisabled}
        >
            {(pending || isPending) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Send Reply
        </Button>
    );
}

  
  const canReply = ((currentUser.role === 'Admin' || currentUser.role === 'Agent') || (currentUser.role === 'Client' && clientCanReply)) && !isTicketClosed;
  const detailProps = { ticket, currentStatus, currentPriority, currentCategory, currentAssignee, userMap: userMapByName, canChangePriority, canChangeCategory, handleAssigneeChange, canChangeAssignee, isTicketClosed, isStatusChangeAllowed, handleStatusChange, handlePriorityChange, handleCategoryChange, handleUnassign, isPending, assignableUsers, canDeleteTicket, handleDeleteRequest, currentTags, handleSuggestTags, isSuggestingTags, removeTag, suggestedTags, addTag, isMobile, ticketStatuses };

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
            "transition-all duration-300",
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
        
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden mt-4 md:mt-0">
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_img]:rounded-md [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: ticket.description }} />
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {ticket.attachments.map((file) => (
                                    file.type.startsWith('image/') ? (
                                    <ImageAttachment key={file.name} src={file.url} />
                                    ) : (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" key={file.name}>
                                        <Button variant="outline" size="sm" className="h-auto py-1 px-2">
                                            <FileIcon className="mr-2 h-3.5 w-3.5"/>
                                            {file.name}
                                        </Button>
                                    </a>
                                    )
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {conversations.length > 0 ? (
                            conversations.map((conv) => (
                                <TicketEvent key={conv.id} event={conv} userMapById={userMapById}/>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No replies yet.</p>
                        )}
                    </CardContent>
                </Card>
                


                {canReply && (
    <Card>
        <CardHeader>
            <CardTitle>Add a Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
  <input type="hidden" name="ticketId" value={ticket.id} />
  <input type="hidden" name="authorId" value={currentUser.id} />
  <input type="hidden" name="content" value={reply} />

  <TiptapEditor
    content={reply}
    onChange={setReply}
    placeholder="Type your reply here..."
  />

  {/* File selection input */}
  <input
    type="file"
    name="attachments"
    ref={fileInputRef}
    onChange={handleFileChange}
    className="hidden"
    multiple
    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
  />

  {files.length > 0 && (
    <div className="space-y-2">
      <p className="text-sm font-medium">Attachments:</p>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            <span className="truncate max-w-[150px]">{file.name}</span>
            <button
              type="button"
              onClick={() => removeFile(file.name)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )}

  <div className="flex justify-between items-center">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => fileInputRef.current?.click()}
    >
      <Paperclip className="mr-2 h-4 w-4" />
      Attach File
    </Button>

    <SubmitButton reply={reply} files={files} isPending={isPending} />
  </div>

  {!formState.success && formState.error && (
    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
      Error: {formState.error}
    </div>
  )}
</form>

        </CardContent>
    </Card>
                )}

                 {!canReply && (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground text-center w-full">
                                This ticket is {currentStatus?.toLowerCase()}. Replying has been disabled.
                            </p>
                        </CardContent>
                    </Card>
                )}
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

