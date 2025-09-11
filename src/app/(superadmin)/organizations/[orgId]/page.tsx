
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Calendar, Mail, Send, Loader, Users as UsersIcon, ShieldCheck, Clock, Building, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrgDetails {
    organizationId: string;
    organizationName: string;
    organizationLogoUrl?: string;
    accountCreatedAt: string;
    userCounts: { admins: number, agents: number, clients: number };
    projectCount: number;
    subscriptionPlan?: string;
    subscriptionStatus?: 'Active' | 'Trialing' | 'Past Due' | 'Canceled';
    configuredDomain: string;
    supportInquiryEmail: string;
    primaryAdminName?: string;
}

interface OrgUser {
    userId: string;
    name: string;
    email: string;
    role: 'Admin' | 'Agent' | 'Client';
    status: 'active' | 'disabled';
    lastSeen: string;
}

function MessageAdminDialog({ org }: { org: OrgDetails | null }) {
    const [isPending, startTransition] = useTransition();
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [open, setOpen] = useState(false);

    if (!org) return null;

    const handleSend = () => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/superadmin/organizations/${org.organizationId}/message`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
                    },
                    body: JSON.stringify({ subject, body })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to send message');
                
                toast({ title: 'Message Sent', description: `Email sent to ${org.supportInquiryEmail}.` });
                setOpen(false);
                setSubject('');
                setBody('');
            } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Message Admin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Message to {org.organizationName}</DialogTitle>
                    <DialogDescription>
                        This will send an email to the primary administrator: {org.supportInquiryEmail}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Regarding your account..." value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Type your message here." rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" disabled={isPending}>Cancel</Button></DialogClose>
                    <Button onClick={handleSend} disabled={isPending || !subject || !body}>
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function OrganizationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { orgId } = params;
    const { user: currentUser } = useAuth();
    
    const [org, setOrg] = useState<OrgDetails | null>(null);
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!currentUser || !orgId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [orgResponse, usersResponse] = await Promise.all([
                    fetch(`/api/superadmin/organizations/${orgId}`, {
                        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                    }),
                    fetch(`/api/superadmin/organizations/${orgId}/users`, {
                        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                    })
                ]);
                
                if (!orgResponse.ok) throw new Error('Failed to fetch organization details');
                if (!usersResponse.ok) throw new Error('Failed to fetch user details');

                const orgData = await orgResponse.json();
                const usersData = await usersResponse.json();
                
                setOrg(orgData);
                setUsers(usersData);

            } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, orgId]);
    

    if (loading || !org) {
        return <div className="flex h-full items-center justify-center"><Loader className="h-8 w-8 animate-spin"/></div>
    }
    
    const totalUsers = org.userCounts.admins + org.userCounts.agents + org.userCounts.clients;

    const billingHistory = [
        { date: 'Jul 15, 2024', plan: 'Pro', amount: 299.00, status: 'Paid' },
        { date: 'Jun 15, 2024', plan: 'Pro', amount: 299.00, status: 'Paid' }
    ]

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={org.organizationName}
                description={
                    <div className='flex items-center gap-2'>
                        <span>Organization ID: {org.organizationId}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                }
            >
                <div className="flex items-center gap-2">
                    <MessageAdminDialog org={org} />
                    <Button variant="destructive">Suspend</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex items-start gap-3">
                                <Building className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Plan</p>
                                    <p className="font-medium">{org.subscriptionPlan}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <UsersIcon className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Users</p>
                                    <p className="font-medium">{totalUsers}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Projects</p>
                                    <p className="font-medium">{org.projectCount}</p>
                                </div>
                            </div>
                              <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">{format(new Date(org.accountCreatedAt), 'PP')}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                                    <p className="font-medium">Aug 15, 2024</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-1"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Primary Admin</p>
                                    <p className="font-medium">{org.supportInquiryEmail}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Billing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingHistory.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell><Badge variant="outline">{item.plan}</Badge></TableCell>
                                            <TableCell>${item.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">{item.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {users.map(user => (
                                <div key={user.userId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{user.role}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
