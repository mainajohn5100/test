import { tickets, users } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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

export default function ViewTicketPage({ params }: { params: { id: string } }) {
  const ticket = tickets.find(t => t.id === params.id);
  const userMap = new Map(users.map(u => [u.name, u]));
  
  if (!ticket) {
    notFound();
  }

  const assignee = userMap.get(ticket.assignee);
  const reporter = userMap.get(ticket.reporter) || { name: ticket.reporter, email: '', avatar: ''};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ticket.title} description={`Ticket ID: ${ticket.id}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{ticket.description}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
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
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariantMap[ticket.status] || 'default'}>{ticket.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge className={`font-medium ${priorityVariantMap[ticket.priority]}`}>{ticket.priority}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Project</span>
                        <span>{ticket.project}</span>
                    </div>
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
                    <Separator />
                    <div className="space-y-2">
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-2">
                            {ticket.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Smart Reply</CardTitle>
                    <CardDescription>Use AI to generate a contextual reply.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Reply
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
