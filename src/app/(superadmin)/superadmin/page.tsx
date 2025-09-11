
'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, CheckCircle, Users, Briefcase, Loader, Search, MoreVertical, Eye } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// This would come from an API call in a real app
interface OrganizationData {
    id: string;
    name: string;
    logoUrl?: string;
    billingStatus: 'Active' | 'Trialing' | 'Past Due' | 'Canceled';
    onlineStatus: 'Online' | 'Offline';
    lastActivity: string; // ISO string
    nextBillingDate: string; // ISO string
}

const placeholderOrganizations: OrganizationData[] = [
    {id: '1', name: 'Innovate Inc.', logoUrl: undefined, billingStatus: 'Active', onlineStatus: 'Online', lastActivity: new Date().toISOString(), nextBillingDate: '2024-08-15' },
    {id: '2', name: 'Solutions Corp', logoUrl: undefined, billingStatus: 'Trialing', onlineStatus: 'Offline', lastActivity: '2024-07-20T10:00:00Z', nextBillingDate: '2024-07-30' },
    {id: '3', name: 'Synergy Group', logoUrl: undefined, billingStatus: 'Past Due', onlineStatus: 'Offline', lastActivity: '2024-07-18T15:30:00Z', nextBillingDate: '2024-07-15' },
];


function RecentActivityTable() {
    const [organizations] = useState<OrganizationData[]>(placeholderOrganizations);

    const billingStatusVariant: Record<OrganizationData['billingStatus'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'Active': 'default',
        'Trialing': 'secondary',
        'Past Due': 'destructive',
        'Canceled': 'outline'
    };
    
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Billing Status</TableHead>
                        <TableHead>Online Status</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Next Billing Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map(org => (
                        <TableRow key={org.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={org.logoUrl} alt={org.name} />
                                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{org.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={billingStatusVariant[org.billingStatus]}>{org.billingStatus}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${org.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    {org.onlineStatus}
                                </div>
                            </TableCell>
                            <TableCell>{formatDistanceToNow(new Date(org.lastActivity), { addSuffix: true })}</TableCell>
                            <TableCell>{format(new Date(org.nextBillingDate), 'PP')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}


export default function SuperAdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrganizations: 5,
        activeSubscriptions: 4,
        totalProjects: 233,
        totalUsers: 725,
    });
    
    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const statCards = [
        { title: "Total Organizations", value: stats.totalOrganizations, icon: Building, description: "All organizations on the platform" },
        { title: "Active Subscriptions", value: stats.activeSubscriptions, icon: CheckCircle, description: "Organizations with an active plan" },
        { title: "Total Projects", value: stats.totalProjects, icon: Briefcase, description: "Sum of all projects created" },
        { title: "Total Users", value: stats.totalUsers, icon: Users, description: "Total registered users" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Dashboard"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {loading ? (
                                <>
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-4 w-32 mt-2" />
                                </>
                             ) : (
                                <>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {card.description}
                                    </p>
                                </>
                             )}
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid grid-cols-1">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Top 10 most recently active organizations.
                                </CardDescription>
                            </div>
                            <Button variant="outline">View All</Button>
                        </div>
                         <div className="flex items-center gap-2 pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Filter by name..." className="pl-9" />
                            </div>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Billing Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="trialing">Trialing</SelectItem>
                                    <SelectItem value="past-due">Past Due</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Online Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="flex h-40 items-center justify-center">
                                <Loader className="h-6 w-6 animate-spin" />
                             </div>
                        ) : (
                            <RecentActivityTable />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

    