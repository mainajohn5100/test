
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Building, Calendar, DollarSign, Edit, Mail, Send, Trash2, Users, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Placeholder data - this would come from API calls
const placeholderOrgDetails = {
    id: '1',
    name: 'Innovate Inc.',
    logoUrl: undefined,
    createdAt: '2023-01-15T10:00:00Z',
    nextBillingDate: '2024-08-15T10:00:00Z',
    primaryAdmin: { name: 'Alex Johnson', email: 'alex.j@innovate.com' },
    userCount: 15,
    projectCount: 5,
    billingHistory: [
        { id: 'inv_1', date: '2024-07-15', amount: 99.00, status: 'Paid' },
        { id: 'inv_2', date: '2024-06-15', amount: 99.00, status: 'Paid' },
        { id: 'inv_3', date: '2024-05-15', amount: 99.00, statu: 'Paid' },
    ],
    subscription: { plan: 'Pro', status: 'Active' },
};

function MessageAdminDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Message Admin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Message to Organization Admin</DialogTitle>
                    <DialogDescription>
                        This will send an email to the primary administrator of this organization.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Regarding your account..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Type your message here." rows={6} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button>Send Message</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function OrganizationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { orgId } = params;
    
    // In a real app, you would fetch data based on orgId
    const [org, setOrg] = useState(placeholderOrgDetails);
    const [loading, setLoading] = useState(false);

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={org.name}
                description={`Managing organization ID: ${orgId}`}
            >
                <div className="flex items-center gap-2">
                    <MessageAdminDialog />
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
                                <AvatarImage src={org.logoUrl} alt={org.name} />
                                <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{org.name}</CardTitle>
                                <CardDescription>ID: {org.id}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Account Created</span>
                                <span>{format(new Date(org.createdAt), 'PP')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Next Billing Date</span>
                                <span>{format(new Date(org.nextBillingDate), 'PP')}</span>
                            </div>
                             <Separator />
                             <div className="text-sm">
                                <p className="font-medium">Primary Admin</p>
                                <p className="text-muted-foreground">{org.primaryAdmin.name}</p>
                                <p className="text-muted-foreground text-xs">{org.primaryAdmin.email}</p>
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
                                    <p className="font-bold text-2xl">{org.userCount}</p>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
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
                            <CardTitle>Billing & Subscription</CardTitle>
                            <CardDescription>Manage this organization's plan and view their billing history.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">Current Plan: {org.subscription.plan}</p>
                                    <p className="text-sm text-muted-foreground">Status: <Badge variant={org.subscription.status === 'Active' ? 'default' : 'destructive'}>{org.subscription.status}</Badge></p>
                                </div>
                                <Button variant="outline">Change Plan</Button>
                            </div>
                             <div>
                                <h4 className="font-medium mb-2">Recent Billing History</h4>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {org.billingHistory.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.id}</TableCell>
                                                    <TableCell>{format(new Date(item.date), 'PP')}</TableCell>
                                                    <TableCell>${item.amount.toFixed(2)}</TableCell>
                                                    <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
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
