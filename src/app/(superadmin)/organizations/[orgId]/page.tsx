
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Building, Calendar, DollarSign, Edit, Mail, Send, Trash2, Users, Loader, ShieldCheck } from 'lucide-react';
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
                <Button>
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
    const [loading, setLoading] = useState(true);
    const [isUpdating, startUpdateTransition] = useTransition();

    const [plan, setPlan] = useState('');
    const [status, setStatus] = useState('');


    useEffect(() => {
        if (!currentUser || !orgId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const orgResponse = await fetch(`/api/superadmin/organizations/${orgId}`, {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                });

                if (!orgResponse.ok) throw new Error('Failed to fetch organization details');
                const orgData = await orgResponse.json();
                setOrg(orgData);
                setPlan(orgData.subscriptionPlan || 'Free');
                setStatus(orgData.subscriptionStatus || 'Active');

            } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, orgId]);
    
    const handleUpdateSubscription = () => {
        if (!org) return;
        startUpdateTransition(async () => {
            try {
                const response = await fetch(`/api/superadmin/organizations/${orgId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
                    },
                    body: JSON.stringify({ subscriptionPlan: plan, subscriptionStatus: status })
                });

                if (!response.ok) throw new Error('Failed to update subscription');
                
                toast({ title: 'Subscription Updated' });
                // Re-fetch data to reflect changes
                const updatedOrg = await fetch(`/api/superadmin/organizations/${orgId}`, {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                }).then(res => res.json());
                setOrg(updatedOrg);
            } catch (error: any) {
                 toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        });
    };


    if (loading || !org) {
        return <div className="flex h-full items-center justify-center"><Loader className="h-8 w-8 animate-spin"/></div>
    }

    const totalUsers = org.userCounts.admins + org.userCounts.agents + org.userCounts.clients;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={org.organizationName}
                description={`Managing organization ID: ${org.organizationId}`}
            >
                <div className="flex items-center gap-2">
                    <MessageAdminDialog org={org} />
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Organizations
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={org.organizationLogoUrl} alt={org.organizationName} />
                                <AvatarFallback>{org.organizationName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{org.organizationName}</CardTitle>
                                <CardDescription>Domain: {org.configuredDomain}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Account Created</span>
                                <span>{format(new Date(org.accountCreatedAt), 'PP')}</span>
                            </div>
                            <Separator />
                             <div className="text-sm">
                                <p className="font-medium">Primary Admin Email</p>
                                <p className="text-muted-foreground">{org.supportInquiryEmail}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Usage Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Users className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <p className="font-bold text-2xl">{totalUsers}</p>
                                    <p className="text-sm text-muted-foreground">{org.userCounts.admins} A / {org.userCounts.agents} A / {org.userCounts.clients} C</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <p className="font-bold text-2xl">{org.projectCount}</p>
                                    <p className="text-sm text-muted-foreground">Total Projects</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Subscription Management</CardTitle>
                            <CardDescription>Manage this organization's plan and billing status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between rounded-lg border p-4">
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label>Subscription Plan</Label>
                                        <Select value={plan} onValueChange={setPlan}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Free">Free</SelectItem>
                                                <SelectItem value="Pro">Pro</SelectItem>
                                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Billing Status</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Trialing">Trialing</SelectItem>
                                                <SelectItem value="Past Due">Past Due</SelectItem>
                                                <SelectItem value="Canceled">Canceled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleUpdateSubscription} disabled={isUpdating} className="mt-4 md:mt-0">
                                    {isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                                    Update Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Primary Admin</CardTitle>
                            <CardDescription>The main point of contact for {org.organizationName}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-medium">{org.primaryAdminName || 'Not available'}</p>
                                    <p className="text-sm text-muted-foreground">{org.supportInquiryEmail}</p>
                                </div>
                                <Badge variant="secondary">Admin</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between rounded-lg border border-destructive/50 p-4">
                            <div>
                                <p className="font-medium">Suspend Organization</p>
                                <p className="text-sm text-muted-foreground">This will temporarily disable access for all users in the organization.</p>
                            </div>
                            <Button variant="destructive">Suspend</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
